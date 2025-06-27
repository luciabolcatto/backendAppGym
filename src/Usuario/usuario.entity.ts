import { Collection, Entity, OneToMany, Property, Cascade, Rel, } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Contrato } from '../contrato/contrato.entity.js'

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

  @OneToMany(() => Contrato, (contrato) => contrato.usuario, { cascade: [Cascade.ALL],})
  contratos = new Collection<Contrato>(this)



}
