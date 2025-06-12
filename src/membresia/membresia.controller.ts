import { Request, Response, NextFunction } from 'express'
import { MembresiaRepository } from './membresia.repository.js'
import { Membresia } from './membresia.entity.js'

const repository = new MembresiaRepository()

function sanitizeMembresiaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    fechaDesde: new Date(req.body.fechaDesde),
    nro: req.body.nro
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const membresia = repository.findOne({ id })
  if (!membresia) {
    res.status(404).send({ message: 'Membresía no encontrada' })
  } else {
    res.json({ data: membresia })
  }
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const nuevaMembresia = new Membresia(
    input.nro,
    input.nombre,
    input.descripcion,
    input.precio,
    input.fechaDesde
  )

  const membresia = repository.add(nuevaMembresia)
  res.status(201).send({ message: 'Membresía creada', data: membresia })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const membresia = repository.update(req.body.sanitizedInput)

  if (!membresia) {
    res.status(404).send({ message: 'Membresía no encontrada' })
  } else {
    res.status(200).send({ message: 'Membresía actualizada correctamente', data: membresia })
  }
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const membresia = repository.delete({ id })

  if (!membresia) {
    res.status(404).send({ message: 'Membresía no encontrada' })
  } else {
    res.status(200).send({ message: 'Membresía eliminada correctamente' })
  }
}

export { sanitizeMembresiaInput, findAll, findOne, add, update, remove }
