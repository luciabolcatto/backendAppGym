import { Router } from 'express'
import { sanitizeReservaInput, findAll, findOne, add, update, remove } from './reserva.controler.js'

export const ReservaRouter = Router()

ReservaRouter.get('/', findAll)
ReservaRouter.get('/:id', findOne)
ReservaRouter.post('/', sanitizeReservaInput, add)
ReservaRouter.put('/:id', sanitizeReservaInput, update)
ReservaRouter.patch('/:id', sanitizeReservaInput, update)
ReservaRouter.delete('/:id', remove)