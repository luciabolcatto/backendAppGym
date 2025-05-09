import { Request, Response, NextFunction } from 'express'
import { UsuarioRepository } from './usuario.repository.js'
import { Usuario } from './usuario.entity.js'

const repository = new UsuarioRepository()

function sanitizeusuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    usuarioClass: req.body.usuarioClass,
    level: req.body.level,
    hp: req.body.hp,
    mana: req.body.mana,
    attack: req.body.attack,
    items: req.body.items,
  }
  //more checks here

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
  const usuario = repository.findOne({ id })
  if (!usuario) {
    return res.status(404).send({ message: 'usuario not found' })
  }
  res.json({ data: usuario })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const usuarioInput = new usuario(
    input.name,
    input.usuarioClass,
    input.level,
    input.hp,
    input.mana,
    input.attack,
    input.items
  )

  const usuario = repository.add(usuarioInput)
  return res.status(201).send({ message: 'usuario created', data: usuario })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const usuario = repository.update(req.body.sanitizedInput)

  if (!usuario) {
    return res.status(404).send({ message: 'usuario not found' })
  }

  return res.status(200).send({ message: 'usuario updated successfully', data: usuario })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const usuario = repository.delete({ id })

  if (!usuario) {
    res.status(404).send({ message: 'usuario not found' })
  } else {
    res.status(200).send({ message: 'usuario deleted successfully' })
  }
}

export { sanitizeusuarioInput, findAll, findOne, add, update, remove }