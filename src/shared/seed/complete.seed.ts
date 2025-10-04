
import { orm } from '../db/orm.js';
import { Usuario } from '../../usuario/usuario.entity.js';
import { Entrenador } from '../../entrenador/entrenador.entity.js';
import { Actividad } from '../../actividad/actividad.entity.js';
import { Membresia } from '../../membresia/membresia.entity.js';
import { Contrato } from '../../contrato/contrato.entity.js';
import { Clase } from '../../clase/clase.entity.js';
import { Reserva } from '../../reserva/reserva.entity.js';
import bcrypt from 'bcrypt';

async function seedCompleto() {
  const em = orm.em.fork();

  console.log('🧹 Limpiando datos existentes...');
  // Limpiar en orden inverso por las relaciones
  await em.nativeDelete(Reserva, {});
  await em.nativeDelete(Clase, {});
  await em.nativeDelete(Contrato, {});
  await em.getCollection('entrenador_actividades').deleteMany({});
  await em.nativeDelete(Entrenador, {});
  await em.nativeDelete(Actividad, {});
  await em.nativeDelete(Membresia, {}); 
  await em.nativeDelete(Usuario, {});

  console.log('🏋️ Creando actividades...');
  // 1. ACTIVIDADES (basadas en las fotos que tienes)
  const actividades = [
    em.create(Actividad, {
      nombre: 'Yoga',
      descripcion: 'Práctica de yoga para principiantes y nivel intermedio. Conecta tu mente y cuerpo.',
      cupo: 15
    }),
    em.create(Actividad, {
      nombre: 'Yoga Avanzado', 
      descripcion: 'Práctica avanzada de yoga con posturas complejas y técnicas de respiración.',
      cupo: 12
    }),
    em.create(Actividad, {
      nombre: 'Spinning',
      descripcion: 'Entrenamiento cardiovascular intenso en bicicleta estática con música motivadora.',
      cupo: 20
    })
  ];

  await em.persistAndFlush(actividades);
  console.log('✅ Actividades creadas!');

  console.log('💪 Creando entrenadores...');
  // 2. ENTRENADORES
  const entrenadores = [
    em.create(Entrenador, {
      nombre: 'Juan',
      apellido: 'Pérez',
      tel: 123456789,
      mail: 'juanperez@mail.com',
      frase: 'La disciplina vence al talento.',
      fotoUrl: '/public/uploads/entrenador/profesor2.jpg'
    }),
    em.create(Entrenador, {
      nombre: 'María',
      apellido: 'Gómez',
      tel: 987654321,
      mail: 'mariagomez@mail.com',
      frase: 'Respira, conecta y supera tus límites.',
      fotoUrl: '/public/uploads/entrenador/profesor3.jpg'
    }),
    em.create(Entrenador, {
      nombre: 'Carlos',
      apellido: 'Ruiz',
      tel: 555666777,
      mail: 'carlosruiz@mail.com',
      frase: 'El sudor de hoy es la fuerza de mañana.',
      fotoUrl: '/public/uploads/entrenador/profesor.jpg'
    }),
    em.create(Entrenador, {
      nombre: 'Ana',
      apellido: 'López',
      tel: 444555666,
      mail: 'analopez@mail.com',
      frase: 'Cada pedalada te acerca a tu mejor versión.',
      fotoUrl: '/public/uploads/entrenador/profesor4.jpg'
    })
  ];

  await em.persistAndFlush(entrenadores);
  console.log('✅ Entrenadores creados!');

  // 3. ASIGNAR ACTIVIDADES A ENTRENADORES
  console.log('🔗 Asignando actividades a entrenadores...');
  // Juan - Yoga y Yoga Avanzado
  entrenadores[0].actividades.add(actividades[0]);
  entrenadores[0].actividades.add(actividades[1]);
  
  // María - Yoga (básico)
  entrenadores[1].actividades.add(actividades[0]);
  
  // Carlos - Spinning
  entrenadores[2].actividades.add(actividades[2]);
  
  // Ana - Spinning y Yoga Avanzado
  entrenadores[3].actividades.add(actividades[2]);
  entrenadores[3].actividades.add(actividades[1]);

  await em.persistAndFlush(entrenadores);
  console.log('✅ Actividades asignadas a entrenadores!');

  console.log('💳 Creando membresías...');
  // 4. MEMBRESÍAS
  const membresias = [
    em.create(Membresia, {
      nombre: 'Básica',
      descripcion: 'Acceso al gimnasio y clases grupales básicas.',
      precio: 5000,
      meses: 1
    }),
    em.create(Membresia, {
      nombre: 'Premium',
      descripcion: 'Acceso completo + clases premium + asesoramiento nutricional.',
      precio: 12000,
      meses: 3
    }),
    em.create(Membresia, {
      nombre: 'Anual',
      descripcion: 'Membresía completa por 12 meses con descuentos especiales.',
      precio: 40000,
      meses: 12
    }),
    em.create(Membresia, {
      nombre: 'Estudiante',
      descripcion: 'Membresía con descuento para estudiantes universitarios.',
      precio: 3500,
      meses: 1
    })
  ];

  await em.persistAndFlush(membresias);
  console.log('✅ Membresías creadas!');

  console.log('👥 Creando usuarios...');
  // 5. USUARIOS (sin foto como pediste)
  const hashedPassword = await bcrypt.hash('123456', 10);
  const usuarios = [
    em.create(Usuario, {
      nombre: 'Pedro',
      apellido: 'García',
      tel: 111222333,
      mail: 'pedro@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Laura',
      apellido: 'Martínez',
      tel: 444555666,
      mail: 'laura@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Diego',
      apellido: 'Fernández',
      tel: 777888999,
      mail: 'diego@mail.com', 
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Sofia',
      apellido: 'Rodriguez',
      tel: 666777888,
      mail: 'sofia@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Miguel',
      apellido: 'Torres',
      tel: 999888777,
      mail: 'miguel@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Carmen',
      apellido: 'Morales',
      tel: 555444333,
      mail: 'carmen@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Andrés',
      apellido: 'Vega',
      tel: 222333444,
      mail: 'andres@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Valentina',
      apellido: 'Castro',
      tel: 888999000,
      mail: 'valentina@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Joaquín',
      apellido: 'Herrera',
      tel: 333222111,
      mail: 'joaquin@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Isabella',
      apellido: 'Mendoza',
      tel: 111000999,
      mail: 'isabella@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Nicolás',
      apellido: 'Silva',
      tel: 777666555,
      mail: 'nicolas@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Camila',
      apellido: 'Ortega',
      tel: 444333222,
      mail: 'camila@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Sebastián',
      apellido: 'Ramírez',
      tel: 666555444,
      mail: 'sebastian@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Lucía',
      apellido: 'Vargas',
      tel: 888777666,
      mail: 'lucia@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Mateo',
      apellido: 'Campos',
      tel: 555666777,
      mail: 'mateo@mail.com',
      contrasena: hashedPassword
    }),
    // Usuarios adicionales SIN CONTRATO para probar la funcionalidad
    em.create(Usuario, {
      nombre: 'Esperanza',
      apellido: 'Moreno', 
      tel: 333444555,
      mail: 'esperanza@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Fernando',
      apellido: 'Jiménez',
      tel: 666777888,
      mail: 'fernando@mail.com',
      contrasena: hashedPassword
    }),
    em.create(Usuario, {
      nombre: 'Gabriela',
      apellido: 'Peña',
      tel: 999000111,
      mail: 'gabriela@mail.com',
      contrasena: hashedPassword
    })
  ];

  await em.persistAndFlush(usuarios);
  console.log('✅ Usuarios creados!');

  console.log('📝 Creando contratos...');
  // 6. CONTRATOS - Múltiples contratos por usuario con fechas encadenadas
  const ahora = new Date();
  const contratos: Contrato[] = [];
  
  // Función para crear contrato con fecha de inicio calculada
  const crearContrato = (usuario: any, membresia: any, estado: string, fechaInicio: Date) => {
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + membresia.meses);
    
    return em.create(Contrato, {
      fecha_hora_ini: fechaInicio,
      fecha_hora_fin: fechaFin,
      estado: estado,
      usuario: usuario,
      membresia: membresia
    });
  };

  // Pedro (usuarios[0]) - Varios contratos terminados y uno pagado actual
  let fechaInicio = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000); // Hace 1 año
  contratos.push(crearContrato(usuarios[0], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[0], membresias[1], 'terminado', fechaInicio)); // Premium terminada
  fechaInicio = new Date(fechaInicio.getTime() + 93 * 24 * 60 * 60 * 1000); // +3 meses
  contratos.push(crearContrato(usuarios[0], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[0], membresias[1], 'pagado', fechaInicio)); // Premium actual PAGADO

  // Laura (usuarios[1]) - Varios cancelados y uno pendiente
  fechaInicio = new Date(ahora.getTime() - 200 * 24 * 60 * 60 * 1000); // Hace 200 días
  contratos.push(crearContrato(usuarios[1], membresias[0], 'cancelado', fechaInicio)); // Básica cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 45 * 24 * 60 * 60 * 1000); // +45 días
  contratos.push(crearContrato(usuarios[1], membresias[3], 'cancelado', fechaInicio)); // Estudiante cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 50 * 24 * 60 * 60 * 1000); // +50 días
  contratos.push(crearContrato(usuarios[1], membresias[0], 'pendiente', fechaInicio)); // Básica PENDIENTE

  // Diego (usuarios[2]) - Varios terminados
  fechaInicio = new Date(ahora.getTime() - 300 * 24 * 60 * 60 * 1000); // Hace 300 días
  contratos.push(crearContrato(usuarios[2], membresias[3], 'terminado', fechaInicio)); // Estudiante terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[2], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[2], membresias[1], 'terminado', fechaInicio)); // Premium terminada

  // Sofia (usuarios[3]) - Varios pendientes
  fechaInicio = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000); // Hace 15 días
  contratos.push(crearContrato(usuarios[3], membresias[0], 'pendiente', fechaInicio)); // Básica PENDIENTE
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (en el futuro)
  contratos.push(crearContrato(usuarios[3], membresias[1], 'pendiente', fechaInicio)); // Premium PENDIENTE

  // Miguel (usuarios[4]) - Varios pagados
  fechaInicio = new Date(ahora.getTime() - 60 * 24 * 60 * 60 * 1000); // Hace 60 días
  contratos.push(crearContrato(usuarios[4], membresias[0], 'pagado', fechaInicio)); // Básica PAGADO
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[4], membresias[1], 'pagado', fechaInicio)); // Premium PAGADO

  // Carmen (usuarios[5]) - Varios cancelados
  fechaInicio = new Date(ahora.getTime() - 150 * 24 * 60 * 60 * 1000); // Hace 150 días
  contratos.push(crearContrato(usuarios[5], membresias[3], 'cancelado', fechaInicio)); // Estudiante cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 40 * 24 * 60 * 60 * 1000); // +40 días
  contratos.push(crearContrato(usuarios[5], membresias[0], 'cancelado', fechaInicio)); // Básica cancelada

  // Andrés (usuarios[6]) - Terminados y uno cancelado
  fechaInicio = new Date(ahora.getTime() - 180 * 24 * 60 * 60 * 1000); // Hace 180 días
  contratos.push(crearContrato(usuarios[6], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[6], membresias[1], 'cancelado', fechaInicio)); // Premium cancelada

  // Valentina (usuarios[7]) - Un pagado actual
  fechaInicio = new Date(ahora.getTime() - 45 * 24 * 60 * 60 * 1000); // Hace 45 días
  contratos.push(crearContrato(usuarios[7], membresias[1], 'pagado', fechaInicio)); // Premium PAGADO

  // Joaquín (usuarios[8]) - Varios pendientes
  fechaInicio = new Date(ahora.getTime() - 10 * 24 * 60 * 60 * 1000); // Hace 10 días
  contratos.push(crearContrato(usuarios[8], membresias[3], 'pendiente', fechaInicio)); // Estudiante PENDIENTE
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[8], membresias[0], 'pendiente', fechaInicio)); // Básica PENDIENTE

  // Isabella (usuarios[9]) - Varios terminados
  fechaInicio = new Date(ahora.getTime() - 240 * 24 * 60 * 60 * 1000); // Hace 240 días
  contratos.push(crearContrato(usuarios[9], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[9], membresias[3], 'terminado', fechaInicio)); // Estudiante terminada

  // Nicolás (usuarios[10]) - Terminados y cancelado
  fechaInicio = new Date(ahora.getTime() - 120 * 24 * 60 * 60 * 1000); // Hace 120 días
  contratos.push(crearContrato(usuarios[10], membresias[0], 'terminado', fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[10], membresias[1], 'cancelado', fechaInicio)); // Premium cancelada

  // Camila (usuarios[11]) - Un pendiente
  fechaInicio = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000); // Hace 5 días
  contratos.push(crearContrato(usuarios[11], membresias[1], 'pendiente', fechaInicio)); // Premium PENDIENTE

  // Sebastián (usuarios[12]) - Varios cancelados
  fechaInicio = new Date(ahora.getTime() - 100 * 24 * 60 * 60 * 1000); // Hace 100 días
  contratos.push(crearContrato(usuarios[12], membresias[0], 'cancelado', fechaInicio)); // Básica cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[12], membresias[3], 'cancelado', fechaInicio)); // Estudiante cancelada

  // Lucía (usuarios[13]) - Un terminado anual
  fechaInicio = new Date(ahora.getTime() - 400 * 24 * 60 * 60 * 1000); // Hace 400 días
  contratos.push(crearContrato(usuarios[13], membresias[2], 'terminado', fechaInicio)); // Anual terminada

  // Mateo (usuarios[14]) - Varios terminados
  fechaInicio = new Date(ahora.getTime() - 200 * 24 * 60 * 60 * 1000); // Hace 200 días
  contratos.push(crearContrato(usuarios[14], membresias[1], 'terminado', fechaInicio)); // Premium terminada
  fechaInicio = new Date(fechaInicio.getTime() + 93 * 24 * 60 * 60 * 1000); // +3 meses
  contratos.push(crearContrato(usuarios[14], membresias[0], 'terminado', fechaInicio)); // Básica terminada

  // Los últimos 3 usuarios (15, 16, 17) no tienen contratos para probar "sin-contrato"

  await em.persistAndFlush(contratos);
  console.log('✅ Contratos creados!');

  console.log('🏃 Creando clases...');
  // 7. CLASES (próximos 7 días, 2-3 clases por día)
  const clases = [];
  
  for (let dia = 0; dia < 7; dia++) {
    const fechaClase = new Date(ahora);
    fechaClase.setDate(fechaClase.getDate() + dia);
    
    // Clase de Yoga - 8:00 AM (1 hora)
    const yogaMañana = new Date(fechaClase);
    yogaMañana.setHours(8, 0, 0, 0);
    const yogaMañanaFin = new Date(yogaMañana);
    yogaMañanaFin.setHours(9, 0, 0, 0);
    
    clases.push(em.create(Clase, {
      fecha_hora_ini: yogaMañana,
      fecha_hora_fin: yogaMañanaFin,
      cupo_disp: 15,
      entrenador: entrenadores[1], // María
      actividad: actividades[0] // Yoga
    }));

    // Spinning - 6:00 PM (1 hora)
    const spinningTarde = new Date(fechaClase);
    spinningTarde.setHours(18, 0, 0, 0);
    const spinningTardeFin = new Date(spinningTarde);
    spinningTardeFin.setHours(19, 0, 0, 0);
    
    clases.push(em.create(Clase, {
      fecha_hora_ini: spinningTarde,
      fecha_hora_fin: spinningTardeFin,
      cupo_disp: 20,
      entrenador: entrenadores[2], // Carlos
      actividad: actividades[2] // Spinning
    }));

    // Yoga Avanzado - Lunes, Miércoles, Viernes (7:00 PM - 1.5 horas)
    if (dia % 2 === 0) { // días pares (0,2,4,6)
      const yogaAvanzado = new Date(fechaClase);
      yogaAvanzado.setHours(19, 0, 0, 0);
      const yogaAvanzadoFin = new Date(yogaAvanzado);
      yogaAvanzadoFin.setHours(20, 30, 0, 0);
      
      clases.push(em.create(Clase, {
        fecha_hora_ini: yogaAvanzado,
        fecha_hora_fin: yogaAvanzadoFin,
        cupo_disp: 12,
        entrenador: entrenadores[0], // Juan
        actividad: actividades[1] // Yoga Avanzado
      }));
    }
  }

  await em.persistAndFlush(clases);
  console.log('✅ Clases creadas!');

  console.log('📅 Creando reservas...');
  // 8. RESERVAS (2-3 por clase) con lógica de estados correcta
  const reservas: Reserva[] = [];
  
  // Crear reservas para cada clase (2-3 reservas por clase)
  clases.forEach((clase, claseIndex) => {
    const numReservas = Math.floor(Math.random() * 2) + 2; // 2-3 reservas por clase
    const fechaClase = clase.fecha_hora_ini;
    const ahora = new Date();
    const claseYaPaso = fechaClase < ahora;
    const falta30Min = (fechaClase.getTime() - ahora.getTime()) < (30 * 60 * 1000);
    
    for (let i = 0; i < numReservas; i++) {
      const usuario = usuarios[i % usuarios.length]; // Rotar entre usuarios
      let estado: string;
      
      // Lógica de estados según las reglas:
      if (claseYaPaso) {
        // Clase ya pasó: solo 'terminada' o 'cancelada'
        estado = Math.random() < 0.8 ? 'terminada' : 'cancelada';
      } else {
        // Clase aún no ocurrió
        if (falta30Min) {
          // Faltan menos de 30 min: solo 'cerrada' o 'cancelada'
          estado = Math.random() < 0.7 ? 'cerrada' : 'cancelada';
        } else {
          // Falta más de 30 min: 'pendiente', 'cancelada'
          estado = Math.random() < 0.6 ? 'pendiente' : 'cancelada';
        }
      }
      
      // Fecha de reserva aleatoria (entre hace 7 días y hace 1 hora)
      const maxTiempo = 7 * 24 * 60 * 60 * 1000; // 7 días
      const minTiempo = 60 * 60 * 1000; // 1 hora
      const tiempoAleatorio = Math.floor(Math.random() * (maxTiempo - minTiempo)) + minTiempo;
      const fechaReserva = new Date(ahora.getTime() - tiempoAleatorio);
      
      reservas.push(em.create(Reserva, {
        fecha_hora: fechaReserva,
        estado: estado,
        usuario: usuario,
        clase: clase
      }));
    }
  });

  await em.persistAndFlush(reservas);
  console.log('✅ Reservas creadas!');

  console.log('🎉 ¡Semilla completa ejecutada exitosamente!');
  console.log(`
📊 RESUMEN:
- ${actividades.length} Actividades
- ${entrenadores.length} Entrenadores  
- ${membresias.length} Membresías
- ${usuarios.length} Usuarios (incluye 3 usuarios sin contratos)
- ${contratos.length} Contratos (múltiples por usuario con fechas encadenadas)
- ${clases.length} Clases
- ${reservas.length} Reservas
  `);

  process.exit(0);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCompleto().catch(console.error);
}

export { seedCompleto };