import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Contrato, EstadoContrato} from './contrato.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Membresia } from '../membresia/membresia.entity.js'

const em = orm.em

function sanitizeContratoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fecha_hora_ini: req.body.fecha_hora_ini,
    fecha_hora_fin: req.body.fecha_hora_fin,
    estado: req.body.estado,
    fechaPago: req.body.fechaPago,
    fechaCancelacion: req.body.fechaCancelacion,
    metodoPago: req.body.metodoPago,
    usuario: req.body.usuario,
    membresia: req.body.membresia,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}


async function findAll(req: Request, res: Response) {
  try {
    const contratos = await em.find(Contrato, {}, { populate: ['usuario','membresia'] })
    res
      .status(200)
      .json({ message: 'se encotraron todos los contratos', data: contratos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const contrato = await em.findOneOrFail(Contrato, { id }, { populate: ['usuario','membresia'] })
    res
      .status(200)
      .json({ message: 'contrato encontrado', data: contrato })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const contrato = em.create(Contrato, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'contrato creado', data: contrato })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const contrato = await em.findOneOrFail(Contrato, {id})
    em.assign(contrato, req.body)
    await em.flush()
    res.status(200).json({ message: 'contrato actualizado',  data: contrato})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const contrato = em.getReference(Contrato, id)
    await em.removeAndFlush(contrato)
    res.status(200).send({ message: 'contrato eliminado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function contratarMembresia(req: Request, res: Response) {
  try {
    const { usuarioId, membresiaId } = req.body;
    
    if (!usuarioId || !membresiaId) {
      return res.status(400).json({ 
        message: 'Se requieren ID de usuario y membresía' 
      });
    }
    
    // Verificar si el usuario existe
    const usuario = await em.findOne(Usuario, { id: usuarioId });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si la membresía existe
    const membresia = await em.findOne(Membresia, { id: membresiaId });
    if (!membresia) {
      return res.status(404).json({ message: 'Membresía no encontrada' });
    }
    
    // Buscar el último contrato pagado del usuario para esta membresía
    const ultimoContratoPagado = await em.findOne(Contrato, { 
      usuario: usuario, 
      membresia: membresia,
      estado: EstadoContrato.PAGADO
    }, { 
      orderBy: { fecha_hora_fin: 'DESC' }
    });
    
    let fechaInicio: Date;
    let fechaFin: Date;
    let esRenovacion = false;
    
    if (ultimoContratoPagado) {
      // Si tiene un contrato pagado, verificar si está vigente o vencido
      const fechaActual = new Date();
      
      if (ultimoContratoPagado.fecha_hora_fin > fechaActual) {
        // Contrato vigente: el nuevo contrato inicia cuando termine el actual
        fechaInicio = new Date(ultimoContratoPagado.fecha_hora_fin);
        fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + membresia.meses);
        esRenovacion = true;
      } else {
        // Contrato vencido: el nuevo contrato inicia inmediatamente
        fechaInicio = new Date();
        fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + membresia.meses);
      }
    } else {
      // No tiene contratos pagados previos: nuevo contrato
      fechaInicio = new Date();
      fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + membresia.meses);
    }
    
    // Crear el nuevo contrato con estado PENDIENTE
    const nuevoContrato = em.create(Contrato, {
      usuario: usuario,
      membresia: membresia,
      fecha_hora_ini: fechaInicio,
      fecha_hora_fin: fechaFin,
      estado: EstadoContrato.PENDIENTE
    });
    
    await em.flush();
    
    const mensaje = esRenovacion 
      ? 'Renovación programada exitosamente. Pendiente de pago.'
      : 'Contrato creado exitosamente. Pendiente de pago.';
    
    res.status(201).json({
      message: mensaje,
      data: {
        contrato: nuevoContrato,
        esRenovacion: esRenovacion,
        contratoAnterior: ultimoContratoPagado ? {
          id: ultimoContratoPagado.id,
          fechaFin: ultimoContratoPagado.fecha_hora_fin
        } : null
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function simularPago(req: Request, res: Response) {
  try {
    const { contratoId, metodoPago = 'simulado' } = req.body;
    
    if (!contratoId) {
      return res.status(400).json({ message: 'Se requiere ID de contrato' });
    }
    
    // Buscar el contrato
    const contrato = await em.findOne(Contrato, { id: contratoId }, { populate: ['usuario', 'membresia'] });
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    // Verificar que el contrato esté en estado pendiente
    if (contrato.estado !== EstadoContrato.PENDIENTE) {
      return res.status(400).json({ 
        message: `El contrato no está en estado pendiente. Estado actual: ${contrato.estado}` 
      });
    }
    
    // Simular procesamiento de pago (aquí iría la integración real con el sistema de pagos)
    const pagoExitoso = Math.random() > 0.1; // 90% de probabilidad de éxito para la simulación
    
    if (pagoExitoso) {
      // Actualizar el estado a "pagado" y completar campos de pago
      const fechaPago = new Date();
      contrato.estado = EstadoContrato.PAGADO;
      contrato.fechaPago = fechaPago;
      contrato.metodoPago = metodoPago;
      
      await em.flush();
      
      res.status(200).json({
        message: 'Pago procesado exitosamente',
        data: {
          contrato: contrato
        }
      });
    } else {
      // Simular fallo en el pago
      res.status(400).json({
        message: 'Error al procesar el pago. Intente nuevamente.',
        error: 'payment_failed',
        contratoId: contratoId
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function cancelarContrato(req: Request, res: Response) {
  try {
    const { contratoId } = req.params;
    
    if (!contratoId) {
      return res.status(400).json({ message: 'Se requiere ID de contrato' });
    }
    
    // Buscar el contrato
    const contrato = await em.findOne(Contrato, { id: contratoId }, { populate: ['usuario', 'membresia'] });
    if (!contrato) {
      return res.status(404).json({ message: 'Contrato no encontrado' });
    }
    
    // Verificar que el contrato no esté ya cancelado o vencido
    if (contrato.estado === EstadoContrato.CANCELADO) {
      return res.status(400).json({ message: 'El contrato ya está cancelado' });
    }
    
    if (contrato.estado === EstadoContrato.VENCIDO) {
      return res.status(400).json({ message: 'No se puede cancelar un contrato vencido' });
    }
    
    // Cancelar el contrato y registrar fecha de cancelación
    const fechaCancelacion = new Date();
    const estadoAnterior = contrato.estado; // Guardar estado antes de cambiar
    contrato.estado = EstadoContrato.CANCELADO;
    contrato.fechaCancelacion = fechaCancelacion;
    
    await em.flush();
    
    res.status(200).json({
      message: 'Contrato cancelado exitosamente',
      data: {
        contrato: contrato,
        estadoAnterior: estadoAnterior
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function verificarVencimientos(req: Request, res: Response) {
  try {
    const fechaActual = new Date();
    
    // Buscar contratos pagados que hayan vencido
    const contratosVencidos = await em.find(Contrato, {
      estado: EstadoContrato.PAGADO,
      fecha_hora_fin: { $lt: fechaActual }
    }, { populate: ['usuario', 'membresia'] });
    
    // Actualizar estado a vencido
    for (const contrato of contratosVencidos) {
      contrato.estado = EstadoContrato.VENCIDO;
    }
    
    await em.flush();
    
    res.status(200).json({
      message: `Se actualizaron ${contratosVencidos.length} contratos vencidos`,
      data: {
        contratosActualizados: contratosVencidos.length,
        fechaVerificacion: fechaActual
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerContratosUsuario(req: Request, res: Response) {
  try {
    const { usuarioId } = req.params;
    
    if (!usuarioId) {
      return res.status(400).json({ message: 'Se requiere ID de usuario' });
    }
    
    // Verificar si el usuario existe
    const usuario = await em.findOne(Usuario, { id: usuarioId });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Obtener todos los contratos del usuario
    const contratos = await em.find(Contrato, { 
      usuario: usuario 
    }, { 
      populate: ['membresia'],
      orderBy: { fecha_hora_ini: 'DESC' }
    });
    
    // Separar contratos por estado
    const contratosPorEstado = {
      pendientes: contratos.filter(c => c.estado === EstadoContrato.PENDIENTE),
      pagados: contratos.filter(c => c.estado === EstadoContrato.PAGADO),
      cancelados: contratos.filter(c => c.estado === EstadoContrato.CANCELADO),
      vencidos: contratos.filter(c => c.estado === EstadoContrato.VENCIDO)
    };
    
    // Identificar contratos activos (pagados y vigentes)
    const fechaActual = new Date();
    const contratosActivos = contratosPorEstado.pagados.filter(c => 
      c.fecha_hora_ini <= fechaActual && c.fecha_hora_fin > fechaActual
    );
    
    // Identificar próximos contratos (pagados pero aún no iniciados)
    const proximosContratos = contratosPorEstado.pagados.filter(c => 
      c.fecha_hora_ini > fechaActual
    );
    
    res.status(200).json({
      message: 'Contratos del usuario obtenidos exitosamente',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido
        },
        resumen: {
          totalContratos: contratos.length,
          contratosActivos: contratosActivos.length,
          proximosContratos: proximosContratos.length,
          contratosPendientes: contratosPorEstado.pendientes.length
        },
        contratos: {
          activos: contratosActivos,
          proximos: proximosContratos,
          pendientes: contratosPorEstado.pendientes,
          cancelados: contratosPorEstado.cancelados,
          vencidos: contratosPorEstado.vencidos
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerEstadisticasContrato(req: Request, res: Response) {
  try {
    const fechaActual = new Date();
    
    // Contar contratos por estado
    const estadisticas = await Promise.all([
      em.count(Contrato, { estado: EstadoContrato.PENDIENTE }),
      em.count(Contrato, { estado: EstadoContrato.PAGADO }),
      em.count(Contrato, { estado: EstadoContrato.CANCELADO }),
      em.count(Contrato, { estado: EstadoContrato.VENCIDO }),
      em.count(Contrato, { 
        estado: EstadoContrato.PAGADO,
        fecha_hora_ini: { $lte: fechaActual },
        fecha_hora_fin: { $gt: fechaActual }
      })
    ]);
    
    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        totalContratos: estadisticas[0] + estadisticas[1] + estadisticas[2] + estadisticas[3],
        pendientes: estadisticas[0],
        pagados: estadisticas[1],
        cancelados: estadisticas[2],
        vencidos: estadisticas[3],
        activos: estadisticas[4],
        fechaConsulta: fechaActual
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
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
}