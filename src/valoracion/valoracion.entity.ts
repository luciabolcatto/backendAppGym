import { Entity, ManyToOne, Property, Rel, Unique } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { Entrenador } from '../entrenador/entrenador.entity.js'

@Entity()
@Unique({ properties: ['usuario', 'entrenador'] })//Unique para que evite duplicados. un mismo usuario no puede tener 2 valoraciones para un mismo entrenador
export class Valoracion extends BaseEntity {

  @Property({ nullable: false })
  rating!: number  // 1..5

  @Property({ nullable: true })
  comentario?: string

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>

  @ManyToOne(() => Entrenador, { nullable: false })
  entrenador!: Rel<Entrenador>
}
