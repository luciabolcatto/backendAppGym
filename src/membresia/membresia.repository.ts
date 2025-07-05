import { orm } from '../shared/db/orm.js';  // Config MikroORM
import { Membresia } from './membresia.entity.js'; 
import type { RequiredEntityData } from '@mikro-orm/core'; 

export class MembresiaRepository {

  // Traer todas las membresías
  async findAll(): Promise<Membresia[]> {
    const repo = orm.em.getRepository(Membresia);
    return await repo.findAll();
  }

  // Traer una membresía por id
  async findOne(id: string): Promise<Membresia | null> {
    const repo = orm.em.getRepository(Membresia);
    return await repo.findOne({ _id: id }); // Mongo usa _id
  }

  // Crear una nueva membresía
  async add(data: RequiredEntityData<Membresia>): Promise<Membresia> {
    const nueva = orm.em.create(Membresia, data);
    await orm.em.persistAndFlush(nueva);
    return nueva;
  }

  // Actualizar una membresía
  async update(id: string, data: Partial<Membresia>): Promise<Membresia | null> {
    const repo = orm.em.getRepository(Membresia);
    const membresia = await repo.findOne({ _id: id });
    if (!membresia) return null;

    repo.assign(membresia, data);
    await orm.em.flush();
    return membresia;
  }

  // Eliminar una membresía
  async delete(id: string): Promise<boolean> {
    const repo = orm.em.getRepository(Membresia);
    const membresia = await repo.findOne({ _id: id });
    if (!membresia) return false;

    await orm.em.removeAndFlush(membresia);
    return true;
  }
}
