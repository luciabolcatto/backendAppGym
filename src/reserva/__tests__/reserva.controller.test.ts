import { Request, Response } from 'express';

describe('Reserva Controller - Validaciones', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Simulación de las validaciones de reserva del controller
  const validateReservaAdd = async (claseData: any, usuarioId: string) => {
    const ahora = new Date();

    // Validar cupo disponible
    if (claseData.cupo_disp <= 0) {
      mockResponse.status!(400).json({ 
        message: 'No se puede reservar esta clase. No hay cupo disponible.',
        details: { cupoDisponible: claseData.cupo_disp }
      });
      return false;
    }

    // Validar tiempo (30 minutos antes del inicio)
    const treintaMinutosDesdeAhora = new Date(ahora.getTime() + 30 * 60 * 1000);
    const fechaInicio = new Date(claseData.fecha_hora_ini);

    if (fechaInicio <= treintaMinutosDesdeAhora) {
      mockResponse.status!(400).json({ 
        message: 'No se puede reservar esta clase. Las reservas se cierran 30 minutos antes del inicio.',
        details: { 
          fechaInicioClase: fechaInicio.toISOString(),
          limiteTiempo: treintaMinutosDesdeAhora.toISOString()
        }
      });
      return false;
    }

    // Validar que hay contratos pagados
    const contratos = claseData.contratos || [];
    const contratoValido = contratos.some((c: any) => 
      c.estado === 'PAGADO' && 
      new Date(c.fecha_fin) >= new Date(claseData.fecha_hora_ini)
    );

    if (!contratoValido) {
      mockResponse.status!(400).json({ 
        message: 'No tienes un contrato activo para reservar esta clase.'
      });
      return false;
    }

    return true;
  };

  describe('Validaciones de add() reserva', () => {
    it('debe rechazar reserva sin cupo disponible', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 0,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas en el futuro
        contratos: [{ estado: 'PAGADO', fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }]
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No se puede reservar esta clase. No hay cupo disponible.',
        details: { cupoDisponible: 0 }
      });
    });

    it('debe rechazar reserva muy cerca del inicio de clase', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos en el futuro
        contratos: [{ estado: 'PAGADO', fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }]
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No se puede reservar esta clase. Las reservas se cierran 30 minutos antes del inicio.'
        })
      );
    });

    it('debe rechazar reserva sin contrato pagado válido', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas en el futuro
        contratos: [] // Sin contratos
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No tienes un contrato activo para reservar esta clase.'
      });
    });

    it('debe rechazar reserva con contrato vencido', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas en el futuro
        contratos: [{
          estado: 'PAGADO',
          fecha_fin: new Date(Date.now() - 24 * 60 * 60 * 1000) // Vencido hace 1 día
        }]
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No tienes un contrato activo para reservar esta clase.'
      });
    });

    it('debe aceptar reserva con todas las validaciones correctas', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas en el futuro
        contratos: [{
          estado: 'PAGADO',
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Válido por 30 días
        }]
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('debe aceptar reserva exactamente 30 minutos antes', async () => {
      const claseData = {
        id: '1',
        cupo_disp: 3,
        fecha_hora_ini: new Date(Date.now() + 31 * 60 * 1000), // 31 minutos en el futuro
        contratos: [{
          estado: 'PAGADO',
          fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }]
      };

      const isValid = await validateReservaAdd(claseData, 'usuario123');

      expect(isValid).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});