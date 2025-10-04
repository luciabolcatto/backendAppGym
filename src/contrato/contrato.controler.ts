import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Contrato} from './contrato.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

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
async function findFiltered(req: Request, res: Response) {
  try {
    const { estado } = req.query;

    // Caso especial: usuarios sin contrato
    if (estado === 'sin-contrato') {
      // Obtener todos los usuarios
      const todosLosUsuarios = await em.find(Usuario, {});
      
      // Obtener todos los contratos para saber qué usuarios los tienen
      const usuariosConContrato = await em.find(Contrato, {}, { populate: ['usuario'] });
      const idsUsuariosConContrato = new Set(usuariosConContrato.map(c => c.usuario.id));
      
      // Filtrar usuarios que no tienen contrato
      const usuariosSinContrato = todosLosUsuarios.filter(u => !idsUsuariosConContrato.has(u.id));

      const data = usuariosSinContrato.map(u => ({
        idUsuario: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        fecha_hora_ini: null,
        fecha_hora_fin: null,
        estado: 'sin-contrato',
        membresia: 'Sin membresía'
      }));

      res.status(200).json({ message: 'Usuarios sin contrato encontrados', data });
      return;
    }

    const filtro: any = {};
    if (estado) {
      filtro.estado = estado;
    }

    // Consultamos contratos con usuario y membresía
    const contratos = await em.find(
      Contrato,
      filtro,
      { populate: ['usuario', 'membresia'] }
    );

    // Mapear y ordenar: primero por usuario (apellido, nombre) y luego por fecha más reciente
    const data = contratos
      .map(c => ({
        idUsuario: c.usuario.id,
        nombre: c.usuario.nombre,
        apellido: c.usuario.apellido,
        fecha_hora_ini: c.fecha_hora_ini,
        fecha_hora_fin: c.fecha_hora_fin,
        estado: c.estado,
        membresia: c.membresia.nombre
      }))
      .sort((a, b) => {
        // Primero ordenar por apellido
        if (a.apellido !== b.apellido) {
          return a.apellido.localeCompare(b.apellido);
        }
        // Luego por nombre
        if (a.nombre !== b.nombre) {
          return a.nombre.localeCompare(b.nombre);
        }
        // Finalmente por fecha (más reciente primero)
        return new Date(b.fecha_hora_ini).getTime() - new Date(a.fecha_hora_ini).getTime();
      });

    res.status(200).json({ message: 'Contratos filtrados encontrados', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
export {sanitizeContratoInput,  findAll, findOne, add, update, remove, findFiltered }