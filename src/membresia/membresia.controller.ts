import { Request, Response } from 'express';
import { MembresiaRepository } from './membresia.repository.js';

// Instanciamos el repositorio
const repo = new MembresiaRepository();

export class MembresiaController {

  // GET /api/membresias
  async getAll(req: Request, res: Response) {
    const lista = await repo.findAll();
    res.json(lista);
  }

  // GET /api/membresias/:id
  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const membresia = await repo.findOne(id);
    if (membresia) {
      res.json(membresia);
    } else {
      res.status(404).json({ message: 'Membresía no encontrada' });
    }
  }

  // POST /api/membresias
  async create(req: Request, res: Response) {
    const nueva = await repo.add(req.body);
    res.status(201).json(nueva);
  }

  // PUT /api/membresias/:id
  async update(req: Request, res: Response) {
    const id = req.params.id;
    const actualizada = await repo.update(id, req.body);
    if (actualizada) {
      res.json(actualizada);
    } else {
      res.status(404).json({ message: 'Membresía no encontrada' });
    }
  }

  // DELETE /api/membresias/:id
  async delete(req: Request, res: Response) {
    const id = req.params.id;
    const borrada = await repo.delete(id);
    if (borrada) {
      res.json({ message: 'Membresía eliminada' });
    } else {
      res.status(404).json({ message: 'Membresía no encontrada' });
    }
  }
}
