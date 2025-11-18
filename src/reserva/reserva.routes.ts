import { Router } from 'express'
import { sanitizeReservaInput, findAll, findOne, add, update, remove, findFiltered, actualizarReservas } from './reserva.controler.js'
import { adminAuth } from '../admin/adminauth.js'
import { authMiddleware } from '../middleware/auth.js' 
export const ReservaRouter = Router()

ReservaRouter.get('/filtrado', adminAuth, findFiltered)
ReservaRouter.post('/actualizar', actualizarReservas)

ReservaRouter.get('/', authMiddleware, findAll)
ReservaRouter.get('/:id', authMiddleware, findOne)
ReservaRouter.post('/', authMiddleware, sanitizeReservaInput, add)
ReservaRouter.put('/:id', authMiddleware, sanitizeReservaInput, update)
ReservaRouter.patch('/:id', authMiddleware, sanitizeReservaInput, update)
ReservaRouter.delete('/:id', authMiddleware, remove)