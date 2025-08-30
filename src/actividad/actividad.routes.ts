import { Router } from 'express'
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeActividadInput,
} from './actividad.controler.js'

export const actividadRouter = Router()

actividadRouter.get('/', findAll)
actividadRouter.get('/:id', findOne)
actividadRouter.post('/', sanitizeActividadInput, add)
actividadRouter.put('/:id', sanitizeActividadInput, update)
actividadRouter.delete('/:id', remove)
