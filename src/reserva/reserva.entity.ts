import {  Entity, ManyToOne, Property,  Rel} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import {Clase} from '../clase/clase.entity.js'

@Entity()
export class Reserva extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora: Date = new Date()

  @Property({ nullable: false} )
  estado: string = 'pendiente'

  @ManyToOne(() => Usuario , { nullable: false })
  usuario!: Rel <Usuario>


  @ManyToOne(() =>  Clase , { nullable: false })
  clase!: Rel<Clase>;

}