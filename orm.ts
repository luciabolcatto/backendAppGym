import { MikroORM } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';


export const orm = await MikroORM.init({
  entities: ['./dist/**/*entities/*.js'],       // Ruta compilada (JS)
  entitiesTs: ['./src/**/*entities/*.ts'],      // Ruta fuente (TS)
  dbName: 'gym-app',
  clientUrl: 'mongodb://localhost:27017',
  highlighter: new SqlHighlighter(),        
  //type : 'mysql' --> no se usa mas, sino no funciona
  debug: true,
  schemaGenerator:{//never in production
    disableForeignKeys: true,
    createForeignKeyConstraints: true, // 
    ignoreSchema:[],

  },
})
export const syscSchema = async () => {
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema()
  /*
  await generator.dropSchema();
  await generator.createSchema();
  */ 
 //para crear y borrar la base de datos

}
