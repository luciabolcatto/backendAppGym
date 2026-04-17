
import 'dotenv/config';
import 'reflect-metadata';
import { seedCompleto } from './complete.seed.js';

console.log(' Iniciando proceso de semilla completa...');

seedCompleto()
  .then(() => {
    console.log(' Semilla completada exitosamente!');
  })
  .catch((error) => {
    console.error(' Error ejecutando la semilla:', error);
    process.exit(1);
  });