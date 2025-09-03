// src/entrenador/entrenador.seed.ts
import { orm } from '../shared/db/orm.js';
import { Entrenador } from './entrenador.entity.js';

async function seedEntrenadores() {
  const em = orm.em.fork();

  // Limpiar entrenadores existentes para no duplicar
  await em.nativeDelete(Entrenador, {});

  const entrenadoresData = [
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      tel: 123456789,
      mail: 'juanperez@mail.com',
      frase: 'La disciplina vence al talento.',
      fotoUrl: '/public/uploads/entrenador/profesor2.jpg',
    },
    {
      nombre: 'María',
      apellido: 'Gómez',
      tel: 987654321,
      mail: 'mariagomez@mail.com',
      frase: 'Respira, conecta y supera tus límites.',
      fotoUrl: '/public/uploads/entrenador/profesor3.jpg',
    },
    {
      nombre: 'Carlos',
      apellido: 'Ruiz',
      tel: 123456789,
      mail: 'carlosruiz@mail.com',
      frase: 'El sudor de hoy es la fuerza de mañana.',
      fotoUrl: '/public/uploads/entrenador/profesor.jpg',
    },
  ];

  const entrenadores = entrenadoresData.map((data) =>
    em.create(Entrenador, data as any)
  );

  await em.persistAndFlush(entrenadores);
  console.log('✅ Entrenadores insertados!');
  process.exit(0);
}

seedEntrenadores();
