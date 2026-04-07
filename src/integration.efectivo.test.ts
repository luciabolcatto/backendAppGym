import 'reflect-metadata';
import express from 'express';
import http from 'http';
import bcrypt from 'bcrypt';
import { RequestContext } from '@mikro-orm/core';

import { orm } from './shared/db/orm.js';
import { UsuarioRouter } from './usuario/usuario.routes.js';
import { ContratoRouter } from './contrato/contrato.routes.js';
import { ReservaRouter } from './reserva/reserva.routes.js';
import { StripeRouter } from './stripe/stripe.routes.js';

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

const INTEGRATION_PORT_EFECTIVO = Number(process.env.INTEGRATION_PORT_EFECTIVO || '5501');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    mail: 'test.integration.cash@example.com',
    contrasena: await bcrypt.hash('123456', 10),
  });

  const membresia = em.create(Membresia, {
    nombre: 'Mensual',
    descripcion: 'Plan mensual',
    precio: 10000,
    meses: 1,
  });

  const actividad = em.create(Actividad, {
    nombre: `Actividad Test Cash ${Date.now()}`,
    descripcion: 'Actividad para test real efectivo',
    cupo: 10,
  });

  const entrenador = em.create(Entrenador, {
    nombre: 'Ana',
    apellido: 'Coach',
    tel: 12345679,
    mail: `coach.cash.${Date.now()}@example.com`,
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

describe('Integracion real - flujo backend pago efectivo', () => {
  let app: express.Application;
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret_test';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

    app = express();

    app.use(express.json());
    app.use((req, res, next) => {
      RequestContext.create(orm.em, next);
    });

    app.use('/api/Usuarios', UsuarioRouter);
    app.use('/api/Contratos', ContratoRouter);
    app.use('/api/Reservas', ReservaRouter);
    app.use('/api/stripe', StripeRouter);

    await new Promise<void>((resolve, reject) => {
      server = app.listen(INTEGRATION_PORT_EFECTIVO, () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('No se pudo inicializar servidor de integracion efectivo'));
          return;
        }
        baseUrl = `http://127.0.0.1:${INTEGRATION_PORT_EFECTIVO}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await sleep(500);

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

  it('login -> contratar pendiente -> pagar efectivo -> reservar', async () => {
    const { usuario, membresia, clase } = await seedBaseData();

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
    const pagoEfectivoResponse = await requestHttp(`${baseUrl}/api/stripe/pagar-efectivo`, {
      method: 'POST',
      body: { contratoId },
    });

    expect(pagoEfectivoResponse.status).toBe(200);

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
  });
});
