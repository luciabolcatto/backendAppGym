import crypto from 'node:crypto'

export class Membresia {
  constructor(
    public nro :string,
    public nombre: string,
    public descripcion : string,
    public precio: number,
    public fechaDesde: Date,
    public id = crypto.randomUUID()
  ) {} //llaves cuerpo de constructor para validaciones y transformaciones
}