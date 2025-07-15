import { Router } from 'express'
import {
  findAll,
  findOne,
  add,
  update,
  remove,
} from './actividad.controler.js'

export const actividadRouter = Router()

actividadRouter.get('/', findAll)
actividadRouter.get('/:id', findOne)
actividadRouter.post('/', add)
actividadRouter.put('/:id', update)
actividadRouter.delete('/:id', remove)
