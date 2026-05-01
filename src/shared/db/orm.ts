import 'dotenv/config';
import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';

import { Actividad } from '../../actividad/actividad.entity.js';
import { Clase } from '../../clase/clase.entity.js';
import { Contrato } from '../../contrato/contrato.entity.js';
import { Entrenador } from '../../entrenador/entrenador.entity.js';
import { Membresia } from '../../membresia/membresia.entity.js';
import { Reserva } from '../../reserva/reserva.entity.js';
import { Usuario } from '../../usuario/usuario.entity.js';
import { Valoracion } from '../../valoracion/valoracion.entity.js';
import { BaseEntity } from './baseEntity.entity.js';

const clientUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName =
  process.env.TEST_DB_NAME ||
  (process.env.NODE_ENV === 'test' ? 'gym_test' : 'gym');
const isProduction = process.env.NODE_ENV === 'production';

export const orm = await MikroORM.init({
  driver: MongoDriver,
  entities: [
    Actividad,
    Clase,
    Contrato,
    Entrenador,
    Membresia,
    Reserva,
    Usuario,
    Valoracion,
    BaseEntity,
  ],
  dbName,
  clientUrl,
  debug: !isProduction,
  ...(!isProduction && {
    schemaGenerator: {
      // never in production
      disableForeignKeys: true,
      createForeignKeyConstraints: true,
      ignoreSchema: [],
    },
  }),
});

export const syncSchema = async () => {
  if (isProduction) {
    return;
  }

  const generator = orm.getSchemaGenerator();
  /*   
  await generator.dropSchema()
  await generator.createSchema()
  */
  await generator.updateSchema();
};
