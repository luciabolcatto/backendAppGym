import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Reserva, EstadoReserva} from './reserva.entity.js'
import { Clase } from '../clase/clase.entity.js'
import { Contrato, EstadoContrato } from '../contrato/contrato.entity.js'

const em = orm.em

function sanitizeReservaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fecha_hora: req.body.fecha_hora || req.body.fecha_hora_ini,
    estado: req.body.estado,
    usuario: req.body.usuario,
    clase: req.body.clase,
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
    await actualizarReservas();
    
    // Si viene el parámetro usuario, filtrar por usuario
    const usuarioId = req.query.usuario as string;
    const filtros = usuarioId ? { usuario: usuarioId } : {};
    
    const reservas = await em.find(Reserva, filtros, { 
      populate: ['usuario', 'clase', 'clase.actividad', 'clase.entrenador'],
      orderBy: { fecha_hora: 'DESC' }
    })
    res
      .status(200)
      .json({ message: 'se encontraron todas las reservas', data: reservas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    await actualizarReservas();
    
    const id = req.params.id
    const reserva = await em.findOneOrFail(Reserva, { id }, { populate: ['usuario','clase'] })
    res
      .status(200)
      .json({ message: 'reserva encontrada', data: reserva })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const { clase: claseId, usuario: usuarioId } = req.body;

    //  Obtener la clase con populate para validar
    const clase = await em.findOne(Clase, { id: claseId });
    if (!clase) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    // Validar cupo disponible
    if (clase.cupo_disp <= 0) {
      return res.status(400).json({ 
        message: 'No se puede reservar esta clase. No hay cupo disponible.',
        details: { cupoDisponible: clase.cupo_disp }
      });
    }

    //  Validar tiempo (30 minutos antes del inicio)
    const ahora = new Date();
    const treintaMinutosDesdeAhora = new Date(ahora.getTime() + 30 * 60 * 1000);
    const fechaInicio = new Date(clase.fecha_hora_ini);

    if (fechaInicio <= treintaMinutosDesdeAhora) {
      return res.status(400).json({ 
        message: 'No se puede reservar esta clase. Las reservas se cierran 30 minutos antes del inicio.',
        details: { 
          fechaInicioClase: fechaInicio.toISOString(),
          limiteTiempo: treintaMinutosDesdeAhora.toISOString()
        }
      });
    }

    //  Validar contrato vigente pagado
    const contratos = await em.find(Contrato, { 
      usuario: usuarioId,
      estado: EstadoContrato.PAGADO
    });

    const contratoValido = contratos.find(contrato => {
      const inicioContrato = new Date(contrato.fecha_hora_ini);
      const finContrato = new Date(contrato.fecha_hora_fin);
      return fechaInicio >= inicioContrato && fechaInicio < finContrato;
    });

    if (!contratoValido) {
      return res.status(400).json({ 
        message: 'No tienes un contrato vigente y pagado para la fecha de esta clase.',
        details: { 
          fechaClase: fechaInicio.toISOString(),
          contratosPagados: contratos.length
        }
      });
    }

    // 5. Crear la reserva
    const reserva = em.create(Reserva, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'reserva creada', data: reserva })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const reserva = await em.findOneOrFail(Reserva, {id}, { populate: ['clase', 'usuario'] })
    
    // Validar que solo el propietario pueda modificar su reserva
    const usuarioAutenticadoId = (req as any).user?.id;
    if (usuarioAutenticadoId && reserva.usuario.id !== usuarioAutenticadoId) {
      return res.status(403).json({ 
        message: 'No tienes permiso para modificar esta reserva',
        details: {
          propietarioReserva: reserva.usuario.id,
          usuarioSolicitante: usuarioAutenticadoId
        }
      });
    }

    // Si se intenta cancelar, validar tiempo (30 minutos antes)
    if (req.body.estado === EstadoReserva.CANCELADA && reserva.estado !== EstadoReserva.CANCELADA) {
      const ahora = new Date();
      const treintaMinutosDesdeAhora = new Date(ahora.getTime() + 30 * 60 * 1000);
      const fechaInicio = new Date(reserva.clase.fecha_hora_ini);

      if (fechaInicio <= treintaMinutosDesdeAhora) {
        return res.status(400).json({ 
          message: 'No se puede cancelar esta reserva. Las cancelaciones no están permitidas dentro de los 30 minutos previos al inicio de la clase.',
          details: { 
            fechaInicioClase: fechaInicio.toISOString(),
            limiteTiempo: treintaMinutosDesdeAhora.toISOString()
          }
        });
      }
    }
    
    // Validar que no se intente cancelar una reserva cerrada
    if (reserva.estado === EstadoReserva.CERRADA && req.body.estado === EstadoReserva.CANCELADA) {
      return res.status(400).json({ 
        message: 'No se puede cancelar una reserva de una clase ya realizada (estado: cerrada)',
        details: {
          estadoActual: reserva.estado,
          estadoSolicitado: req.body.estado
        }
      })
    }

    // Validar transiciones de estado válidas
    if (req.body.estado) {
      if (reserva.estado === EstadoReserva.CANCELADA && req.body.estado !== EstadoReserva.CANCELADA) {
        return res.status(400).json({ 
          message: 'No se puede cambiar el estado de una reserva ya cancelada',
          details: {
            estadoActual: reserva.estado,
            estadoSolicitado: req.body.estado
          }
        })
      }
    }
    
    // Validar que el estado sea válido
    if (req.body.estado && !Object.values(EstadoReserva).includes(req.body.estado)) {
      return res.status(400).json({ 
        message: 'Estado de reserva inválido',
        details: {
          estadoRecibido: req.body.estado,
          estadosValidos: Object.values(EstadoReserva)
        }
      })
    }

    // Si se está cancelando una reserva, liberar el cupo
    const estadoAnterior = reserva.estado;
    em.assign(reserva, req.body)
    
    if (estadoAnterior !== EstadoReserva.CANCELADA && req.body.estado === EstadoReserva.CANCELADA) {
      // Liberar cupo: incrementar cupo_disp de la clase
      reserva.clase.cupo_disp += 1;
      
    }
    
    await em.flush()
    
    res.status(200).json({ message: 'reserva actualizada', data: reserva })
  } catch (error: any) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const reserva = em.getReference(Reserva, id)
    await em.removeAndFlush(reserva)
    res.status(200).send({ message: 'reserva eliminada' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
async function findFiltered(req: Request, res: Response) {
  try {
    // Actualizar reservas antes de filtrar
    await actualizarReservas();
    
    const { claseId } = req.query;

    if (!claseId) {
      return res.status(400).json({ message: 'Debe proveer el id de la clase para filtrar' });
    }

    // Buscar reservas filtradas por clase con usuario y clase , ordenadas por fecha_hora
    const reservas = await em.find(
      Reserva,
      { clase: claseId },
      { populate: ['usuario','clase', 'clase.actividad'], orderBy: { fecha_hora: 'ASC' } }
    );

   
    const data = reservas.map(r => ({
      idActividad: r.clase.actividad.id,
      nombreActividad: r.clase.actividad.nombre,
      idUsuario: r.usuario.id,
      nombre: r.usuario.nombre,
      apellido: r.usuario.apellido,
      fecha_hora_ini: r.clase.fecha_hora_ini,
      fecha_hora_fin: r.clase.fecha_hora_fin,
      fecha_hora_reserva: r.fecha_hora,
      estado_reserva: r.estado
    }));

    res.status(200).json({ message: 'Reservas filtradas por clase', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function actualizarReservas(req?: Request, res?: Response) {
  try {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    console.log(` Actualizando reservas - ${now.toLocaleString()}`);

    // Buscar todas las reservas PENDIENTES cuyas clases empiecen en 30 minutos o menos
    const reservasPendientes = await em.find(
      Reserva,
      { 
        estado: EstadoReserva.PENDIENTE
      },
      { 
        populate: ['clase'] 
      }
    );

    // Filtrar las que tienen clases que empiezan en 30 minutos o menos
    const reservasACerrar = reservasPendientes.filter(reserva => {
      const fechaInicioClase = new Date(reserva.clase.fecha_hora_ini);
      return fechaInicioClase <= thirtyMinutesFromNow;
    });

    if (reservasACerrar.length === 0) {
      console.log(` No hay reservas para actualizar`);
      const resultado = { actualizadas: 0, detalles: [] };
      
      if (res) {
        return res.status(200).json({ 
          message: 'No hay reservas para actualizar', 
          data: resultado 
        });
      }
      return resultado;
    }

    // Actualizar el estado de las reservas de PENDIENTE a CERRADA
    const detalles = [];
    for (const reserva of reservasACerrar) {
      const fechaInicioClase = new Date(reserva.clase.fecha_hora_ini);
      const minutosRestantes = Math.round((fechaInicioClase.getTime() - now.getTime()) / (1000 * 60));
      
      reserva.estado = EstadoReserva.CERRADA;
      
      detalles.push({
        reservaId: reserva.id,
        claseId: reserva.clase.id,
        fechaInicioClase: fechaInicioClase.toISOString(),
        minutosRestantes: minutosRestantes,
        estadoAnterior: EstadoReserva.PENDIENTE,
        estadoNuevo: EstadoReserva.CERRADA
      });
    }

    
    await em.flush();

    console.log(` ${reservasACerrar.length} reservas actualizadas`);

    const resultado = { 
      actualizadas: reservasACerrar.length,
      detalles: detalles
    };

    if (res) {
      res.status(200).json({ 
        message: `${resultado.actualizadas} reservas actualizadas correctamente`, 
        data: resultado
      });
    }

    return resultado;

  } catch (error: any) {
    console.error(' Error actualizando reservas:', error);
    
    if (res) {
      res.status(500).json({ message: error.message });
    }
    
    return { actualizadas: 0, detalles: [], error: error.message };
  }
}

export {sanitizeReservaInput,  findAll, findOne, add, update, remove, findFiltered, actualizarReservas}