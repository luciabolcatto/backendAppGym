import 'reflect-metadata';
import express, { Request, Response } from 'express';
import http from 'http';
import bcrypt from 'bcrypt';
import { RequestContext } from '@mikro-orm/core';
import Stripe from 'stripe';

import { orm } from './shared/db/orm.js';
import { UsuarioRouter } from './usuario/usuario.routes.js';
import { ContratoRouter } from './contrato/contrato.routes.js';
import { ReservaRouter } from './reserva/reserva.routes.js';

import { Usuario } from './usuario/usuario.entity.js';
import { Membresia } from './membresia/membresia.entity.js';
import { Contrato, EstadoContrato } from './contrato/contrato.entity.js';
import { Reserva } from './reserva/reserva.entity.js';
import { Clase } from './clase/clase.entity.js';
import { Actividad } from './actividad/actividad.entity.js';
import { Entrenador } from './entrenador/entrenador.entity.js';

type HttpResult = { status: number; body: unknown };

type SeedData = {
  usuario: Usuario;
  membresia: Membresia;
  clase: Clase;
};

const INTEGRATION_PORT = Number(process.env.INTEGRATION_PORT || '5500');

let StripeRouter: any;
let handleWebhook: (req: Request, res: Response) => Promise<unknown>;

function requestHttp(
  url: string,
  options: {
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  }
): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : '';
    const req = http.request(
      url,
      {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload).toString(),
          ...(options.headers ?? {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: unknown = data;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode ?? 0, body: parsed });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPaidSession(
  stripe: Stripe,
  sessionId: string,
  timeoutMs: number
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      return session;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('No se detecto pago en Stripe dentro del tiempo limite.');
}

async function waitForContratoPagado(contratoId: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const em = orm.em.fork();
    const contrato = await em.findOne(Contrato, { id: contratoId });
    if (contrato?.estado === EstadoContrato.PAGADO) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    'Stripe cobro la sesion, pero no llego webhook real para marcar el contrato como pagado.'
  );
}

async function clearCollections() {
  const em = orm.em.fork();
  await em.nativeDelete(Reserva, {});
  await em.nativeDelete(Contrato, {});
  await em.nativeDelete(Clase, {});
  await em.nativeDelete(Entrenador, {});
  await em.nativeDelete(Actividad, {});
  await em.nativeDelete(Membresia, {});
  await em.nativeDelete(Usuario, {});
}

async function seedBaseData(): Promise<SeedData> {
  const em = orm.em.fork();

  const usuario = em.create(Usuario, {
    nombre: 'Juan',
    apellido: 'Perez',
    tel: 12345678,
    mail: 'test.integration@example.com',
    contrasena: await bcrypt.hash('123456', 10),
  });

  const membresia = em.create(Membresia, {
    nombre: 'Mensual',
    descripcion: 'Plan mensual',
    precio: 10000,
    meses: 1,
  });

  const actividad = em.create(Actividad, {
    nombre: `Actividad Test ${Date.now()}`,
    descripcion: 'Actividad para test real',
    cupo: 10,
  });

  const entrenador = em.create(Entrenador, {
    nombre: 'Ana',
    apellido: 'Coach',
    tel: 12345679,
    mail: `coach.${Date.now()}@example.com`,
    frase: 'Vamos',
    fotoUrl: 'https://example.com/foto.jpg',
  });

  const fechaInicio = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const fechaFin = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const clase = em.create(Clase, {
    fecha_hora_ini: fechaInicio,
    fecha_hora_fin: fechaFin,
    cupo_disp: 5,
    actividad,
    entrenador,
  });

  await em.flush();
  return { usuario, membresia, clase };
}

describe('Integracion real - flujo backend', () => {
  let app: express.Application;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      throw new Error(
        'Defini STRIPE_SECRET_KEY con una clave real de test (sk_test_...) antes de ejecutar test:integration.'
      );
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error(
        'Defini STRIPE_WEBHOOK_SECRET real para firmar el webhook local en test:integration.'
      );
    }

    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret_test';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    const stripeRoutesModule = await import('./stripe/stripe.routes.js');
    const stripeControllerModule = await import('./stripe/stripe.controller.js');
    StripeRouter = stripeRoutesModule.StripeRouter;
    handleWebhook = stripeControllerModule.handleWebhook;

    app = express();

    app.post(
      '/api/stripe/webhook',
      express.raw({ type: 'application/json' }),
      (req: Request, res: Response) => {
        RequestContext.create(orm.em, () => {
          void handleWebhook(req, res);
        });
      }
    );

    app.use(express.json());
    app.use((req, res, next) => {
      RequestContext.create(orm.em, next);
    });

    app.use('/api/Usuarios', UsuarioRouter);
    app.use('/api/Contratos', ContratoRouter);
    app.use('/api/Reservas', ReservaRouter);
    app.use('/api/stripe', StripeRouter);

    await new Promise<void>((resolve, reject) => {
      server = app.listen(INTEGRATION_PORT, () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('No se pudo inicializar servidor de integracion'));
          return;
        }
        baseUrl = `http://127.0.0.1:${INTEGRATION_PORT}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Espera corta para que Stripe CLI entregue eventos en vuelo antes del cierre.
    await sleep(3000);

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await clearCollections();
    await orm.close(true);
  });

  beforeEach(async () => {
    await clearCollections();
  });

  it('login -> contratar pendiente -> pagar con tarjeta Stripe real -> reservar', async () => {
    const { usuario, membresia, clase } = await seedBaseData();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });

    const loginResponse = await requestHttp(`${baseUrl}/api/Usuarios/login`, {
      method: 'POST',
      body: {
        mail: usuario.mail,
        contrasena: '123456',
      },
    });

    expect(loginResponse.status).toBe(200);
    const loginBody = loginResponse.body as { token: string };
    expect(loginBody.token).toBeTruthy();

    const contratarResponse = await requestHttp(`${baseUrl}/api/Contratos/contratar`, {
      method: 'POST',
      body: {
        usuarioId: usuario.id,
        membresiaId: membresia.id,
      },
    });

    expect(contratarResponse.status).toBe(201);
    const contratarBody = contratarResponse.body as {
      data: { contrato: { id: string; estado: string } };
    };
    expect(contratarBody.data.contrato.estado).toBe(EstadoContrato.PENDIENTE);

    const contratoId = contratarBody.data.contrato.id;
    const checkoutResponse = await requestHttp(`${baseUrl}/api/stripe/create-checkout-session`, {
      method: 'POST',
      body: { contratoId },
    });

    expect(checkoutResponse.status).toBe(200);
    const checkoutBody = checkoutResponse.body as {
      checkoutUrl: string;
      sessionId: string;
    };

    expect(checkoutBody.checkoutUrl.includes('stripe')).toBe(true);
    expect(checkoutBody.sessionId.startsWith('cs_')).toBe(true);

    console.log('\n=== PAGO REAL REQUERIDO ===');
    console.log(`Backend test escuchando webhook en: http://127.0.0.1:${INTEGRATION_PORT}/api/stripe/webhook`);
    console.log(`En otra terminal ejecutar: stripe listen --events checkout.session.completed --forward-to http://127.0.0.1:${INTEGRATION_PORT}/api/stripe/webhook`);
    console.log(`Abrir URL: ${checkoutBody.checkoutUrl}`);
    console.log('Tarjeta test sugerida: 4000000320000021');
    console.log('Completar pago antes de 4 minutos para continuar el test.\n');

    await waitForPaidSession(stripe, checkoutBody.sessionId, 240000);
    await waitForContratoPagado(contratoId, 120000);

    const reservaResponse = await requestHttp(`${baseUrl}/api/Reservas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginBody.token}` },
      body: {
        usuario: usuario.id,
        clase: clase.id,
      },
    });

    expect(reservaResponse.status).toBe(201);

    const em = orm.em.fork();
    const contratoPersistido = await em.findOne(Contrato, { id: contratoId });
    const reservasUsuario = await em.find(Reserva, { usuario: usuario.id }, { populate: ['clase', 'usuario'] });

    expect(contratoPersistido?.estado).toBe(EstadoContrato.PAGADO);
    expect(reservasUsuario.length).toBe(1);
    expect(reservasUsuario[0].clase.id).toBe(clase.id);
    expect(reservasUsuario[0].usuario.id).toBe(usuario.id);
  }, 420000); 
});
