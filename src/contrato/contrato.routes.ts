import { Router } from 'express'
import { sanitizeContratoInput, findAll, findOne, add, update, remove } from './contrato.controler.js'

export const contratoRouter = Router()

contratoRouter.get('/', findAll)
contratoRouter.get('/:id', findOne)
contratoRouter.post('/', sanitizeContratoInput, add)
contratoRouter.put('/:id', sanitizeContratoInput, update)
contratoRouter.patch('/:id', sanitizeContratoInput, update)
contratoRouter.delete('/:id', remove)