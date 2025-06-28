import {  Entity, ManyToOne, Property,  Rel} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

@Entity()
export class Reserva extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora: Date = new Date()

  @Property({ nullable: false , default:'pendiente'})
  estado!: string

  @ManyToOne(() => Usuario , { nullable: false  })
  usuario!: Rel <Usuario>




}