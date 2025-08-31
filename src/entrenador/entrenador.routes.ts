import { Router } from 'express'
import { sanitizedEntrenadorInput, findAll, findOne, add, update, remove } from './entrenador.controler.js'

export const EntrenadorRouter = Router()

EntrenadorRouter.get('/', findAll)
EntrenadorRouter.get('/:id', findOne)
EntrenadorRouter.post('/', sanitizedEntrenadorInput, add)
EntrenadorRouter.put('/:id', sanitizedEntrenadorInput, update)
EntrenadorRouter.patch('/:id', sanitizedEntrenadorInput, update)
EntrenadorRouter.delete('/:id', remove)