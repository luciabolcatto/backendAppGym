import { Repository } from '../shared/repository.js'
import { usuario } from './usuario.entity.js'

const usuarios = [
  new usuario(
    'Darth Vader',
    'Sith',
    11,
    101,
    22,
    11,
    ['Lightsaber', 'Death Star'],
    'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
  ),
]

export class usuarioRepository implements Repository<usuario> {
  public findAll(): usuario[] | undefined {
    return usuarios
  }

  public findOne(item: { id: string }): usuario | undefined {
    return usuarios.find((usuario) => usuario.id === item.id)
  }

  public add(item: usuario): usuario | undefined {
    usuarios.push(item)
    return item
  }

  public update(item: usuario): usuario | undefined {
    const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id)

    if (usuarioIdx !== -1) {
      usuarios[usuarioIdx] = { ...usuarios[usuarioIdx], ...item }
    }
    return usuarios[usuarioIdx]
  }

  public delete(item: { id: string }): usuario | undefined {
    const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id)

    if (usuarioIdx !== -1) {
      const deletedusuarios = usuarios[usuarioIdx]
      usuarios.splice(usuarioIdx, 1)
      return deletedusuarios
    }
  }
}