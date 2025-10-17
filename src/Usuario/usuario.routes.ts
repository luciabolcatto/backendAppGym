import { Router } from 'express';
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove, login } from './usuario.controler.js';
import { authMiddleware } from '../middleware/auth.js';
import { createEntityImageUpload } from '../shared/utils/upload.js';

export const UsuarioRouter = Router();

// Configuración de multer 
const uploadUsuario = createEntityImageUpload({ entity: 'usuario', idParam: 'id' });

// Rutas públicas
UsuarioRouter.post('/', createEntityImageUpload({ entity: 'usuario', allowTemp: true }).single('fotoPerfil'), sanitizeUsuarioInput, add);
UsuarioRouter.post('/login', login);

// Rutas protegidas
UsuarioRouter.get('/', authMiddleware, findAll);
UsuarioRouter.get('/:id', authMiddleware, findOne);
UsuarioRouter.put('/:id', authMiddleware, uploadUsuario.single('fotoPerfil'), sanitizeUsuarioInput, update);
UsuarioRouter.patch('/:id', authMiddleware, uploadUsuario.single('fotoPerfil'), sanitizeUsuarioInput, update);
UsuarioRouter.delete('/:id', authMiddleware, remove);