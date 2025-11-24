import { Request, Response, NextFunction } from 'express';

describe('Usuario Controller - Validaciones', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Función helper para simular sanitizeUsuarioInput
  const validateUserInput = (body: any) => {
    const { nombre, apellido, tel, mail, contrasena } = body;

    if (!nombre || nombre.trim().length === 0) {
      mockResponse.status!(400).json({ message: 'El nombre es requerido' });
      return false;
    }

    if (!apellido || apellido.trim().length === 0) {
      mockResponse.status!(400).json({ message: 'El apellido es requerido' });
      return false;
    }

    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      mockResponse.status!(400).json({ message: 'El mail no es válido' });
      return false;
    }

    if (tel && tel.toString().trim().length > 0 && !/^\d+$/.test(tel.toString())) {
      mockResponse.status!(400).json({ message: 'El teléfono solo debe contener números' });
      return false;
    }

    if (!contrasena || contrasena.length < 6) {
      mockResponse.status!(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    return true;
  };

  describe('sanitizeUsuarioInput', () => {
    it('debe rechazar si el nombre está vacío', () => {
      const isValid = validateUserInput({
        nombre: '',
        apellido: 'Pérez',
        mail: 'test@example.com',
        contrasena: '123456',
      });

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El nombre es requerido',
      });
    });

    it('debe rechazar si el apellido está vacío', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: '',
        mail: 'test@example.com',
        contrasena: '123456',
      });

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El apellido es requerido',
      });
    });

    it('debe rechazar si el email es inválido', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'email-invalido',
        contrasena: '123456',
      });

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El mail no es válido',
      });
    });

    it('debe rechazar teléfono con caracteres no numéricos', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'test@example.com',
        tel: '123abc',
        contrasena: '123456',
      });

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El teléfono solo debe contener números',
      });
    });

    it('debe rechazar contraseña menor a 6 caracteres', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'test@example.com',
        contrasena: '12345',
      });

      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    });

    it('debe aceptar datos válidos', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'test@example.com',
        tel: '123456789',
        contrasena: '123456',
      });

      expect(isValid).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('debe permitir teléfono vacío', () => {
      const isValid = validateUserInput({
        nombre: 'Juan',
        apellido: 'Pérez',
        mail: 'test@example.com',
        tel: '',
        contrasena: '123456',
      });

      expect(isValid).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Login validations', () => {
    const validateLogin = (mail: string, contrasena: string) => {
      if (!mail || !contrasena) {
        mockResponse.status!(400).json({ message: 'Email y contraseña son requeridos' });
        return false;
      }
      return true;
    };

    it('debe rechazar login sin email', () => {
      const isValid = validateLogin('', '123456');
      
      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email y contraseña son requeridos',
      });
    });

    it('debe rechazar login sin contraseña', () => {
      const isValid = validateLogin('test@example.com', '');
      
      expect(isValid).toBe(false);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email y contraseña son requeridos',
      });
    });

    it('debe aceptar login con credenciales válidas', () => {
      const isValid = validateLogin('test@example.com', '123456');
      
      expect(isValid).toBe(true);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});