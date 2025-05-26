import { Request, Response } from 'express'
import { PrecioMembresiaRepository } from './precio.repository.js'
import { PrecioMembresia } from './precio.entity.js'

const repository = new PrecioMembresiaRepository()

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findByMembresia(req: Request, res: Response) {
  const membresiaId = req.params.membresiaId
  const precios = repository.findByMembresia(membresiaId)
  res.json({ data: precios })
}

function add(req: Request, res: Response) {
  const { valor, fechaDesde, membresiaId } = req.body
  const precio = new PrecioMembresia(valor, new Date(fechaDesde), membresiaId)
  const nuevo = repository.add(precio)
  res.status(201).json({ message: 'Precio agregado', data: nuevo })
}

function remove(req: Request, res: Response) {
  const { id } = req.params
  const deleted = repository.delete(id)
  if (!deleted) {
    res.status(404).json({ message: 'No se encontró el precio' })
  } else {
    res.status(200).json({ message: 'Precio eliminado' })
  }
}

export { findAll, findByMembresia, add, remove }
