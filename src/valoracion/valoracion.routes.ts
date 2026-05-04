import { Router } from 'express'
import { sanitizedValoracionInput, findAll, resumen, upsert } from './valoracion.controler.js'
import { authMiddleware } from '../middleware/auth.js'

export const valoracionRouter = Router()

valoracionRouter.get('/', findAll)
valoracionRouter.get('/resumen', resumen)
valoracionRouter.post('/', authMiddleware, sanitizedValoracionInput, upsert)
