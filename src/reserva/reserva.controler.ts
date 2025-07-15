import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Reserva} from './reserva.entity.js'

const em = orm.em

function sanitizeReservaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    fecha_hora: req.body.fecha_hora_ini,
    estado: req.body.estado,
    usuario:req.body.usuario,
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
    const reservas = await em.find(Reserva, {}, { populate: ['usuario','clase'] })
    res
      .status(200)
      .json({ message: 'se encotraron todos los reservas', data: reservas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
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
    const reserva = em.create(  Reserva , req.body)
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
    const reserva = await em.findOneOrFail(Reserva, {id})
    em.assign(reserva, req.body)
    await em.flush()
    res.status(200).json({ message: 'reserva actualizada',data: reserva})
  } catch (error: any) {
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

export {sanitizeReservaInput,  findAll, findOne, add, update, remove }