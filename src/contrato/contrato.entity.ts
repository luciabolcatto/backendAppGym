import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Membresia } from '../membresia/membresia.entity.js';

export enum EstadoContrato {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  CANCELADO = 'cancelado',
  VENCIDO = 'vencido'
}

@Entity()
export class Contrato extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora_ini: Date = new Date();

  @Property({ nullable: false })
  fecha_hora_fin!: Date;

  @Property({ nullable: false, default: EstadoContrato.PENDIENTE })
  estado: EstadoContrato = EstadoContrato.PENDIENTE;

  @Property({ nullable: true })
  fechaPago?: Date;

  @Property({ nullable: true })
  fechaCancelacion?: Date;

  @Property({ nullable: true })
  metodoPago?: string;

  @Property({ nullable: true })
  stripeSessionId?: string;

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>;

  @ManyToOne(() => Membresia, { nullable: false })
  membresia!: Rel<Membresia>
}
