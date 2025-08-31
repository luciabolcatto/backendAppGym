import { Router } from 'express'
import { sanitizeClaseInput, findAll, findOne, add, update, remove } from './clase.controler.js'

export const ClaseRouter = Router()

ClaseRouter.get('/', findAll)
ClaseRouter.get('/:id', findOne)
ClaseRouter.post('/', sanitizeClaseInput, add)
ClaseRouter.put('/:id', sanitizeClaseInput, update)
ClaseRouter.patch('/:id', sanitizeClaseInput, update)
ClaseRouter.delete('/:id', remove)