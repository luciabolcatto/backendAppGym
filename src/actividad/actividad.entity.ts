import {
  Entity,
  Property
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Actividad extends BaseEntity {
  @Property({ nullable: false, unique: true })
  nombre!: string

  @Property()
  descripcion!: string

  @Property()
  cupo!: number
 
}
