import { Request, Response, NextFunction } from 'express';
import { Membresia } from './membresia.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeMembresiaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    meses: req.body.meses,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const membresias = await em.find(Membresia, {},{populate:['contratos']});
    res.status(200).json({
      message: 'Se encontraron todas las membresías',
      data: membresias,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const membresia = await em.findOneOrFail(Membresia, { id },{populate:['contratos']});
    res.status(200).json({ message: 'Membresía encontrada', data: membresia });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const membresia = em.create(Membresia, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Membresía creada', data: membresia });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const membresia = await em.findOneOrFail(Membresia, { id });
    em.assign(membresia, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'Membresía actualizada', data: membresia });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const membresia = em.getReference(Membresia, id);
    await em.removeAndFlush(membresia); 
    res.status(200).json({ message: 'membresía borrada' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeMembresiaInput, findAll, findOne, add, update, remove };
