import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

const mockFindOne = jest.fn();
const mockFork = jest.fn();
const mockCreate = jest.fn();
const mockFlush = jest.fn();
const mockGetReference = jest.fn();
const mockAssign = jest.fn();
const mockRemoveAndFlush = jest.fn();

jest.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      fork: mockFork,
    },
  },
}));

import { sanitizeUsuarioInput, login, add, update, remove } from './usuario.controler.js';

describe('Usuario Controller - Validaciones', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    process.env.JWT_SECRET = 'secret_test';

    mockRequest = { body: {}, params: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    mockFork.mockReturnValue({
      findOne: mockFindOne,
      create: mockCreate,
      flush: mockFlush,
      getReference: mockGetReference,
      assign: mockAssign,
      removeAndFlush: mockRemoveAndFlush,
    });

    jest.clearAllMocks();
  });

  describe('sanitizeUsuarioInput', () => {
    it('debe rechazar si el nombre está vacío', () => {
      mockRequest.body = {
        nombre: '',
        apellido: 'Pérez',
        mail: 'test@example.com',
        contrasena: '123456',
      };

      sanitizeUsuarioInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El nombre es requerido',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe aceptar datos válidos y construir sanitizedInput', () => {
      mockRequest.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        tel: '12345678',
        mail: 'test@example.com',
        contrasena: '123456',
      };

      sanitizeUsuarioInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest.body as any).sanitizedInput).toEqual(
        expect.objectContaining({
          nombre: 'Juan',
          apellido: 'Pérez',
          mail: 'test@example.com',
          contrasena: '123456',
        })
      );
    });

    it('debe rechazar si el mail es inválido', () => {
      mockRequest.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'mail-invalido',
        contrasena: '123456',
      };

      sanitizeUsuarioInput(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El mail no es válido',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debe retornar 400 si faltan campos', async () => {
      mockRequest.body = { mail: '' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Todos los campos son obligatorios',
      });
    });

    it('debe retornar 200 con token cuando credenciales son correctas', async () => {
      const hash = await bcrypt.hash('123456', 10);

      mockRequest.body = { mail: 'test@example.com', contrasena: '123456' };
      mockFindOne.mockResolvedValueOnce({
        id: 'u1',
        mail: 'test@example.com',
        contrasena: hash,
      });

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          usuario: { id: 'u1', mail: 'test@example.com' },
        })
      );
    });

    it('debe retornar 400 si el usuario no existe', async () => {
      mockRequest.body = { mail: 'noexiste@example.com', contrasena: '123456' };
      mockFindOne.mockResolvedValueOnce(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas',
      });
    });

    it('debe retornar 400 si la contraseña es incorrecta', async () => {
      const hash = await bcrypt.hash('otra-clave', 10);

      mockRequest.body = { mail: 'test@example.com', contrasena: '123456' };
      mockFindOne.mockResolvedValueOnce({
        id: 'u1',
        mail: 'test@example.com',
        contrasena: hash,
      });

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Credenciales inválidas',
      });
    });
  });

  describe('add', () => {
    it('debe crear usuario cuando el mail no existe', async () => {
      mockRequest.body = {
        sanitizedInput: {
          nombre: 'Juan',
          apellido: 'Pérez',
          mail: 'test@example.com',
          contrasena: '123456',
        },
      };

      const usuarioCreado = {
        id: 'u1',
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'test@example.com',
      };

      mockFindOne.mockResolvedValueOnce(null);
      mockCreate.mockReturnValueOnce(usuarioCreado);

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockCreate).toHaveBeenCalled();
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario creado', data: usuarioCreado })
      );
    });

    it('debe rechazar creación si el mail ya existe', async () => {
      mockRequest.body = {
        sanitizedInput: {
          nombre: 'Juan',
          apellido: 'Pérez',
          mail: 'test@example.com',
          contrasena: '123456',
        },
      };

      mockFindOne.mockResolvedValueOnce({ id: 'u2', mail: 'test@example.com' });

      await add(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El email ya está registrado',
      });
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockFlush).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe actualizar usuario y persistir cambios', async () => {
      const usuarioRef = { id: 'u1' };
      mockRequest.params = { id: 'u1' };
      mockRequest.body = {
        sanitizedInput: {
          nombre: 'Juan Actualizado',
        },
      };

      mockGetReference.mockResolvedValueOnce(usuarioRef);

      await update(mockRequest as Request, mockResponse as Response);

      expect(mockAssign).toHaveBeenCalledWith(
        usuarioRef,
        expect.objectContaining({ nombre: 'Juan Actualizado' })
      );
      expect(mockFlush).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario actualizado', data: usuarioRef })
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar usuario por id', async () => {
      const usuarioRef = { id: 'u1' };
      mockRequest.params = { id: 'u1' };
      mockGetReference.mockReturnValueOnce(usuarioRef);

      await remove(mockRequest as Request, mockResponse as Response);

      expect(mockGetReference).toHaveBeenCalledWith(expect.anything(), 'u1');
      expect(mockRemoveAndFlush).toHaveBeenCalledWith(usuarioRef);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'usuario borrado' });
    });
  });
});
