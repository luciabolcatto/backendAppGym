import { Usuario } from './usuario.entity.js';
import { orm } from '../shared/db/orm.js';
const em = orm.em;
function sanitizeUsuarioInput(req, res, next) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        tel: req.body.tel,
        mail: req.body.mail,
    };
    //more checks here
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}
async function findAll(req, res) {
    try {
        const usuarios = await em.find(Usuario, {});
        res.status(200).json({ message: 'se encotraron todos los usuarios', data: usuarios });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function findOne(req, res) {
    try {
        const id = req.params.id;
        const usuario = await em.findOneOrFail(Usuario, { id });
        res.status(200).json({ message: 'usuario encontrado', data: usuario });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function add(req, res) {
    try {
        const usuario = em.create(Usuario, req.body.sanitizedInput);
        await em.flush();
        res.status(201).json({ message: 'usuario creado', data: usuario });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function update(req, res) {
    try {
        const id = req.params.id;
        const usuario = await em.findOneOrFail(Usuario, { id });
        em.assign(usuario, req.body.sanitizedInput);
        await em.flush();
        res
            .status(200)
            .json({ message: 'usuario creado', data: usuario });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function remove(req, res) {
    try {
        const id = req.params.id;
        const usuario = em.getReference(Usuario, id);
        await em.removeAndFlush(usuario);
        res
            .status(200)
            .json({ message: 'usuario borrado' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export { sanitizeUsuarioInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=usuario.controler.js.map