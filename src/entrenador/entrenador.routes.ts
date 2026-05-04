import { Router } from 'express'
import { sanitizedEntrenadorInput, findAll, findOne, add, update, remove } from './entrenador.controler.js'
import { adminAuth } from '../admin/adminauth.js'

export const EntrenadorRouter = Router()

EntrenadorRouter.get('/', findAll)
EntrenadorRouter.get('/:id', findOne)
EntrenadorRouter.post('/', adminAuth, sanitizedEntrenadorInput, add)
EntrenadorRouter.put('/:id', adminAuth, sanitizedEntrenadorInput, update)
EntrenadorRouter.patch('/:id', adminAuth, sanitizedEntrenadorInput, update)
EntrenadorRouter.delete('/:id', adminAuth, remove)