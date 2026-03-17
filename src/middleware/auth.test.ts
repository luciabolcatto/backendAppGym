import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.js';

describe('authMiddleware - Validaciones', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    process.env.JWT_SECRET = 'secret_test';
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('debe retornar 401 si no se proporciona token', () => {
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

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido.' });
  });

  it('debe llamar a next() y setear req.user si el token es válido', () => {
    const token = jwt.sign(
      { id: 'u1', mail: 'test@example.com' },
      process.env.JWT_SECRET as string
    );
    mockRequest.header = jest.fn().mockReturnValue(`Bearer ${token}`);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockRequest as any).user).toEqual(
      expect.objectContaining({ id: 'u1', mail: 'test@example.com' })
    );
    expect(mockNext).toHaveBeenCalled();
  });
});
