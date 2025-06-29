import { Router } from 'express'
import { sanitizeContratoInput, findAll, findOne, add, update, remove } from './contrato.controler.js'

export const ContratoRouter = Router()

ContratoRouter.get('/', findAll)
ContratoRouter.get('/:id', findOne)
ContratoRouter.post('/', sanitizeContratoInput, add)
ContratoRouter.put('/:id', sanitizeContratoInput, update)
ContratoRouter.patch('/:id', sanitizeContratoInput, update)
ContratoRouter.delete('/:id', remove)