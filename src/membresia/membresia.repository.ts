import { Repository } from '../shared/repository.js'
import { Membresia } from './membresia.entity.js'

const membresias: Membresia[] = [
  new Membresia('001', 'Mensual', 'Acceso ilimitado por un mes', 5000, new Date('2024-01-01')),
  new Membresia('002', 'Trimestral', 'Acceso 3 meses', 13500, new Date('2024-02-01')),
]

export class MembresiaRepository implements Repository<Membresia> {
  public findAll(): Membresia[] {
    return membresias
  }

  public findOne(item: { id: string }): Membresia | undefined {
    return membresias.find((membresia) => membresia.id === item.id)
  }

  public add(item: Membresia): Membresia {
    membresias.push(item)
    return item
  }

  public update(item: Membresia): Membresia | undefined {
    const idx = membresias.findIndex((membresia) => membresia.id === item.id)
    if (idx !== -1) {
      membresias[idx] = { ...membresias[idx], ...item }
    }
    return membresias[idx]
  }

  public delete(item: { id: string }): Membresia | undefined {
    const idx = membresias.findIndex((membresia) => membresia.id === item.id)
    if (idx !== -1) {
      const deleted = membresias[idx]
      membresias.splice(idx, 1)
      return deleted
    }
  }
}
