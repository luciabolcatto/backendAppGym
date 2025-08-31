import { Router } from 'express'
import { sanitizeUsuarioInput, findAll, findOne, add, update, remove,login ,findByMail} from './usuario.controler.js'
import { authMiddleware } from '../middleware/auth.js'

export const UsuarioRouter = Router()


UsuarioRouter.post('/', sanitizeUsuarioInput, add)
UsuarioRouter.post('/login', login)

UsuarioRouter.get('/', authMiddleware, findAll)
UsuarioRouter.get('/:id', authMiddleware, findOne)
UsuarioRouter.put('/:id', authMiddleware, sanitizeUsuarioInput, update)
UsuarioRouter.patch('/:id', authMiddleware, sanitizeUsuarioInput, update)
UsuarioRouter.delete('/:id', authMiddleware, remove)
UsuarioRouter.get('/email/:mail', authMiddleware, findByMail)