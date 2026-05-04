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
  findAllWithUserReservas,
} from './clase.controler.js';
import { adminAuth } from '../admin/adminauth.js';

export const ClaseRouter = Router();

ClaseRouter.get('/todas-ordenadas', findAllOrdered);
ClaseRouter.get('/con-reservas-usuario', findAllWithUserReservas);
ClaseRouter.get('/admin/todas-ordenadas', adminAuth, findAllOrdered);
ClaseRouter.get('/', findAll);
ClaseRouter.get('/:id', findOne);
ClaseRouter.post('/', adminAuth, sanitizeClaseInput, add);
ClaseRouter.put('/:id', adminAuth, sanitizeClaseInput, update);
ClaseRouter.patch('/:id', adminAuth, sanitizeClaseInput, update);
ClaseRouter.delete('/:id', adminAuth, remove);
ClaseRouter.patch('/:id/actualizar-cupo', adminAuth, actualizarCupo);
