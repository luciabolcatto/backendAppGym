import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Valoracion } from './valoracion.entity.js'

const em = orm.em

function sanitizedValoracionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    rating: req.body.rating,
    comentario: req.body.comentario,
    usuario: req.body.usuario,
    entrenador: req.body.entrenador,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) delete req.body.sanitizedInput[key]
  })

  next()
}

// GET /valoraciones?entrenador=ID
async function findAll(req: Request, res: Response) {
  try {
    const entrenadorId = req.query.entrenador as string

    if (!entrenadorId) {
      return res.status(400).json({ message: 'Debe enviar el id del entrenador en query (?entrenador=...)' })
    }

    const valoraciones = await em.find(
      Valoracion,
      { entrenador: entrenadorId },
      { populate: ['usuario'], orderBy: { _id: 'DESC' } }
    )

    res.status(200).json({ message: 'valoraciones encontradas', data: valoraciones })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// GET /valoraciones/resumen?entrenador=ID
async function resumen(req: Request, res: Response) {
  try {
    const entrenadorId = req.query.entrenador as string

    if (!entrenadorId) {
      return res.status(400).json({ message: 'Debe enviar el id del entrenador en query (?entrenador=...)' })
    }

    const valoraciones = await em.find(Valoracion, { entrenador: entrenadorId })

    const cantidad = valoraciones.length
    const suma = valoraciones.reduce((acc, v) => acc + v.rating, 0)
    const promedio = cantidad === 0 ? 0 : Number((suma / cantidad).toFixed(2))

    res.status(200).json({ message: 'resumen de valoraciones', data: { promedio, cantidad } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// POST /valoraciones (upsert)
async function upsert(req: Request, res: Response) {
  try {
    const { rating, comentario, usuario, entrenador } = req.body.sanitizedInput

    if (!usuario || !entrenador) {
      return res.status(400).json({ message: 'Debe enviar usuario y entrenador' })
    }
    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: 'Debe enviar rating' })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating inválido: debe ser un número entre 1 y 5' })
    }
    if (comentario !== undefined && typeof comentario !== 'string') {
      return res.status(400).json({ message: 'comentario inválido' })
    }

    const existente = await em.findOne(Valoracion, { usuario, entrenador })

    if (existente) {
      existente.rating = rating
      existente.comentario = comentario
      await em.flush()
      return res.status(200).json({ message: 'valoración actualizada', data: existente })
    }

    const nueva = em.create(Valoracion, { rating, comentario, usuario, entrenador })
    await em.flush()
    res.status(201).json({ message: 'valoración creada', data: nueva })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizedValoracionInput, findAll, resumen, upsert }
