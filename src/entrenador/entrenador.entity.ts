import { Collection, Entity, OneToMany, Property, Cascade, ManyToMany } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Actividad } from '../actividad/actividad.entity.js'
import {Clase} from '../clase/clase.entity.js'

@Entity()
export class Entrenador extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string

  @Property({ nullable: false })
  apellido!: string

  @Property({ nullable: false })
  tel!: number

  @Property({ nullable: false })
  mail!: string

  @ManyToMany(() => Actividad, (actividad) => actividad.entrenadores, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  actividades = new Collection<Actividad>(this)

  @OneToMany(() => Clase, (clase) => clase.entrenador, {
    cascade: [Cascade.ALL],
  })
  clases = new Collection<Clase>(this)



}
