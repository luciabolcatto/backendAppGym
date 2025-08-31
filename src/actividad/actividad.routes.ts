import { Router } from 'express'
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeActividadInput,
  uploadImagen,
} from './actividad.controler.js'
import { actividadImageUpload } from '../shared/utils/upload.js'

export const actividadRouter = Router()

actividadRouter.get('/', findAll)
actividadRouter.get('/:id', findOne)
actividadRouter.post('/', sanitizeActividadInput, add)
actividadRouter.put('/:id', sanitizeActividadInput, update)
actividadRouter.delete('/:id', remove)
// Subida de imagen para una actividad existente (campo: 'imagen')
actividadRouter.post('/:id/imagen', actividadImageUpload.single('imagen'), uploadImagen)
