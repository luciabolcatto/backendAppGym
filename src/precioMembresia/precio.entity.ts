import crypto from 'node:crypto'

export class PrecioMembresia {
  constructor(
    public valor : number, 
    public fechaDesde : Date,
    public membresiaId :string,
    public id = crypto.randomUUID()
  ) {} //llaves cuerpo de constructor para validaciones y transformaciones
} 