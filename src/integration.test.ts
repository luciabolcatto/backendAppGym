import 'dotenv/config';
import Stripe from 'stripe';
import http from 'http';
import https from 'https';

type HttpResult = { status: number; body: unknown };

type CreatedEntity = { id: string };

type SeedData = {
  usuario: CreatedEntity & { mail: string; contrasena: string };
  membresia: CreatedEntity;
  clase: CreatedEntity;
};

const REMOTE_BASE_URL =
  process.env.INTEGRATION_BASE_URL || 'https://backendappgym.onrender.com';

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
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(
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

function randomTag() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function extractId(body: unknown): string {
  const candidate = body as { data?: { id?: string }; id?: string };
  const id = candidate?.data?.id || candidate?.id;
  if (!id) {
    throw new Error(`No se pudo leer id de la respuesta: ${JSON.stringify(body)}`);
  }
  return id;
}

async function seedBaseData(baseUrl: string): Promise<SeedData> {
  const tag = randomTag();

  const usuarioPayload = {
    nombre: 'Juan',
    apellido: 'Perez',
    tel: 12345678,
    mail: `test.integration.${tag}@example.com`,
    contrasena: '123456',
  };

  const usuarioResponse = await requestHttp(`${baseUrl}/api/Usuarios`, {
    method: 'POST',
    body: usuarioPayload,
  });

  if (usuarioResponse.status !== 201) {
    throw new Error(`No se pudo crear usuario en remoto: ${JSON.stringify(usuarioResponse.body)}`);
  }

  const actividadResponse = await requestHttp(`${baseUrl}/api/actividad`, {
    method: 'POST',
    body: {
      nombre: `Actividad Test ${tag}`,
      descripcion: 'Actividad para test real remoto',
      cupo: 10,
    },
  });

  if (actividadResponse.status !== 201) {
    throw new Error(`No se pudo crear actividad en remoto: ${JSON.stringify(actividadResponse.body)}`);
  }

  const actividadId = extractId(actividadResponse.body);

  const entrenadorResponse = await requestHttp(`${baseUrl}/api/entrenadores`, {
    method: 'POST',
    body: {
      nombre: 'Ana',
      apellido: 'Coach',
      tel: 12345679,
      mail: `coach.${tag}@example.com`,
      actividades: [actividadId],
    },
  });

  if (entrenadorResponse.status !== 201) {
    throw new Error(`No se pudo crear entrenador en remoto: ${JSON.stringify(entrenadorResponse.body)}`);
  }

  const entrenadorId = extractId(entrenadorResponse.body);

  const fechaInicio = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const fechaFin = new Date(Date.now() + 3 * 60 * 60 * 1000);

  const claseResponse = await requestHttp(`${baseUrl}/api/clases`, {
    method: 'POST',
    body: {
      fecha_hora_ini: fechaInicio.toISOString(),
      fecha_hora_fin: fechaFin.toISOString(),
      cupo_disp: 5,
      entrenador: entrenadorId,
      actividad: actividadId,
    },
  });

  if (claseResponse.status !== 201) {
    throw new Error(`No se pudo crear clase en remoto: ${JSON.stringify(claseResponse.body)}`);
  }

  const membresiaResponse = await requestHttp(`${baseUrl}/api/membresias`, {
    method: 'POST',
    body: {
      nombre: `Mensual ${tag}`,
      descripcion: 'Plan mensual test remoto',
      precio: 10000,
      meses: 1,
    },
  });

  if (membresiaResponse.status !== 201) {
    throw new Error(`No se pudo crear membresia en remoto: ${JSON.stringify(membresiaResponse.body)}`);
  }

  return {
    usuario: {
      id: extractId(usuarioResponse.body),
      mail: usuarioPayload.mail,
      contrasena: usuarioPayload.contrasena,
    },
    membresia: { id: extractId(membresiaResponse.body) },
    clase: { id: extractId(claseResponse.body) },
  };
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

async function waitForContratoPagado(
  baseUrl: string,
  contratoId: string,
  token: string,
  timeoutMs: number
) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await requestHttp(`${baseUrl}/api/Contratos/${contratoId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      const body = response.body as {
        data?: { estado?: string };
      };
      if (body?.data?.estado === 'pagado') {
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    'Stripe cobro la sesion, pero el backend remoto no marco el contrato como pagado.'
  );
}

describe('Integracion real - flujo backend remoto', () => {
  let baseUrl: string;

  beforeAll(async () => {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      throw new Error(
        'Defini STRIPE_SECRET_KEY con una clave real de test (sk_test_...) antes de ejecutar test:integration.'
      );
    }

    baseUrl = REMOTE_BASE_URL;

    const health = await requestHttp(`${baseUrl}/api/clases`, {
      method: 'GET',
    });

    if (health.status < 200 || health.status >= 500) {
      throw new Error(
        `No se pudo alcanzar el backend remoto en ${baseUrl}. Status: ${health.status}`
      );
    }
  });

  it('login -> contratar pendiente -> pagar con tarjeta Stripe real -> reservar (backend remoto)', async () => {
    const { usuario, membresia, clase } = await seedBaseData(baseUrl);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });

    const loginResponse = await requestHttp(`${baseUrl}/api/Usuarios/login`, {
      method: 'POST',
      body: {
        mail: usuario.mail,
        contrasena: usuario.contrasena,
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
    expect(contratarBody.data.contrato.estado).toBe('pendiente');

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
    console.log(`Backend remoto: ${baseUrl}`);
    console.log('Webhook esperado por el backend desplegado (no usar stripe listen local).');
    console.log(`Abrir URL: ${checkoutBody.checkoutUrl}`);
    console.log('Tarjeta test sugerida: 4000000320000021');
    console.log('Completar pago antes de 4 minutos para continuar el test.\n');

    await waitForPaidSession(stripe, checkoutBody.sessionId, 240000);
    await waitForContratoPagado(baseUrl, contratoId, loginBody.token, 180000);

    const reservaResponse = await requestHttp(`${baseUrl}/api/Reservas`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginBody.token}` },
      body: {
        usuario: usuario.id,
        clase: clase.id,
      },
    });

    expect(reservaResponse.status).toBe(201);

    const reservasResponse = await requestHttp(
      `${baseUrl}/api/Reservas?usuario=${usuario.id}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${loginBody.token}` },
      }
    );

    expect(reservasResponse.status).toBe(200);
    const reservasBody = reservasResponse.body as {
      data?: Array<{ clase?: { id?: string }; usuario?: { id?: string } }>;
    };

    const reservaCreada = reservasBody.data?.find(
      (r) => r?.clase?.id === clase.id && r?.usuario?.id === usuario.id
    );
    expect(Boolean(reservaCreada)).toBe(true);
  }, 420000);
});
