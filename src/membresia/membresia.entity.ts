import {
  Entity,
  Property,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Contrato } from '../contrato/contrato.entity.js';

@Entity()
export class Membresia extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  descripcion!: string;

  @Property({ nullable: false })
  precio!: number;

  @Property({ nullable: false })
  meses!: number;

  @OneToMany(() => Contrato, (contrato) => contrato.membresia, {
    cascade: [Cascade.ALL],
  })
  contratos = new Collection<Contrato>(this)
}
