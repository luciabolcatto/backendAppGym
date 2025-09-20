import { Router } from 'express';
import {
  sanitizeClaseInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './clase.controler.js';

export const claseRouter = Router();

claseRouter.get('/', findAll);
claseRouter.get('/:id', findOne);
claseRouter.post('/', sanitizeClaseInput, add);
claseRouter.put('/:id', sanitizeClaseInput, update);
claseRouter.patch('/:id', sanitizeClaseInput, update);
claseRouter.delete('/:id', remove);
