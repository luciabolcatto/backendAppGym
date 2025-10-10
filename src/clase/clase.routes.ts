import { Router } from 'express';
import {
  sanitizeClaseInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  findAllOrdered,
  actualizarCupo,
} from './clase.controler.js';
import { adminAuth } from '../admin/adminauth.js';

export const ClaseRouter = Router();

ClaseRouter.get('/todas-ordenadas', findAllOrdered);
ClaseRouter.get('/admin/todas-ordenadas', adminAuth, findAllOrdered);
ClaseRouter.get('/', findAll);
ClaseRouter.get('/:id', findOne);
ClaseRouter.post('/', sanitizeClaseInput, add);
ClaseRouter.put('/:id', sanitizeClaseInput, update);
ClaseRouter.patch('/:id', sanitizeClaseInput, update);
ClaseRouter.delete('/:id', remove);
ClaseRouter.patch('/:id/actualizar-cupo', actualizarCupo);
