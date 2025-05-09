import crypto from 'node:crypto'

export class Usuario {
  constructor(
    public nombre: string,
    public apellido: string,
    public tel: number,
    public mail: string,
    public id_u = crypto.randomUUID()
  ) {}
}
