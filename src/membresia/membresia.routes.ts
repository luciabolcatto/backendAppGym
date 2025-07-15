import { Router } from 'express';
import {
  sanitizeMembresiaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './membresia.controller.js';

export const MembresiaRouter = Router();

MembresiaRouter.get('/', findAll);
MembresiaRouter.get('/:id', findOne);
MembresiaRouter.post('/', sanitizeMembresiaInput, add);
MembresiaRouter.put('/:id', sanitizeMembresiaInput, update);
MembresiaRouter.patch('/:id', sanitizeMembresiaInput, update);
MembresiaRouter.delete('/:id', remove);
