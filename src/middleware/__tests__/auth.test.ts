import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../auth.js';

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('debe retornar 401 si no se proporciona el token', () => {
    mockRequest.header = jest.fn().mockReturnValue(undefined);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Acceso denegado. Token no proporcionado.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debe retornar 400 si el token es inválido', () => {
    mockRequest.header = jest.fn().mockReturnValue('Bearer invalid.token');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido.' });
  });

  it('debe llamar a next() si el token es válido', () => {
    const mockDecoded = { id: '123', mail: 'test@example.com' };
    mockRequest.header = jest.fn().mockReturnValue('Bearer valid.token');
    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockRequest as any).user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalled();
  });
});
