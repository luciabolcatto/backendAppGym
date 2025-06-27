import { Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Actividad } from './actividad.entity.js'

const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const actividades = await em.find(Actividad, {})
    res
      .status(200)
      .json({ message: 'found all activities', data: actividades })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const actividad = await em.findOneOrFail(Actividad, { id })
    res
      .status(200)
      .json({ message: 'found actividad', data: actividad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const actividad = em.create(Actividad, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'actividad created', data: actividad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const actividad = em.getReference(Actividad, id)
    em.assign(actividad, req.body)
    await em.flush()
    res.status(200).json({ message: 'actividad updated' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const actividad = em.getReference(Actividad, id)
    await em.removeAndFlush(actividad)
    res.status(200).send({ message: 'actividad deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove }
