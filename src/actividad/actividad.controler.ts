import { Request, Response, NextFunction, RequestHandler } from 'express'
import { orm } from '../shared/db/orm.js'
import fs from 'fs'
import path from 'path'
import { Actividad } from './actividad.entity.js'

const em = orm.em

function sanitizeActividadInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    cupo: req.body.cupo,
    imagenUrl: req.body.imagenUrl,
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
    const actividades = await em.find(Actividad, {}, { populate: ['entrenadores', 'clases'] })
    // Fallback: si no hay imagenUrl, intentar descubrir una imagen en /public/uploads/actividad/:id
    for (const a of actividades) {
      if (!a.imagenUrl && a.id) {
        const dir = path.join(process.cwd(), 'public', 'uploads', 'actividad', a.id)
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir)
            const img = files.find(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
            if (img) {
              a.imagenUrl = `/public/uploads/actividad/${a.id}/${img}`
            }
          }
        } catch {}
      }
    }
    res.status(200).json({ message: 'found all activities', data: actividades })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const actividad = await em.findOneOrFail(Actividad, { id }, { populate: ['entrenadores', 'clases'] })
    if (!actividad.imagenUrl && actividad.id) {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'actividad', actividad.id)
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir)
          const img = files.find(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
          if (img) {
            actividad.imagenUrl = `/public/uploads/actividad/${actividad.id}/${img}`
          }
        }
      } catch {}
    }
    res.status(200).json({ message: 'found actividad', data: actividad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const actividad = em.create(Actividad, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'actividad created', data: actividad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const actividad = em.getReference(Actividad, id)
    em.assign(actividad, req.body.sanitizedInput)
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

const uploadImagen: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id
    const file = (req as any).file as any
    if (!file) {
      res.status(400).json({ message: 'No se recibió archivo imagen' })
      return
    }
    const actividad = await em.findOneOrFail(Actividad, { id })
    const publicPath = `/public/uploads/actividad/${id}/${file.filename}`
    actividad.imagenUrl = publicPath
    await em.flush()
    res.status(200).json({ message: 'imagen actualizada', data: actividad })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeActividadInput, findAll, findOne, add, update, remove, uploadImagen }
