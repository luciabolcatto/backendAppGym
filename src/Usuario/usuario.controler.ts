import { Request, Response, NextFunction } from 'express' 
import { Usuario } from './usuario.entity.js'
import { orm } from '../shared/db/orm.js'   
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"         
 
const em = orm.em

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction): void{
  const { nombre, apellido, tel, mail, contraseña, fotoPerfil } = req.body;

  // Validaciones mínimas
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    res.status(400).json({ message: 'El mail no es válido' });
    return;
  }

  if (!contraseña || contraseña.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }
  
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tel: req.body.tel,
    mail: req.body.mail,
    contraseña: req.body.contraseña, 
      fotoPerfil:  req.body.fotoPerfil,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) : Promise<void>{
  try {
    const usuarios = await em.find(Usuario, {}, { populate: ['contratos','reservas'] })
    res.status(200).json({ message: 'se encotraron todos los usuarios', data: usuarios })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id
    const usuario = await em.findOneOrFail(Usuario, { id }, { populate: ['contratos','reservas'] })
    res.status(200).json({ message: 'usuario encontrado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const { sanitizedInput } = req.body;

    // Verificar si el email ya existe
    const existingUser = await em.findOne(Usuario, { mail: sanitizedInput.mail });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    sanitizedInput.contraseña = await bcrypt.hash(sanitizedInput.contraseña, salt);

    const usuario = em.create(Usuario, sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Usuario creado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const usuario = await em.getReference(Usuario, req.params.id);
    const sanitizedInput = req.body.sanitizedInput || req.body;

    if (sanitizedInput.contraseña) {
      const salt = await bcrypt.genSalt(10);
      sanitizedInput.contraseña = await bcrypt.hash(sanitizedInput.contraseña, salt);
    }

    em.assign(usuario, sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'Usuario actualizado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
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
async function login(req: Request, res: Response): Promise<void> {
  try {
    const { mail, contraseña } = req.body;

    if (!mail || !contraseña) {
      res.status(400).json({ message: 'Todos los campos son obligatorios' });
      return;
    }

    const usuario = await em.findOne(Usuario, { mail });
    if (!usuario) {
      res.status(400).json({ message: 'Credenciales inválidas' });
      return;
    }

    const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!isMatch) {
      res.status(400).json({ message: 'Credenciales inválidas' });
      return;
    }

    if (!process.env.JWT_SECRET) {
     res.status(500).json({ message: 'Clave secreta no definida' });
     return;
    }

    const token = jwt.sign(
      { id: usuario.id, mail: usuario.mail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, usuario: { id: usuario.id, mail: usuario.mail } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findByMail(req: Request, res: Response): Promise<void> {
  const mail = req.params.mail
  try {
    const usuario = await em.findOne(Usuario, { mail })
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json({ message: 'Usuario encontrado', data: usuario })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove,login ,findByMail}
