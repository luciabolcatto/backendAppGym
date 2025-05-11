import { Repository } from '../shared/repository.js'
<<<<<<< Updated upstream
import { Usuario } from './usuario.entity.js' 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
<<<<<<< Updated upstream
=======
=======
import { Usuario } from './usuario.entity.js'
>>>>>>> Stashed changes
>>>>>>> Stashed changes

const usuarios  = [
  new Usuario(
    'Facundo',
    'Juares',
    340145226,
    'facundo@gmail.com',
    'a02b91bc-3769-4221-beb1-d7a3aeba7dad'
  ),
]

export class UsuarioRepository implements Repository<Usuario> {
  public findAll(): Usuario[] | undefined {
    return usuarios
  }

  public findOne(item: { id: string }): Usuario | undefined {
    return usuarios.find((usuario) => usuario.id === item.id)
  }

  public add(item: Usuario): Usuario | undefined {
    usuarios.push(item)
    return item
  }

  public update(item: Usuario): Usuario | undefined {
    const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id)

    if (usuarioIdx !== -1) {
      usuarios[usuarioIdx] = { ...usuarios[usuarioIdx], ...item }
    }
    return usuarios[usuarioIdx]
  }

  public delete(item: { id: string }): Usuario | undefined {
    const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id)

    if (usuarioIdx !== -1) {
      const deletedUsuarios = usuarios[usuarioIdx]
      usuarios.splice(usuarioIdx, 1)
      return deletedUsuarios
    }
  }
}
