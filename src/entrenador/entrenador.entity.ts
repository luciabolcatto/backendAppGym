import {
  Collection,
  Entity,
  OneToMany,
  Property,
  Cascade,
  ManyToMany,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Actividad } from '../actividad/actividad.entity.js';
import { Clase } from '../clase/clase.entity.js';
import { Request, Response, NextFunction } from 'express';

@Entity()
export class Entrenador extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  apellido!: string;

  @Property({ nullable: false })
  tel!: number;

  @Property({ nullable: false })
  mail!: string;

  @Property({ nullable: true })
  frase!: string;

  @Property({ nullable: true })
  fotoUrl!: string;

  @ManyToMany(() => Actividad, (actividad) => actividad.entrenadores, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  actividades = new Collection<Actividad>(this);

  @OneToMany(() => Clase, (clase) => clase.entrenador, {
    cascade: [Cascade.ALL],
  })
  clases = new Collection<Clase>(this);
}

function sanitizeClaseInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fecha_hora_ini: req.body.fecha_hora_ini,
    fecha_hora_fin: req.body.fecha_hora_fin,
    cupo_disp: req.body.cupo_disp,
    entrenador: req.body.entrenador,
    actividad: req.body.actividad,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}
