import { Repository } from '../shared/repository.js'
import { Usuario } from './Usuario.entity.js'

const Usuarios = [
  new Usuario(
    /*'Darth Vader',
    'Sith',
    11,
    101,
    22,
    11,
    ['Lightsaber', 'Death Star'],
    'a02b91bc-3769-4221-beb1-d7a3aeba7dad'*/
  ),
]

export class UsuarioRepository implements Repository<Usuario> {
  public findAll(): Usuario[] | undefined {
    return Usuarios
  }

  public findOne(item: { id: string }): Usuario | undefined {
    return Usuarios.find((Usuario) => Usuario.id_u === item.id)
  }

  public add(item: Usuario): Usuario | undefined {
    Usuarios.push(item)
    return item
  }

  public update(item: Usuario): Usuario | undefined {
    const UsuarioIdx = Usuarios.findIndex((Usuario) => Usuario.id_u === item.id_u)

    if (UsuarioIdx !== -1) {
      Usuarios[UsuarioIdx] = { ...Usuarios[UsuarioIdx], ...item }
    }
    return Usuarios[UsuarioIdx]
  }

  public delete(item: { id: string }): Usuario | undefined {
    const UsuarioIdx = Usuarios.findIndex((Usuario) => Usuario.id_u === item.id)

    if (UsuarioIdx !== -1) {
      const deletedUsuarios = Usuarios[UsuarioIdx]
      Usuarios.splice(UsuarioIdx, 1)
      return deletedUsuarios
    }
  }
}