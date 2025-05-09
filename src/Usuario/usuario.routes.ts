import { Router } from 'express'
import { sanitizeusuarioInput, findAll, findOne, add, update, remove } from './usuario.controler.js'

export const usuarioRouter = Router()

usuarioRouter.get('/', findAll)
usuarioRouter.get('/:id', findOne)
usuarioRouter.post('/', sanitizeusuarioInput, add)
usuarioRouter.put('/:id', sanitizeusuarioInput, update)
usuarioRouter.patch('/:id', sanitizeusuarioInput, update)
usuarioRouter.delete('/:id', remove)