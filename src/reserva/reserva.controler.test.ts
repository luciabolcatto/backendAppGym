import { Request, Response } from 'express';
import { EstadoContrato } from '../contrato/contrato.entity.js';
import { EstadoReserva } from './reserva.entity.js';

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFlush = jest.fn();
const mockFindOneOrFail = jest.fn();
const mockAssign = jest.fn((target: any, data: any) => Object.assign(target, data));

jest.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      findOne: mockFindOne,
      find: mockFind,
      create: mockCreate,
      flush: mockFlush,
      findOneOrFail: mockFindOneOrFail,
      removeAndFlush: jest.fn(),
      getReference: jest.fn(),
      assign: mockAssign,
    },
  },
}));

import { add, update } from './reserva.controler.js';

describe('Reserva Controller - Estados y validaciones', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = { body: {}, params: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('debe rechazar reserva si la clase no existe', async () => {
      mockRequest.body = { clase: 'c1', usuario: 'u1' };
      mockFindOne.mockResolvedValueOnce(null);

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Clase no encontrada' })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe crear reserva cuando hay contrato pagado vigente', async () => {
      const fechaClase = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const reservaCreada = { id: 'r1', usuario: 'u1', clase: 'c1' };

      mockRequest.body = { clase: 'c1', usuario: 'u1' };
      mockFindOne.mockResolvedValueOnce({
        id: 'c1',
        cupo_disp: 5,
        fecha_hora_ini: fechaClase,
      });
      mockFind.mockResolvedValueOnce([
        {
          estado: EstadoContrato.PAGADO,
          fecha_hora_ini: new Date(Date.now() - 24 * 60 * 60 * 1000),
          fecha_hora_fin: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ]);
      mockCreate.mockReturnValueOnce(reservaCreada);

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'reserva creada', data: reservaCreada })
      );
    });

    it('debe rechazar reserva dentro de los 30 minutos previos al inicio', async () => {
      mockRequest.body = { clase: 'c1', usuario: 'u1' };
      mockFindOne.mockResolvedValueOnce({
        id: 'c1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 10 * 60 * 1000),
      });

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'No se puede reservar esta clase. Las reservas se cierran 30 minutos antes del inicio.',
        })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar reserva si no hay cupo disponible', async () => {
      mockRequest.body = { clase: 'c1', usuario: 'u1' };
      mockFindOne.mockResolvedValueOnce({
        id: 'c1',
        cupo_disp: 0,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No se puede reservar esta clase. No hay cupo disponible.',
        })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar reserva si no existe contrato pagado vigente', async () => {
      mockRequest.body = { clase: 'c1', usuario: 'u1' };
      mockFindOne.mockResolvedValueOnce({
        id: 'c1',
        cupo_disp: 5,
        fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      mockFind.mockResolvedValueOnce([]);

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes un contrato vigente y pagado para la fecha de esta clase.',
        })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe mantener rechazo en intentos inválidos repetidos', async () => {
      mockRequest.body = { clase: 'c1', usuario: 'u1' };

      mockFindOne
        .mockResolvedValueOnce({
          id: 'c1',
          cupo_disp: 5,
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
        })
        .mockResolvedValueOnce({
          id: 'c1',
          cupo_disp: 5,
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
      mockFind.mockResolvedValue([]);

      await add(mockRequest as Request, mockResponse as Response);
      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });
  });

  describe('update - cambios de estado', () => {
    it('debe rechazar update si el usuario no es propietario de la reserva', async () => {
      const reserva = {
        id: 'r1',
        estado: EstadoReserva.PENDIENTE,
        clase: {
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
          cupo_disp: 5,
        },
        usuario: { id: 'u1' },
      };

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { estado: EstadoReserva.CANCELADA };
      (mockRequest as any).user = { id: 'u2' };
      mockFindOneOrFail.mockResolvedValueOnce(reserva);

      await update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'No tienes permiso para modificar esta reserva' })
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe cambiar estado a cancelada y liberar cupo', async () => {
      const reserva = {
        id: 'r1',
        estado: EstadoReserva.PENDIENTE,
        clase: {
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
          cupo_disp: 5,
        },
        usuario: { id: 'u1' },
      };

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { estado: EstadoReserva.CANCELADA };
      (mockRequest as any).user = { id: 'u1' };
      mockFindOneOrFail.mockResolvedValueOnce(reserva);

      await update(mockRequest as Request, mockResponse as Response);

      expect(reserva.estado).toBe(EstadoReserva.CANCELADA);
      expect(reserva.clase.cupo_disp).toBe(6);
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('debe rechazar cancelar una reserva ya cerrada', async () => {
      const reserva = {
        id: 'r1',
        estado: EstadoReserva.CERRADA,
        clase: {
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
          cupo_disp: 5,
        },
        usuario: { id: 'u1' },
      };

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { estado: EstadoReserva.CANCELADA };
      (mockRequest as any).user = { id: 'u1' };
      mockFindOneOrFail.mockResolvedValueOnce(reserva);

      await update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message:
            'No se puede cancelar una reserva de una clase ya realizada (estado: cerrada)',
        })
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar estado inválido', async () => {
      const reserva = {
        id: 'r1',
        estado: EstadoReserva.PENDIENTE,
        clase: {
          fecha_hora_ini: new Date(Date.now() + 2 * 60 * 60 * 1000),
          cupo_disp: 5,
        },
        usuario: { id: 'u1' },
      };

      mockRequest.params = { id: 'r1' };
      mockRequest.body = { estado: 'estado-invalido' as any };
      (mockRequest as any).user = { id: 'u1' };
      mockFindOneOrFail.mockResolvedValueOnce(reserva);

      await update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Estado de reserva inválido' })
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });
  });
});
