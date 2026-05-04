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
import { createEntityImageUpload } from '../shared/utils/upload.js'
import { adminAuth } from '../admin/adminauth.js'
const actividadImageUpload = createEntityImageUpload({ entity: 'actividad' })

export const actividadRouter = Router()

actividadRouter.get('/', findAll)
actividadRouter.get('/:id', findOne)
actividadRouter.post('/', adminAuth, sanitizeActividadInput, add)
actividadRouter.put('/:id', adminAuth, sanitizeActividadInput, update)
actividadRouter.delete('/:id', adminAuth, remove)
// Subida de imagen para una actividad existente (campo: 'imagen')
actividadRouter.post('/:id/imagen', adminAuth, actividadImageUpload.single('imagen'), uploadImagen)
