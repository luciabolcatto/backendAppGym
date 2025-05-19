import { UsuarioRepository } from './usuario.repository.js';
import { Usuario } from './usuario.entity.js';
const repository = new UsuarioRepository();
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
function findAll(req, res) {
    res.json({ data: repository.findAll() });
}
function findOne(req, res) {
    const id = req.params.id;
    const usuario = repository.findOne({ id });
    if (!usuario) {
        res.status(404).send({ message: 'Usuario no encontrado' });
    }
    else {
        res.json({ data: usuario });
    }
}
function add(req, res) {
    const input = req.body.sanitizedInput;
    const usuarioInput = new Usuario(input.nombre, input.apellido, input.tel, input.mail);
    const usuario = repository.add(usuarioInput);
    res.status(201).send({ message: 'Usuario creado', data: usuario });
}
function update(req, res) {
    req.body.sanitizedInput.id = req.params.id;
    const usuario = repository.update(req.body.sanitizedInput);
    if (!usuario) {
        res.status(404).send({ message: 'Usuario no encontrado' });
    }
    else {
        res.status(200).send({ message: 'Usuario actualizado correctamente', data: usuario });
    }
}
function remove(req, res) {
    const id = req.params.id;
    const usuario = repository.delete({ id });
    if (!usuario) {
        res.status(404).send({ message: 'Usuario no encontrado' });
    }
    else {
        res.status(200).send({ message: 'Usuario borrado correctamente' });
    }
}
export { sanitizeUsuarioInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=usuario.controler.js.map