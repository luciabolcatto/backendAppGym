import { Entity, PrimaryKey, Property } from '@mikro-orm/mongodb';

@Entity()
export class Membresia {
  @PrimaryKey()
  _id!: string;  

  @Property()
  nro!: string;

  @Property()
  nombre!: string;

  @Property()
  descripcion!: string;

  @Property()
  precio!: number;

  @Property()
  fechaDesde!: Date;

  constructor(nro: string, nombre: string, descripcion: string, precio: number, fechaDesde: Date) {
    this.nro = nro;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.fechaDesde = fechaDesde;
  }
}
