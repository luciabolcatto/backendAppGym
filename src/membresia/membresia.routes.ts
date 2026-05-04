import { Router } from 'express';
import {
  sanitizeMembresiaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './membresia.controller.js';
import { adminAuth } from '../admin/adminauth.js';

export const MembresiaRouter = Router();

MembresiaRouter.get('/', findAll);
MembresiaRouter.get('/:id', findOne);
MembresiaRouter.post('/', adminAuth, sanitizeMembresiaInput, add);
MembresiaRouter.put('/:id', adminAuth, sanitizeMembresiaInput, update);
MembresiaRouter.patch('/:id', adminAuth, sanitizeMembresiaInput, update);
MembresiaRouter.delete('/:id', adminAuth, remove);
