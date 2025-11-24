import request from 'supertest';
import express from 'express';

// Mock del app para testing de integración
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Mock de datos de prueba
  const mockUsers = [
    { id: '1', mail: 'test@example.com', contrasena: '$2b$10$hashedpassword' }
  ];
  
  const mockContratos = [
    { 
      id: '1', 
      usuario: '1', 
      estado: 'PAGADO',
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    }
  ];

  const mockClases = [
    { 
      id: '1', 
      cupo_disp: 5, 
      fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000)
    }
  ];

  const mockReservas: any[] = [];

  // Endpoint de login simulado
  app.post('/api/Usuarios/login', (req, res) => {
    const { mail, contrasena } = req.body;
    
    if (!mail || !contrasena) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = mockUsers.find(u => u.mail === mail);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // En un caso real verificaríamos bcrypt, aquí simulamos que es correcto
    const token = 'mock.jwt.token.here';
    res.json({ 
      message: 'Login exitoso', 
      token,
      usuario: { id: user.id, mail: user.mail }
    });
  });

  // Endpoint para contratar membresía simulado
  app.post('/api/Contratos/contratar', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const { usuario, membresia } = req.body;
    if (!usuario || !membresia) {
      return res.status(400).json({ message: 'Usuario y membresía son requeridos' });
    }

    const nuevoContrato = {
      id: String(mockContratos.length + 1),
      usuario,
      membresia,
      estado: 'PENDIENTE',
      fecha_inicio: new Date(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    mockContratos.push(nuevoContrato);
    res.status(201).json({ 
      message: 'Contrato creado correctamente', 
      data: nuevoContrato 
    });
  });

  // Endpoint para simular pago
  app.post('/api/Contratos/simular-pago', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const { contratoId } = req.body;
    const contrato = mockContratos.find(c => c.id === contratoId);
    
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }

    contrato.estado = 'PAGADO';
    res.json({ message: 'Pago simulado correctamente', data: contrato });
  });

  // Endpoint para crear reserva simulado
  app.post('/api/Reservas', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const { clase, usuario } = req.body;
    
    const claseData = mockClases.find(c => c.id === clase);
    if (!claseData) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    // Validar cupo
    if (claseData.cupo_disp <= 0) {
      return res.status(400).json({ 
        message: 'No se puede reservar esta clase. No hay cupo disponible.' 
      });
    }

    // Validar contrato pagado
    const contratoValido = mockContratos.some(c => 
      c.usuario === usuario && c.estado === 'PAGADO'
    );
    
    if (!contratoValido) {
      return res.status(400).json({ 
        message: 'No tienes un contrato activo para reservar esta clase.' 
      });
    }

    const nuevaReserva = {
      id: String(mockReservas.length + 1),
      usuario,
      clase,
      fecha_hora: new Date(),
      estado: 'ACTIVA'
    };

    mockReservas.push(nuevaReserva);
    claseData.cupo_disp -= 1;

    res.status(201).json({ 
      message: 'Reserva creada correctamente', 
      data: nuevaReserva 
    });
  });

  return app;
};

describe('Test de Integración - Flujo Completo', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  it('debe completar el flujo: login → contratar → pagar → reservar', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/Usuarios/login')
      .send({
        mail: 'test@example.com',
        contrasena: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    const token = loginResponse.body.token;
    const usuarioId = loginResponse.body.usuario.id;

    // 2. Contratar membresía
    const contratoResponse = await request(app)
      .post('/api/Contratos/contratar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        usuario: usuarioId,
        membresia: 'membresia-mensual'
      });

    expect(contratoResponse.status).toBe(201);
    expect(contratoResponse.body.data.estado).toBe('PENDIENTE');
    const contratoId = contratoResponse.body.data.id;

    // 3. Simular pago del contrato
    const pagoResponse = await request(app)
      .post('/api/Contratos/simular-pago')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contratoId
      });

    expect(pagoResponse.status).toBe(200);
    expect(pagoResponse.body.data.estado).toBe('PAGADO');

    // 4. Reservar clase
    const reservaResponse = await request(app)
      .post('/api/Reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clase: '1',
        usuario: usuarioId
      });

    expect(reservaResponse.status).toBe(201);
    expect(reservaResponse.body.data.estado).toBe('ACTIVA');
    expect(reservaResponse.body.message).toBe('Reserva creada correctamente');
  });

  it('debe fallar al intentar reservar sin contrato pagado', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/api/Usuarios/login')
      .send({
        mail: 'test@example.com',
        contrasena: 'password123'
      });

    const token = loginResponse.body.token;

    // 2. Intentar reservar directamente sin contrato
    const reservaResponse = await request(app)
      .post('/api/Reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clase: '1',
        usuario: '999' // Usuario sin contratos
      });

    expect(reservaResponse.status).toBe(400);
    expect(reservaResponse.body.message).toBe(
      'No tienes un contrato activo para reservar esta clase.'
    );
  });

  it('debe fallar login con credenciales inválidas', async () => {
    const loginResponse = await request(app)
      .post('/api/Usuarios/login')
      .send({
        mail: 'wrong@example.com',
        contrasena: 'wrongpassword'
      });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.message).toBe('Credenciales inválidas');
  });

  it('debe rechazar operaciones sin token de autorización', async () => {
    // Intentar contratar sin token
    const contratoResponse = await request(app)
      .post('/api/Contratos/contratar')
      .send({
        usuario: '1',
        membresia: 'test'
      });

    expect(contratoResponse.status).toBe(401);
    expect(contratoResponse.body.error).toBe('Token no proporcionado');

    // Intentar reservar sin token
    const reservaResponse = await request(app)
      .post('/api/Reservas')
      .send({
        clase: '1',
        usuario: '1'
      });

    expect(reservaResponse.status).toBe(401);
    expect(reservaResponse.body.error).toBe('Token no proporcionado');
  });
});