import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Membresia } from '../membresia/membresia.entity.js';

@Entity()
export class Contrato extends BaseEntity {
  @Property({ nullable: false })
  fecha_hora_ini: Date = new Date();

  @Property({ nullable: false })
  fecha_hora_fin!: Date;

  @Property({ nullable: false })
  estado: string = 'activo';

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>;

  @ManyToOne(() => Membresia, { nullable: false })
  membresia!: Rel<Membresia>
}
