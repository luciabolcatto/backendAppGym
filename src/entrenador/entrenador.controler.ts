import { Request, Response, NextFunction } from 'express' 
import { Entrenador } from './entrenador.entity.js'
import { orm } from '../shared/db/orm.js'            
 
const em = orm.em

function sanitizedEntrenadorInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tel: req.body.tel,
    mail: req.body.mail,
    actividades: req.body.actividades
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
    const entrenadores = await em.find(Entrenador, {}, { populate: ['actividades','clases'] })
    res.status(200).json({ message: 'se encotraron todos los entrenadores', data: entrenadores })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const entrenador = await em.findOneOrFail(Entrenador, { id }, { populate: ['actividades','clases'] })
    res.status(200).json({ message: 'entrenador encontrado', data: entrenador })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const entrenador = em.create(Entrenador, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'entrenador creado', data: entrenador})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const entrenadorToUpdate = await em.findOneOrFail(Entrenador, { id })
    em.assign(entrenadorToUpdate, req.body.sanitizedInput)
    await em.flush()
    res
      .status(200)
      .json({ message: 'entrenador actualizado', data: entrenadorToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const entrenador = em.getReference(Entrenador, id)
    await em.removeAndFlush(entrenador)
    res
    .status(200)
    .json({ message: 'entrenador borrado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizedEntrenadorInput, findAll, findOne, add, update, remove }
