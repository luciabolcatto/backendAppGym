import { Router } from 'express'
import { 
  sanitizeContratoInput, 
  findAll, 
  findOne, 
  add, 
  update, 
  remove,
  contratarMembresia,
  simularPago,
  cancelarContrato,
  verificarVencimientos,
  obtenerContratosUsuario,
  obtenerEstadisticasContrato, 
  findFiltered

} from './contrato.controler.js'

import { adminAuth } from '../admin/adminauth.js'
import { authMiddleware } from '../middleware/auth.js' 

export const ContratoRouter = Router()

ContratoRouter.get('/filtrado', adminAuth, findFiltered)

ContratoRouter.get('/', findAll)
ContratoRouter.get('/:id', authMiddleware, findOne)
ContratoRouter.post('/', sanitizeContratoInput, add)
ContratoRouter.put('/:id', sanitizeContratoInput, update)
ContratoRouter.patch('/:id', sanitizeContratoInput, update)
ContratoRouter.delete('/:id', remove)

// Nuevas rutas para el caso de uso "Contratar Plan"
ContratoRouter.post('/contratar', authMiddleware, contratarMembresia)
ContratoRouter.post('/simular-pago', authMiddleware, simularPago)
ContratoRouter.patch('/cancelar/:contratoId', authMiddleware, cancelarContrato)
ContratoRouter.post('/verificar-vencimientos', verificarVencimientos)

// Rutas para gestión de múltiples contratos
ContratoRouter.get('/usuario/:usuarioId', authMiddleware, obtenerContratosUsuario)
ContratoRouter.get('/admin/estadisticas', obtenerEstadisticasContrato)