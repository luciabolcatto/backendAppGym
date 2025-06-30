<<<<<<< HEAD
/*import { Request, Response, NextFunction } from 'express' 
import { UsuarioRepository } from './usuario.repository.js'
import { Usuario } from './usuario.entity.js'             
=======
import { Request, Response, NextFunction } from 'express' 
import { Usuario } from './usuario.entity.js'
import { orm } from '../shared/db/orm.js'            
>>>>>>> origin/develop
 
const em = orm.em

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

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {}, { populate: ['contratos','reservas'] })
    res.status(200).json({ message: 'se encotraron todos los usuarios', data: usuarios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id
    const usuario = await em.findOneOrFail(Usuario, { id }, { populate: ['contratos','reservas'] })
    res.status(200).json({ message: 'usuario encontrado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'usuario creado', data: usuario})
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id
    const usuario = await em.findOneOrFail(Usuario, { id })
    em.assign(usuario, req.body.sanitizedInput)
    await em.flush()
    res
      .status(200)
      .json({ message: 'usuario actualizado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id
    const usuario = em.getReference(Usuario, id)
    await em.removeAndFlush(usuario)
    res
    .status(200)
    .json({ message: 'usuario borrado' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove }

*/