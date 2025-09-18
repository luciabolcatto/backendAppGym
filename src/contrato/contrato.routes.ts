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
  obtenerEstadisticasContrato
} from './contrato.controler.js'

export const ContratoRouter = Router()

// Rutas existentes
ContratoRouter.get('/', findAll)
ContratoRouter.get('/:id', findOne)
ContratoRouter.post('/', sanitizeContratoInput, add)
ContratoRouter.put('/:id', sanitizeContratoInput, update)
ContratoRouter.patch('/:id', sanitizeContratoInput, update)
ContratoRouter.delete('/:id', remove)

// Nuevas rutas para el caso de uso "Contratar Plan"
ContratoRouter.post('/contratar', contratarMembresia)
ContratoRouter.post('/simular-pago', simularPago)
ContratoRouter.patch('/cancelar/:contratoId', cancelarContrato)
ContratoRouter.post('/verificar-vencimientos', verificarVencimientos)

// Rutas para gestión de múltiples contratos
ContratoRouter.get('/usuario/:usuarioId', obtenerContratosUsuario)
ContratoRouter.get('/admin/estadisticas', obtenerEstadisticasContrato)