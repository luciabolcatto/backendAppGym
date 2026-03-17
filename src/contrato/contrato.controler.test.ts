import { Request, Response } from 'express';
import { EstadoContrato } from './contrato.entity.js';

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockFlush = jest.fn();

jest.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      findOne: mockFindOne,
      find: mockFind,
      create: mockCreate,
      flush: mockFlush,
    },
  },
}));

import { contratarMembresia, cancelarContrato } from './contrato.controler.js';

describe('Contrato Controller - Estados y validaciones', () => {
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

  describe('contratarMembresia', () => {
    it('debe rechazar si faltan usuarioId o membresiaId', async () => {
      mockRequest.body = { usuarioId: 'u1' };

      await contratarMembresia(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Se requieren ID de usuario y membresía' })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar si el usuario no existe', async () => {
      mockRequest.body = { usuarioId: 'u1', membresiaId: 'm1' };
      mockFindOne.mockResolvedValueOnce(null);

      await contratarMembresia(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario no encontrado' })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar si la membresía no existe', async () => {
      mockRequest.body = { usuarioId: 'u1', membresiaId: 'm1' };
      mockFindOne.mockResolvedValueOnce({ id: 'u1' }).mockResolvedValueOnce(null);

      await contratarMembresia(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Membresía no encontrada' })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe rechazar si ya tiene 2 contratos pendientes', async () => {
      mockRequest.body = { usuarioId: 'u1', membresiaId: 'm1' };
      mockFindOne
        .mockResolvedValueOnce({ id: 'u1' })
        .mockResolvedValueOnce({ id: 'm1', meses: 1 });
      mockFind.mockResolvedValueOnce([
        { id: 'c1', estado: EstadoContrato.PENDIENTE },
        { id: 'c2', estado: EstadoContrato.PENDIENTE },
      ]);

      await contratarMembresia(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'LIMITE_CONTRATOS_EXCEDIDO' })
      );
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe crear contrato en estado pendiente cuando todo es válido', async () => {
      mockRequest.body = { usuarioId: 'u1', membresiaId: 'm1' };
      const usuario = { id: 'u1' };
      const membresia = { id: 'm1', meses: 1 };
      const contratoCreado = { id: 'c1', estado: EstadoContrato.PENDIENTE };

      mockFindOne
        .mockResolvedValueOnce(usuario)
        .mockResolvedValueOnce(membresia)
        .mockResolvedValueOnce(null);
      mockFind.mockResolvedValueOnce([]);
      mockCreate.mockReturnValueOnce(contratoCreado);

      await contratarMembresia(mockRequest as Request, mockResponse as Response);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ estado: EstadoContrato.PENDIENTE })
      );
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contrato: contratoCreado,
            esRenovacion: false,
          }),
        })
      );
    });
  });

  describe('cancelarContrato', () => {
    it('debe rechazar cancelación si el contrato no existe', async () => {
      mockRequest.params = { contratoId: 'inexistente' };
      mockFindOne.mockResolvedValueOnce(null);

      await cancelarContrato(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Contrato no encontrado' })
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('debe cambiar estado a cancelado cuando el contrato está pendiente', async () => {
      const contrato = {
        id: 'c1',
        estado: EstadoContrato.PENDIENTE,
        fechaCancelacion: undefined as Date | undefined,
      };

      mockRequest.params = { contratoId: 'c1' };
      mockFindOne.mockResolvedValueOnce(contrato);

      await cancelarContrato(mockRequest as Request, mockResponse as Response);

      expect(contrato.estado).toBe(EstadoContrato.CANCELADO);
      expect(contrato.fechaCancelacion).toBeInstanceOf(Date);
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('debe rechazar cancelación si el contrato no está pendiente', async () => {
      mockRequest.params = { contratoId: 'c1' };
      mockFindOne.mockResolvedValueOnce({
        id: 'c1',
        estado: EstadoContrato.PAGADO,
      });

      await cancelarContrato(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Solo se pueden cancelar contratos pendientes'),
        })
      );
      expect(mockFlush).not.toHaveBeenCalled();
    });
  });
});
