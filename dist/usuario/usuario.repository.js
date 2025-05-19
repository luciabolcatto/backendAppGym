import { Usuario } from './usuario.entity.js';
const usuarios = [
    new Usuario('Facundo', 'Juares', 340145226, 'facundo@gmail.com', 'a02b91bc-3769-4221-beb1-d7a3aeba7dad'),
];
export class UsuarioRepository {
    findAll() {
        return usuarios;
    }
    findOne(item) {
        return usuarios.find((usuario) => usuario.id === item.id);
    }
    add(item) {
        usuarios.push(item);
        return item;
    }
    update(item) {
        const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id);
        if (usuarioIdx !== -1) {
            usuarios[usuarioIdx] = { ...usuarios[usuarioIdx], ...item };
        }
        return usuarios[usuarioIdx];
    }
    delete(item) {
        const usuarioIdx = usuarios.findIndex((usuario) => usuario.id === item.id);
        if (usuarioIdx !== -1) {
            const deletedUsuarios = usuarios[usuarioIdx];
            usuarios.splice(usuarioIdx, 1);
            return deletedUsuarios;
        }
    }
}
//# sourceMappingURL=usuario.repository.js.map