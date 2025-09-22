import { Router } from 'express'
import { sanitizeContratoInput, findAll, findOne, add, update, remove ,findFiltered} from './contrato.controler.js'

export const ContratoRouter = Router()

ContratoRouter.get('/filtrado', findFiltered)
ContratoRouter.get('/', findAll)
ContratoRouter.get('/:id', findOne)
ContratoRouter.post('/', sanitizeContratoInput, add)
ContratoRouter.put('/:id', sanitizeContratoInput, update)
ContratoRouter.patch('/:id', sanitizeContratoInput, update)
ContratoRouter.delete('/:id', remove)