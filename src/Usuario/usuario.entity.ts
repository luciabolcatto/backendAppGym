import { Collection, Entity, ManyToMany, Property, Cascade, Rel, } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string

  @Property({ nullable: false })
  apellido!: string

  @Property({ nullable: false })
  tel!: number

  @Property({ nullable: false })
  mail!: string


}
