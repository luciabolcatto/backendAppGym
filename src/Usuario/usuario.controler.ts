import { Request, Response, NextFunction } from 'express' 
import { UsuarioRepository } from './Usuario.repository.js'
import { Usuario } from './Usuario.entity.js'             
 
const repository = new UsuarioRepository()

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tel: req.body.tel,
    mail: req.body.mail,
   
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
  const Usuario = repository.findOne({ id })
  if (!Usuario) {
    return res.status(404).send({ message: 'Usuario not found' })
  }
  res.json({ data: Usuario })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const UsuarioInput = new Usuario(
    input.nombre,
    input.apellido,
    input.tel,
    input.mail,
  )

  const Usuario = repository.add(UsuarioInput)
  return res.status(201).send({ message: 'Usuario created', data: Usuario })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const Usuario = repository.update(req.body.sanitizedInput)

  if (!Usuario) {
    return res.status(404).send({ message: 'Usuario not found' })
  }

  return res.status(200).send({ message: 'Usuario updated successfully', data: Usuario })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const Usuario = repository.delete({ id })

  if (!Usuario) {
    res.status(404).send({ message: 'Usuario not found' })
  } else {
    res.status(200).send({ message: 'Usuario deleted successfully' })
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove }