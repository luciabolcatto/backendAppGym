import express from 'express';
import http from 'http';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';


const db = {
  usuarios: [] as Array<any>,
  membresias: [] as Array<any>,
  contratos: [] as Array<any>,
  clases: [] as Array<any>,
  reservas: [] as Array<any>,
};

const em = {
  fork: () => ({
    findOne: async (entity: any, where: any) => em.findOne(entity, where),
  }),

  findOne: async (entity: any, where: any) => {
    if (entity === Usuario) {
      if (where.id) return db.usuarios.find((u) => u.id === where.id) || null;
      if (where.mail)
        return db.usuarios.find((u) => u.mail === where.mail) || null;
      return null;
    }

    if (entity === Membresia) {
      return db.membresias.find((m) => m.id === where.id) || null;
    }

    if (entity === Clase) {
      return db.clases.find((c) => c.id === where.id) || null;
    }

    if (entity === Contrato) {
      if (where.id) return db.contratos.find((c) => c.id === where.id) || null;

      if (where.usuario && where.estado?.$in) {
        const userId =
          typeof where.usuario === 'string' ? where.usuario : where.usuario.id;
        return (
          db.contratos
            .filter(
              (c) =>
                c.usuario.id === userId &&
                where.estado.$in.includes(c.estado) &&
                c.fecha_hora_fin > new Date()
            )
            .sort(
              (a, b) => b.fecha_hora_fin.getTime() - a.fecha_hora_fin.getTime()
            )[0] || null
        );
      }
    }

    return null;
  },

  find: async (entity: any, where: any) => {
    if (entity === Contrato) {
      const userId =
        typeof where.usuario === 'string' ? where.usuario : where.usuario?.id;

      if (where.estado === EstadoContrato.PENDIENTE) {
        return db.contratos.filter(
          (c) => c.usuario.id === userId && c.estado === EstadoContrato.PENDIENTE
        );
      }

      if (where.estado === EstadoContrato.PAGADO) {
        return db.contratos.filter(
          (c) => c.usuario.id === userId && c.estado === EstadoContrato.PAGADO
        );
      }
    }

    return [];
  },

  create: (entity: any, data: any) => {
    if (entity === Contrato) {
      const contrato = {
        id: `c${db.contratos.length + 1}`,
        ...data,
      };
      db.contratos.push(contrato);
      return contrato;
    }

    const reserva = {
      id: `r${db.reservas.length + 1}`,
      estado: 'pendiente',
      ...data,
    };
    db.reservas.push(reserva);
    return reserva;
  },

  flush: async () => {
    return;
  },
};

jest.mock('./shared/db/orm.js', () => ({
  orm: {
    em,
  },
}));

jest.mock('stripe', () => {
  const sessions = new Map<string, any>();

  class StripeMock {
    checkout = {
      sessions: {
        create: async (payload: any) => {
          const id = `cs_test_${sessions.size + 1}`;
          const session = {
            id,
            url: `https://checkout.stripe.test/${id}`,
            status: 'open',
            payment_status: 'unpaid',
            metadata: payload.metadata ?? {},
          };
          sessions.set(id, session);
          return session;
        },
        retrieve: async (sessionId: string) => {
          return (
            sessions.get(sessionId) ?? {
              id: sessionId,
              status: 'expired',
              payment_status: 'unpaid',
              metadata: {},
            }
          );
        },
      },
    };

    webhooks = {
      constructEvent: (rawBody: any) => {
        if (Buffer.isBuffer(rawBody)) {
          return JSON.parse(rawBody.toString('utf-8'));
        }
        return rawBody;
      },
    };
  }

  return { __esModule: true, default: StripeMock };
});

import { login } from './usuario/usuario.controler.js';
import { contratarMembresia } from './contrato/contrato.controler.js';
import { add as addReserva } from './reserva/reserva.controler.js';
import { authMiddleware } from './middleware/auth.js';
import { EstadoContrato } from './contrato/contrato.entity.js';
import { Contrato } from './contrato/contrato.entity.js';
import { Usuario } from './usuario/usuario.entity.js';
import { Membresia } from './membresia/membresia.entity.js';
import { Clase } from './clase/clase.entity.js';

function resetDb() {
  db.usuarios = [
    {
      id: 'u1',
      mail: 'test@example.com',
      contrasena: bcrypt.hashSync('123456', 10),
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  ];
  db.membresias = [
    {
      id: 'm1',
      nombre: 'Mensual',
      descripcion: 'Plan mensual',
      meses: 1,
      precio: 10000,
    },
  ];
  db.contratos = [];
  db.clases = [
    {
      id: 'cl1',
      cupo_disp: 5,
      fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  ];
  db.reservas = [];
}

type HttpResult = { status: number; body: any };

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
          let parsed: any = data;
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

describe('Integración - Flujo real', () => {
  let app: express.Application;
  let server: http.Server;
  let baseUrl: string;
  let createCheckoutSessionFn: (req: Request, res: Response) => Promise<any>;
  let handleWebhookFn: (req: Request, res: Response) => Promise<any>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'secret_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

    const stripeController = await import('./stripe/stripe.controller.js');
    createCheckoutSessionFn = stripeController.createCheckoutSession;
    handleWebhookFn = stripeController.handleWebhook;

    app = express();

    app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handleWebhookFn(req, res)).catch(next);
    });

    app.use(express.json());

    app.post('/api/Usuarios/login', login);
    app.post(
      '/api/Contratos/contratar',
      authMiddleware,
      (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(contratarMembresia(req, res)).catch(next);
      }
    );
    app.post(
      '/api/stripe/create-checkout-session',
      (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(createCheckoutSessionFn(req, res)).catch(next);
      }
    );
    app.post('/api/Reservas', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(addReserva(req, res)).catch(next);
    });

    await new Promise<void>((resolve, reject) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('No se pudo obtener puerto dinámico'));
          return;
        }
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll((done) => {
    server.close(() => done());
  });

  beforeEach(() => {
    resetDb();
    jest.clearAllMocks();
  });

  it('debe completar el flujo: login -> contratar(pendiente) -> pagar(pagado) -> reservar', async () => {
    const loginResponse = await requestHttp(`${baseUrl}/api/Usuarios/login`, {
      method: 'POST',
      body: {
        mail: 'test@example.com',
        contrasena: '123456',
      },
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token as string;
    expect(token).toBeDefined();

    const contratarResponse = await requestHttp(`${baseUrl}/api/Contratos/contratar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        usuarioId: 'u1',
        membresiaId: 'm1',
      },
    });

    expect(contratarResponse.status).toBe(201);
    expect(contratarResponse.body.data.contrato.estado).toBe('pendiente');
    const contratoId = contratarResponse.body.data.contrato.id as string;

    expect(db.contratos).toHaveLength(1);
    expect(db.contratos[0].id).toBe(contratoId);
    expect(db.contratos[0].estado).toBe('pendiente');
    expect(db.contratos[0].usuario.id).toBe('u1');
    expect(db.contratos[0].membresia.id).toBe('m1');

    const checkoutResponse = await requestHttp(`${baseUrl}/api/stripe/create-checkout-session`, {
      method: 'POST',
      body: { contratoId },
    });

    expect(checkoutResponse.status).toBe(200);
    expect(checkoutResponse.body.checkoutUrl).toContain('https://checkout.stripe.test/');
    expect(checkoutResponse.body.sessionId).toContain('cs_test_');

    const webhookResponse = await requestHttp(`${baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      headers: { 'stripe-signature': 'test_signature' },
      body: {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { contratoId },
          },
        },
      },
    });

    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body.received).toBe(true);

    const contratoPagado = db.contratos.find((c) => c.id === contratoId);
    expect(contratoPagado?.estado).toBe('pagado');
    const pendientesUsuario = db.contratos.filter(
      (c) => c.usuario.id === 'u1' && c.estado === 'pendiente'
    );
    expect(pendientesUsuario).toHaveLength(0);

    const reservasAntes = db.reservas.length;
    const claseAntes = db.clases.find((c) => c.id === 'cl1');
    const cupoAntes = claseAntes?.cupo_disp ?? 0;

    const reservaResponse = await requestHttp(`${baseUrl}/api/Reservas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        clase: 'cl1',
        usuario: 'u1',
      },
    });

    expect(reservaResponse.status).toBe(201);
    expect(reservaResponse.body.message).toBe('reserva creada');
    expect(db.reservas).toHaveLength(reservasAntes + 1);
    const reserva = db.reservas[db.reservas.length - 1];
    expect(reserva.usuario).toBe('u1');
    expect(reserva.clase).toBe('cl1');
    const claseDespues = db.clases.find((c) => c.id === 'cl1');
    expect(claseDespues?.cupo_disp).toBe(cupoAntes);
  });

  it('debe rechazar la reserva cuando el contrato sigue pendiente (sin pago)', async () => {
    const loginResponse = await requestHttp(`${baseUrl}/api/Usuarios/login`, {
      method: 'POST',
      body: {
        mail: 'test@example.com',
        contrasena: '123456',
      },
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token as string;
    expect(token).toBeDefined();

    const contratarResponse = await requestHttp(`${baseUrl}/api/Contratos/contratar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        usuarioId: 'u1',
        membresiaId: 'm1',
      },
    });

    expect(contratarResponse.status).toBe(201);
    expect(contratarResponse.body.data.contrato.estado).toBe('pendiente');

    const reservasAntes = db.reservas.length;
    const reservaResponse = await requestHttp(`${baseUrl}/api/Reservas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        clase: 'cl1',
        usuario: 'u1',
      },
    });

    expect(reservaResponse.status).toBe(400);
    expect(reservaResponse.body.message).toBe(
      'No tienes un contrato vigente y pagado para la fecha de esta clase.'
    );
    expect(db.reservas).toHaveLength(reservasAntes);
  });

});
