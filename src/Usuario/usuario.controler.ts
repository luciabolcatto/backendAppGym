import { Request, Response, NextFunction } from 'express' 
import { Usuario } from './usuario.entity.js'
import { orm } from '../shared/db/orm.js'   
import { ensureDir ,buildPublicImagePath } from '../shared/utils/upload.js';
import bcrypt from "bcrypt"
import fs from 'fs'
import path from 'path'
import jwt from "jsonwebtoken"         
 


function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction): void{
  const { nombre, apellido, tel, mail, contrasena, fotoPerfil } = req.body;

  
  // Validaciones mínimas
  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    res.status(400).json({ message: 'El mail no es válido' });
    return;
  }
  


  if (!contrasena || contrasena.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }
  

 req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tel: req.body.tel,
    mail: req.body.mail,
    contrasena: req.body.contrasena,
    fotoPerfil: req.file ? buildPublicImagePath('usuario', req.params.id || 'temp', req.file.filename) : req.body.fotoPerfil,
  };

  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}
async function findAll(req: Request, res: Response) {
  const em = orm.em.fork();
  try {
    const usuarios = await em.find(Usuario, {}, { populate: ["contratos", "reservas"] });

    // fallback: si no hay fotoPerfil, buscar en /public/uploads/usuario/:id
    for (const u of usuarios) {
      if (!u.fotoPerfil && u.id) {
        const dir = path.join(process.cwd(), "public", "uploads", "usuario", u.id.toString());
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            const img = files.find((f) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));
            if (img) {
              u.fotoPerfil = `/public/uploads/usuario/${u.id}/${img}`;
            }
          }
        } catch {
          
        }
      }
    }

    res.status(200).json({ message: "Se encontraron todos los usuarios", data: usuarios });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  const em = orm.em.fork();
  try {
    const id = req.params.id;
    const usuario = await em.findOneOrFail(Usuario, { id }, { populate: ["contratos", "reservas"] });

    if (!usuario.fotoPerfil && usuario.id) {
      const dir = path.join(process.cwd(), "public", "uploads", "usuario", usuario.id.toString());
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const img = files.find((f) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));
          if (img) {
            usuario.fotoPerfil = `/public/uploads/usuario/${usuario.id}/${img}`;
          }
        }
      } catch {
        
      }
    }

    res.status(200).json({ message: "Usuario encontrado", data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
async function add(req: Request, res: Response): Promise<void> {
  const em = orm.em.fork();
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
    sanitizedInput.contrasena = await bcrypt.hash(sanitizedInput.contrasena, salt);

    const usuario = em.create(Usuario, sanitizedInput);
    await em.flush();

    // Si la foto estaba en 'temp', moverla a la carpeta del usuario
    if (sanitizedInput.fotoPerfil && sanitizedInput.fotoPerfil.includes('/temp/')) {
      const tempPath = path.join(process.cwd(), 'public', sanitizedInput.fotoPerfil.replace('/public/', ''));
      const newDir = path.join(process.cwd(), 'public/uploads/usuario', usuario.id!);
      ensureDir(newDir);
      const fileName = path.basename(tempPath);
      fs.renameSync(tempPath, path.join(newDir, fileName));

      // Guardar ruta correcta en la DB
      usuario.fotoPerfil = `/uploads/usuario/${usuario.id!}/${fileName}`;
      await em.flush();
    }

    res.status(201).json({ message: 'Usuario creado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


async function update(req: Request, res: Response): Promise<void> {
  const em = orm.em.fork();

  const isBcryptHash = (s: string) => /^\$2[aby]\$.{56}$/.test(s);

  try {
    const usuario = await em.getReference(Usuario, req.params.id);
    const sanitizedInput = req.body.sanitizedInput || req.body;

    // Manejo de contraseña
    if (sanitizedInput.contrasena) {
      // Solo hash si no es un hash 
      if (!isBcryptHash(sanitizedInput.contrasena)) {
        const salt = await bcrypt.genSalt(10);
        sanitizedInput.contrasena = await bcrypt.hash(sanitizedInput.contrasena, salt);
      } else {
        delete sanitizedInput.contrasena; // no tocar la existente
      }

      // Validación de largo (por seguridad)
      if (sanitizedInput.contrasena && sanitizedInput.contrasena.length > 60) {
        delete sanitizedInput.contrasena;
      }
    }

    // Manejo de foto
    if (sanitizedInput.fotoPerfil) {
      if (sanitizedInput.fotoPerfil.includes('/temp/')) {
        const tempPath = path.join(process.cwd(), 'public', sanitizedInput.fotoPerfil.replace('/public/', ''));
        const newDir = path.join(process.cwd(), 'public', 'uploads', 'usuario', req.params.id);
        ensureDir(newDir);
        const fileName = path.basename(tempPath);
        fs.renameSync(tempPath, path.join(newDir, fileName));
        sanitizedInput.fotoPerfil = `/uploads/usuario/${req.params.id}/${fileName}`;
      } else {
        sanitizedInput.fotoPerfil = sanitizedInput.fotoPerfil.replace(/^\/?public/, '');
      }
    } else {
      // No se envió foto nueva, no tocar la existente
      delete sanitizedInput.fotoPerfil;
    }

    // Asignar cambios al usuario
    em.assign(usuario, sanitizedInput);
    await em.flush();

    res.status(200).json({ message: 'Usuario actualizado', data: usuario });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}


async function remove(req: Request, res: Response): Promise<void> {
  const em = orm.em.fork(); 
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
  const em = orm.em.fork(); 
  try {
    const { mail, contrasena } = req.body;

    if (!mail || !contrasena) {
      res.status(400).json({ message: 'Todos los campos son obligatorios' });
      return;
    }

    const usuario = await em.findOne(Usuario, { mail });
    if (!usuario) {
      res.status(400).json({ message: 'Credenciales inválidas' });
      return;
    }

    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
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
     
    );

    res.status(200).json({ token, usuario: { id: usuario.id, mail: usuario.mail } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}



export { sanitizeUsuarioInput, findAll, findOne, add, update, remove,login }
