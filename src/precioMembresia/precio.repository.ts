import {PrecioMembresia} from './precio.entity.js'
import { Repository } from '../shared/repository.js'

const precios :PrecioMembresia [] =[]

export class PrecioMembresiaRepository {
  public findAll(): PrecioMembresia[] {
    return precios
  }

  public findByMembresia (membresiaId: string): PrecioMembresia [] {
    return precios.filter (precio => precio.membresiaId === membresiaId)
  }

  public add(item : PrecioMembresia) : PrecioMembresia {
    precios.push(item)
    return item
  }

  public delete (id:string): PrecioMembresia | undefined {
    const idx = precios.findIndex (p => p.id === id)
    if (idx !== -1) {
      const deleted = precios[idx]
      precios.splice(idx, 1)
      return deleted
    }
  }
}