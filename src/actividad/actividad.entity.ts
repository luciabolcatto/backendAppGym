import { Entity, Property, ManyToMany, Collection,Cascade, OneToMany} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Entrenador } from '../entrenador/entrenador.entity.js'
import {Clase} from '../clase/clase.entity.js'

@Entity()
export class Actividad extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nombre!: string

  @Property()
  descripcion!: string

  @Property()
  cupo!: number
 
  @ManyToMany(() => Entrenador, (entrenador) => entrenador.actividades)
  entrenadores = new Collection<Entrenador>(this)

  @OneToMany(() => Clase, (clase) => clase.actividad, {
    cascade: [Cascade.ALL],
  })
  clases = new Collection<Clase>(this)


}
