import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Clase} from './clase.entity.js'

const em = orm.em
function sanitizeClaseInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fecha_hora_ini: req.body.fecha_hora_ini,
    fecha_hora_fin: req.body.fecha_hora_fin,
    cupo_disp: req.body.cupo_disp,
    entrenador: req.body.entrenador,
    actividad: req.body.membresia,
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
    const clases = await em.find(Clase, {}, { populate: ['entrenador', 'actividad', 'reservas'] })
    res
      .status(200)
      .json({ message: 'se encotraron todas las clases', data: clases })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const clase = await em.findOneOrFail(Clase, { id }, { populate: ['entrenador', 'actividad', 'reservas'] })
    res
      .status(200)
      .json({ message: 'clase encontrada', data: clase })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const clase = em.create(Clase, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'clase creada', data: clase })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const clase = await em.findOneOrFail(Clase, {id})
    em.assign(clase, req.body)
    await em.flush()
    res.status(200).json({ message: 'clase actualizada',  data: clase})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const clase = em.getReference(Clase, id)
    await em.removeAndFlush(clase)
    res.status(200).send({ message: 'clase eliminada' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export {sanitizeClaseInput,  findAll, findOne, add, update, remove }