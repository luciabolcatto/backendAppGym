import { Router } from 'express'
import { findAll, findByMembresia, add, remove } from './precio.controller.js'

export const PrecioMembresiaRouter = Router()

PrecioMembresiaRouter.get('/', findAll)
PrecioMembresiaRouter.get('/membresia/:membresiaId', findByMembresia)
PrecioMembresiaRouter.post('/', add)
PrecioMembresiaRouter.delete('/:id', remove)
