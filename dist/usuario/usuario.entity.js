import crypto from 'node:crypto';
export class Usuario {
    constructor(nombre, apellido, tel, mail, id = crypto.randomUUID()) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.tel = tel;
        this.mail = mail;
        this.id = id;
    }
}
//# sourceMappingURL=usuario.entity.js.map