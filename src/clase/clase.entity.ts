import { Entity, ManyToOne,OneToMany,Property, Rel,Cascade,Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import {Reserva} from '../reserva/reserva.entity.js';
import {Actividad} from '../actividad/actividad.entity.js';
import {Entrenador} from '../entrenador/entrenador.entity.js';



@Entity()
export class Clase extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora_ini: Date = new Date();

  @Property({ nullable: false })
  fecha_hora_fin!: Date;

  @Property({ nullable: false })
  cupo_disp!: number

  @ManyToOne(() => Entrenador, { nullable: false })
  entrenador!: Rel<Entrenador>;

  @ManyToOne(() => Actividad , { nullable: false })
  actividad!: Rel<Actividad>;

  @OneToMany(() => Reserva, (reserva) => reserva.clase, {
    cascade: [Cascade.ALL],
  })
  reservas = new Collection<Reserva>(this)



}
