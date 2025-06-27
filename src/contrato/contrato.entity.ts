import {  Entity, ManyToOne, Property,  Rel} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

@Entity()
export class Contrato extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora_ini: Date = new Date()

  @Property({ nullable: false })
  fecha_hora_fin!: Date

  @Property({ nullable: false })
  estado!: string

  @ManyToOne(() => Usuario , { nullable: false })
  usuario!: Rel <Usuario>




}