import { Router } from 'express'
import { sanitizeReservaInput, findAll, findOne, add, update, remove, findFiltered, actualizarReservas } from './reserva.controler.js'
import { adminAuth } from '../admin/adminauth.js' 
export const ReservaRouter = Router()

ReservaRouter.get('/filtrado', adminAuth, findFiltered)
ReservaRouter.post('/actualizar', actualizarReservas)

ReservaRouter.get('/', findAll)
ReservaRouter.get('/:id', findOne)
ReservaRouter.post('/', sanitizeReservaInput, add)
ReservaRouter.put('/:id', sanitizeReservaInput, update)
ReservaRouter.patch('/:id', sanitizeReservaInput, update)
ReservaRouter.delete('/:id', remove)