import { Request, Response ,  NextFunction} from 'express'
import { orm } from '../shared/db/orm.js'
import { Contrato} from './contrato.entity.js'

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
    const contratos = await em.find(Contrato, {})
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
    const contrato = await em.findOneOrFail(Contrato, { id })
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
    const contrato = em.getReference(Contrato, id)
    em.assign(contrato, req.body)
    await em.flush()
    res.status(200).json({ message: 'contrato actualizado' })
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

export {sanitizeContratoInput,  findAll, findOne, add, update, remove }