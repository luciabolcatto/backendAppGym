
import { orm } from '../db/orm.js';
import { Usuario } from '../../usuario/usuario.entity.js';
import { Entrenador } from '../../entrenador/entrenador.entity.js';
import { Actividad } from '../../actividad/actividad.entity.js';
import { Membresia } from '../../membresia/membresia.entity.js';
import { Contrato, EstadoContrato } from '../../contrato/contrato.entity.js';
import { Clase } from '../../clase/clase.entity.js';
import { Reserva, EstadoReserva } from '../../reserva/reserva.entity.js';
import bcrypt from 'bcrypt';

async function seedCompleto() {
  const em = orm.em.fork();

  console.log('Limpiando datos existentes...');
  // Limpiar en orden inverso por las relaciones
  await em.nativeDelete(Reserva, {});
  await em.nativeDelete(Clase, {});
  await em.nativeDelete(Contrato, {});
  await em.getCollection('entrenador_actividades').deleteMany({});
  await em.nativeDelete(Entrenador, {});
  await em.nativeDelete(Actividad, {});
  await em.nativeDelete(Membresia, {}); 
  await em.nativeDelete(Usuario, {});

  console.log('Creando actividades...');
  // 1. ACTIVIDADES (con IDs fijos para que coincidan con las carpetas de fotos)
  const actividades = [
    em.create(Actividad, {
      id: '68e578233c5910d2261820a1',
      nombre: 'Yoga',
      descripcion: 'Práctica de yoga para principiantes y nivel intermedio. Conecta tu mente y cuerpo.',
      cupo: 15
    }),
    em.create(Actividad, {
      id: '68e578233c5910d2261820a2',
      nombre: 'Yoga Avanzado', 
      descripcion: 'Práctica avanzada de yoga con posturas complejas y técnicas de respiración.',
      cupo: 12
    }),
    em.create(Actividad, {
      id: '68e578233c5910d2261820a3',
      nombre: 'Spinning',
      descripcion: 'Entrenamiento cardiovascular intenso en bicicleta estática con música motivadora.',
      cupo: 20
    })
  ];

  await em.persistAndFlush(actividades);
  console.log('Actividades creadas correctamente.');

  console.log('Creando entrenadores...');
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
    })
  ];

  await em.persistAndFlush(entrenadores);
  console.log('Entrenadores creados correctamente.');

  // 3. ASIGNAR ACTIVIDADES A ENTRENADORES
  console.log('Asignando actividades a entrenadores...');
  // Juan - Yoga y Yoga Avanzado
  entrenadores[0].actividades.add(actividades[0]);
  entrenadores[0].actividades.add(actividades[1]);
  
  // María - Yoga (básico)
  entrenadores[1].actividades.add(actividades[0]);
  
  // Carlos - Spinning
  entrenadores[2].actividades.add(actividades[2]);

  await em.persistAndFlush(entrenadores);
  console.log('Actividades asignadas a entrenadores correctamente.');

  console.log('Creando membresías...');
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
  const crearContrato = (usuario: any, membresia: any, estado: EstadoContrato, fechaInicio: Date) => {
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + membresia.meses);
    
    // Generar método de pago realista para contratos pagados y vencidos (que fueron pagados en su momento)
    let metodoPago = undefined;
    let fechaPago = undefined;
    let fechaCancelacion = undefined;
    
    if (estado === EstadoContrato.PAGADO || estado === EstadoContrato.VENCIDO) {
      const metodos = ['Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia Bancaria', 'Efectivo', 'Pago Simulado'];
      metodoPago = metodos[Math.floor(Math.random() * metodos.length)];
      
      // Fecha de pago: entre 1-7 días después de la fecha de inicio
      const diasPago = Math.floor(Math.random() * 7) + 1; // 1-7 días
      fechaPago = new Date(fechaInicio.getTime() + diasPago * 24 * 60 * 60 * 1000);
    }
    
    if (estado === EstadoContrato.CANCELADO) {
      // Los cancelados pueden haber sido pagados primero o no (muy poco común)
      const fuePagado = Math.random() < 0.1; // Solo 10% chance de haber sido pagado antes (poco común)
      
      if (fuePagado) {
        const metodos = ['Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia Bancaria', 'Efectivo', 'Pago Simulado'];
        metodoPago = metodos[Math.floor(Math.random() * metodos.length)];
        
        // Fecha de pago: 1-5 días después del inicio
        const diasPago = Math.floor(Math.random() * 5) + 1;
        fechaPago = new Date(fechaInicio.getTime() + diasPago * 24 * 60 * 60 * 1000);
        
        // Fecha de cancelación: 5-20 días después del pago
        const diasCancelacion = Math.floor(Math.random() * 16) + 5; // 5-20 días
        fechaCancelacion = new Date(fechaPago.getTime() + diasCancelacion * 24 * 60 * 60 * 1000);
      } else {
        // Cancelado sin pagar: fecha de cancelación 1-10 días después del inicio (más común)
        const diasCancelacion = Math.floor(Math.random() * 10) + 1; // 1-10 días
        fechaCancelacion = new Date(fechaInicio.getTime() + diasCancelacion * 24 * 60 * 60 * 1000);
      }
    }
    
    return em.create(Contrato, {
      fecha_hora_ini: fechaInicio,
      fecha_hora_fin: fechaFin,
      estado: estado,
      usuario: usuario,
      membresia: membresia,
      metodoPago: metodoPago,
      fechaPago: fechaPago,
      fechaCancelacion: fechaCancelacion
    });
  };

  // Pedro (usuarios[0]) - Varios contratos terminados y uno pagado actual
  let fechaInicio = new Date(ahora.getTime() - 365 * 24 * 60 * 60 * 1000); // Hace 1 año
  contratos.push(crearContrato(usuarios[0], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[0], membresias[1], EstadoContrato.VENCIDO, fechaInicio)); // Premium terminada
  fechaInicio = new Date(fechaInicio.getTime() + 93 * 24 * 60 * 60 * 1000); // +3 meses
  contratos.push(crearContrato(usuarios[0], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  // PAGADO: Premium iniciada hace 2 meses, vence en 1 mes (futuro)
  fechaInicio = new Date(ahora.getTime() - 60 * 24 * 60 * 60 * 1000); // Hace 2 meses
  contratos.push(crearContrato(usuarios[0], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (vence en enero 2026)

  // Laura (usuarios[1]) - Varios cancelados y uno pendiente
  fechaInicio = new Date(ahora.getTime() - 200 * 24 * 60 * 60 * 1000); // Hace 200 días
  contratos.push(crearContrato(usuarios[1], membresias[0], EstadoContrato.CANCELADO, fechaInicio)); // Básica cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 45 * 24 * 60 * 60 * 1000); // +45 días
  contratos.push(crearContrato(usuarios[1], membresias[3], EstadoContrato.CANCELADO, fechaInicio)); // Estudiante cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 50 * 24 * 60 * 60 * 1000); // +50 días
  contratos.push(crearContrato(usuarios[1], membresias[0], EstadoContrato.PENDIENTE, fechaInicio)); // Básica PENDIENTE

  // Diego (usuarios[2]) - Varios terminados
  fechaInicio = new Date(ahora.getTime() - 300 * 24 * 60 * 60 * 1000); // Hace 300 días
  contratos.push(crearContrato(usuarios[2], membresias[3], EstadoContrato.VENCIDO, fechaInicio)); // Estudiante terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[2], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[2], membresias[1], EstadoContrato.VENCIDO, fechaInicio)); // Premium terminada

  // Sofia (usuarios[3]) - Varios pendientes
  fechaInicio = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000); // Hace 15 días
  contratos.push(crearContrato(usuarios[3], membresias[0], EstadoContrato.PENDIENTE, fechaInicio)); // Básica PENDIENTE
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (en el futuro)
  contratos.push(crearContrato(usuarios[3], membresias[1], EstadoContrato.PENDIENTE, fechaInicio)); // Premium PENDIENTE

  // Miguel (usuarios[4]) - Dos contratos pagados encadenados
  fechaInicio = new Date(ahora.getTime() - 20 * 24 * 60 * 60 * 1000); // Hace 20 días
  contratos.push(crearContrato(usuarios[4], membresias[0], EstadoContrato.PAGADO, fechaInicio)); // Básica PAGADO (vence en 10 días)
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (encadenado exacto)
  contratos.push(crearContrato(usuarios[4], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (vence en enero 2026)

  // Carmen (usuarios[5]) - Dos contratos pagados encadenados
  fechaInicio = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000); // Hace 15 días
  contratos.push(crearContrato(usuarios[5], membresias[0], EstadoContrato.PAGADO, fechaInicio)); // Básica PAGADO (vence en 15 días)
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (encadenado exacto)
  contratos.push(crearContrato(usuarios[5], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (vence en enero 2026)

  // Andrés (usuarios[6]) - Dos contratos pagados encadenados
  fechaInicio = new Date(ahora.getTime() - 10 * 24 * 60 * 60 * 1000); // Hace 10 días
  contratos.push(crearContrato(usuarios[6], membresias[0], EstadoContrato.PAGADO, fechaInicio)); // Básica PAGADO (vence en 20 días)
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (encadenado exacto)
  contratos.push(crearContrato(usuarios[6], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (vence en enero 2026)

  // Valentina (usuarios[7]) - Un pagado actual
  fechaInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000); // Hace 30 días
  contratos.push(crearContrato(usuarios[7], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (vence en diciembre 2025)

  // Joaquín (usuarios[8]) - Varios pendientes
  fechaInicio = new Date(ahora.getTime() - 10 * 24 * 60 * 60 * 1000); // Hace 10 días
  contratos.push(crearContrato(usuarios[8], membresias[3], EstadoContrato.PENDIENTE, fechaInicio)); // Estudiante PENDIENTE
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[8], membresias[0], EstadoContrato.PENDIENTE, fechaInicio)); // Básica PENDIENTE

  // Isabella (usuarios[9]) - Varios terminados y uno pagado actual
  fechaInicio = new Date(ahora.getTime() - 240 * 24 * 60 * 60 * 1000); // Hace 240 días
  contratos.push(crearContrato(usuarios[9], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[9], membresias[3], EstadoContrato.VENCIDO, fechaInicio)); // Estudiante terminada
  fechaInicio = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000); // Hace 5 días (fecha más segura)
  contratos.push(crearContrato(usuarios[9], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (válido hasta enero)

  // Nicolás (usuarios[10]) - Terminados, cancelado y uno pagado actual
  fechaInicio = new Date(ahora.getTime() - 120 * 24 * 60 * 60 * 1000); // Hace 120 días
  contratos.push(crearContrato(usuarios[10], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[10], membresias[1], EstadoContrato.CANCELADO, fechaInicio)); // Premium cancelada
  fechaInicio = new Date(ahora.getTime() - 3 * 24 * 60 * 60 * 1000); // Hace 3 días (fecha más segura)
  contratos.push(crearContrato(usuarios[10], membresias[0], EstadoContrato.PAGADO, fechaInicio)); // Básica PAGADO (válido hasta noviembre)

  // Camila (usuarios[11]) - Un pagado y uno pendiente encadenado
  fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000); // Hace 7 días (fecha más segura)
  contratos.push(crearContrato(usuarios[11], membresias[0], EstadoContrato.PAGADO, fechaInicio)); // Básica PAGADO (válido hasta noviembre)
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes (encadenado)
  contratos.push(crearContrato(usuarios[11], membresias[1], EstadoContrato.PENDIENTE, fechaInicio)); // Premium PENDIENTE

  // Sebastián (usuarios[12]) - Varios cancelados y uno pagado actual
  fechaInicio = new Date(ahora.getTime() - 100 * 24 * 60 * 60 * 1000); // Hace 100 días
  contratos.push(crearContrato(usuarios[12], membresias[0], EstadoContrato.CANCELADO, fechaInicio)); // Básica cancelada
  fechaInicio = new Date(fechaInicio.getTime() + 31 * 24 * 60 * 60 * 1000); // +1 mes
  contratos.push(crearContrato(usuarios[12], membresias[3], EstadoContrato.CANCELADO, fechaInicio)); // Estudiante cancelada
  fechaInicio = new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000); // Hace 2 días (fecha muy segura)
  contratos.push(crearContrato(usuarios[12], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (válido hasta enero)

  // Lucía (usuarios[13]) - Un terminado anual y uno pagado actual
  fechaInicio = new Date(ahora.getTime() - 400 * 24 * 60 * 60 * 1000); // Hace 400 días
  contratos.push(crearContrato(usuarios[13], membresias[2], EstadoContrato.VENCIDO, fechaInicio)); // Anual terminada
  fechaInicio = new Date(ahora.getTime() - 4 * 24 * 60 * 60 * 1000); // Hace 4 días (fecha muy segura)
  contratos.push(crearContrato(usuarios[13], membresias[1], EstadoContrato.PAGADO, fechaInicio)); // Premium PAGADO (válido hasta enero)

  // Mateo (usuarios[14]) - Varios terminados y uno pagado actual
  fechaInicio = new Date(ahora.getTime() - 200 * 24 * 60 * 60 * 1000); // Hace 200 días
  contratos.push(crearContrato(usuarios[14], membresias[1], EstadoContrato.VENCIDO, fechaInicio)); // Premium terminada
  fechaInicio = new Date(fechaInicio.getTime() + 93 * 24 * 60 * 60 * 1000); // +3 meses
  contratos.push(crearContrato(usuarios[14], membresias[0], EstadoContrato.VENCIDO, fechaInicio)); // Básica terminada
  fechaInicio = new Date(ahora.getTime() - 1 * 24 * 60 * 60 * 1000); // Hace 1 día (fecha muy segura)
  contratos.push(crearContrato(usuarios[14], membresias[3], EstadoContrato.PAGADO, fechaInicio)); // Estudiante PAGADO (válido hasta noviembre)

  // Los últimos 3 usuarios (15, 16, 17) no tienen contratos para probar "sin-contrato"

  // ⚠️ CONTRATOS DE PRUEBA: PAGADOS pero con fechas VIEJAS (para probar verificarVencimientos)
  console.log('🧪 Agregando contratos de prueba con fechas viejas...');
  
  // Pedro - Contrato pagado pero vencido hace 30 días
  let fechaVencidaInicio = new Date(ahora.getTime() - 60 * 24 * 60 * 60 * 1000); // Hace 60 días
  contratos.push(em.create(Contrato, {
    fecha_hora_ini: fechaVencidaInicio,
    fecha_hora_fin: new Date(fechaVencidaInicio.getTime() + 30 * 24 * 60 * 60 * 1000), // Vencido hace 30 días
    estado: EstadoContrato.PAGADO, // ⚠️ PAGADO pero vencido
    usuario: usuarios[0],
    membresia: membresias[0],
    metodoPago: 'Tarjeta de Crédito',
    fechaPago: new Date(fechaVencidaInicio.getTime() + 2 * 24 * 60 * 60 * 1000) // Pagado 2 días después del inicio
  }));

  // Laura - Contrato pagado pero vencido hace 15 días  
  fechaVencidaInicio = new Date(ahora.getTime() - 45 * 24 * 60 * 60 * 1000); // Hace 45 días
  contratos.push(em.create(Contrato, {
    fecha_hora_ini: fechaVencidaInicio,
    fecha_hora_fin: new Date(fechaVencidaInicio.getTime() + 30 * 24 * 60 * 60 * 1000), // Vencido hace 15 días
    estado: EstadoContrato.PAGADO, // ⚠️ PAGADO pero vencido
    usuario: usuarios[1],
    membresia: membresias[3],
    metodoPago: 'Efectivo',
    fechaPago: new Date(fechaVencidaInicio.getTime() + 1 * 24 * 60 * 60 * 1000) // Pagado 1 día después del inicio
  }));

  // Diego - Contrato pagado pero vencido hace 5 días
  fechaVencidaInicio = new Date(ahora.getTime() - 35 * 24 * 60 * 60 * 1000); // Hace 35 días
  contratos.push(em.create(Contrato, {
    fecha_hora_ini: fechaVencidaInicio,
    fecha_hora_fin: new Date(fechaVencidaInicio.getTime() + 30 * 24 * 60 * 60 * 1000), // Vencido hace 5 días
    estado: EstadoContrato.PAGADO, // ⚠️ PAGADO pero vencido
    usuario: usuarios[2],
    membresia: membresias[0],
    metodoPago: 'Transferencia Bancaria',
    fechaPago: new Date(fechaVencidaInicio.getTime() + 3 * 24 * 60 * 60 * 1000) // Pagado 3 días después del inicio
  }));

  await em.persistAndFlush(contratos);
  console.log('✅ Contratos creados!');

  console.log('🏃 Creando clases...');
  // 7. CLASES (últimos 3 días + próximos 7 días con horarios realistas de gym: L-S 7:00-22:00)
  const clases = [];
  
  // Generar clases desde hace 3 días hasta dentro de 7 días
  for (let dia = -3; dia < 7; dia++) {
    const fechaClase = new Date(ahora);
    fechaClase.setDate(fechaClase.getDate() + dia);
    
    // Solo clases de Lunes a Sábado (día 0 = hoy, revisar día de la semana)
    const diaSemana = fechaClase.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    if (diaSemana === 0) continue; // Saltar domingos
    
    // Yoga Matutino - 7:30 AM (1 hora) - Todos los días L-S
    const yogaMañana = new Date(fechaClase);
    yogaMañana.setHours(7, 30, 0, 0);
    const yogaMañanaFin = new Date(yogaMañana);
    yogaMañanaFin.setHours(8, 30, 0, 0);
    
    clases.push(em.create(Clase, {
      fecha_hora_ini: yogaMañana,
      fecha_hora_fin: yogaMañanaFin,
      cupo_disp: 15,
      entrenador: entrenadores[1], // María
      actividad: actividades[0] // Yoga
    }));

    // Spinning Mediodía - 12:00 PM (45 min) - Martes, Jueves, Sábado
    if (diaSemana === 2 || diaSemana === 4 || diaSemana === 6) {
      const spinningMedio = new Date(fechaClase);
      spinningMedio.setHours(12, 0, 0, 0);
      const spinningMedioFin = new Date(spinningMedio);
      spinningMedioFin.setHours(12, 45, 0, 0);
      
      clases.push(em.create(Clase, {
        fecha_hora_ini: spinningMedio,
        fecha_hora_fin: spinningMedioFin,
        cupo_disp: 20,
        entrenador: entrenadores[2], // Carlos
        actividad: actividades[2] // Spinning
      }));
    }

    // Yoga Tarde - 18:00 PM (1 hora) - Lunes, Miércoles, Viernes
    if (diaSemana === 1 || diaSemana === 3 || diaSemana === 5) {
      const yogaTarde = new Date(fechaClase);
      yogaTarde.setHours(18, 0, 0, 0);
      const yogaTardeFin = new Date(yogaTarde);
      yogaTardeFin.setHours(19, 0, 0, 0);
      
      clases.push(em.create(Clase, {
        fecha_hora_ini: yogaTarde,
        fecha_hora_fin: yogaTardeFin,
        cupo_disp: 15,
        entrenador: entrenadores[1], // María
        actividad: actividades[0] // Yoga
      }));
    }

    // Spinning Nocturno - 19:30 PM (1 hora) - Todos los días L-S
    const spinningNoche = new Date(fechaClase);
    spinningNoche.setHours(19, 30, 0, 0);
    const spinningNocheFin = new Date(spinningNoche);
    spinningNocheFin.setHours(20, 30, 0, 0);
    
    clases.push(em.create(Clase, {
      fecha_hora_ini: spinningNoche,
      fecha_hora_fin: spinningNocheFin,
      cupo_disp: 20,
      entrenador: entrenadores[2], // Carlos
      actividad: actividades[2] // Spinning
    }));

    // Yoga Avanzado Nocturno - 21:00 PM (1 hora) - Lunes, Miércoles, Viernes
    if (diaSemana === 1 || diaSemana === 3 || diaSemana === 5) {
      const yogaAvanzado = new Date(fechaClase);
      yogaAvanzado.setHours(21, 0, 0, 0);
      const yogaAvanzadoFin = new Date(yogaAvanzado);
      yogaAvanzadoFin.setHours(22, 0, 0, 0);
      
      clases.push(em.create(Clase, {
        fecha_hora_ini: yogaAvanzado,
        fecha_hora_fin: yogaAvanzadoFin,
        cupo_disp: 12,
        entrenador: entrenadores[0], // Juan
        actividad: actividades[1] // Yoga Avanzado
      }));
    }
  }

  // 🧪 CLASES DE PRUEBA PARA ACTUALIZACIÓN DE RESERVAS
  console.log('🧪 Agregando clases de prueba para actualización de reservas...');
  
  // Clase del pasado (ayer a las 10:00 AM) - para probar reservas de clases pasadas
  const clasePasado = new Date(ahora);
  clasePasado.setDate(clasePasado.getDate() - 1);
  clasePasado.setHours(10, 0, 0, 0);
  const clasePasadoFin = new Date(clasePasado);
  clasePasadoFin.setHours(11, 0, 0, 0);
  
  clases.push(em.create(Clase, {
    fecha_hora_ini: clasePasado,
    fecha_hora_fin: clasePasadoFin,
    cupo_disp: 15,
    entrenador: entrenadores[1], // María
    actividad: actividades[0] // Yoga
  }));

  // Clase a 40 minutos (para NO actualizar)
  const clase40Min = new Date(ahora);
  clase40Min.setMinutes(clase40Min.getMinutes() + 40);
  const clase40MinFin = new Date(clase40Min);
  clase40MinFin.setHours(clase40MinFin.getHours() + 1);
  
  clases.push(em.create(Clase, {
    fecha_hora_ini: clase40Min,
    fecha_hora_fin: clase40MinFin,
    cupo_disp: 20,
    entrenador: entrenadores[2], // Carlos
    actividad: actividades[2] // Spinning
  }));

  // Clase a 25 minutos (para SÍ actualizar)
  const clase25Min = new Date(ahora);
  clase25Min.setMinutes(clase25Min.getMinutes() + 25);
  const clase25MinFin = new Date(clase25Min);
  clase25MinFin.setHours(clase25MinFin.getHours() + 1);
  
  clases.push(em.create(Clase, {
    fecha_hora_ini: clase25Min,
    fecha_hora_fin: clase25MinFin,
    cupo_disp: 12,
    entrenador: entrenadores[0], // Juan
    actividad: actividades[1] // Yoga Avanzado
  }));

await em.persistAndFlush(clases);
  console.log('✅ Clases creadas!');

  console.log('📅 Creando reservas...');
  // 8. RESERVAS (2-3 por clase) con lógica de estados correcta
  const reservas: Reserva[] = [];
  
  // 🧪 RESERVAS DE PRUEBA PARA ACTUALIZACIÓN AUTOMÁTICA
  console.log('🧪 Agregando reservas de prueba específicas...');
  
  // Conseguir las últimas 3 clases que son nuestras clases de prueba
  const clasesTotal = clases.length;
  const clasePasadoPrueba = clases[clasesTotal - 3]; // Clase del pasado
  const clase40MinPrueba = clases[clasesTotal - 2];  // Clase a 40 min (NO debe actualizar)
  const clase25MinPrueba = clases[clasesTotal - 1];  // Clase a 25 min (SÍ debe actualizar)
  
  // Reservas para clase del PASADO con estado PENDIENTE (debe actualizarse a CERRADA)
  reservas.push(
    em.create(Reserva, {
      fecha_hora: new Date(clasePasadoPrueba.fecha_hora_ini.getTime() - 2 * 60 * 60 * 1000), // Reservada 2h antes
      estado: EstadoReserva.PENDIENTE, // 🚨 ESTADO PENDIENTE para clase pasada
      usuario: usuarios[0], // Pedro
      clase: clasePasadoPrueba
    }),
    em.create(Reserva, {
      fecha_hora: new Date(clasePasadoPrueba.fecha_hora_ini.getTime() - 1 * 60 * 60 * 1000), // Reservada 1h antes
      estado: EstadoReserva.PENDIENTE, // 🚨 ESTADO PENDIENTE para clase pasada
      usuario: usuarios[1], // Laura
      clase: clasePasadoPrueba
    })
  );
  
  // Reservas para clase a 40 MINUTOS con estado PENDIENTE (NO debe actualizarse)
  reservas.push(
    em.create(Reserva, {
      fecha_hora: new Date(ahora.getTime() - 10 * 60 * 1000), // Reservada hace 10 min
      estado: EstadoReserva.PENDIENTE, // ✅ Debe permanecer PENDIENTE (>30 min)
      usuario: usuarios[2], // Diego
      clase: clase40MinPrueba
    }),
    em.create(Reserva, {
      fecha_hora: new Date(ahora.getTime() - 5 * 60 * 1000), // Reservada hace 5 min
      estado: EstadoReserva.PENDIENTE, // ✅ Debe permanecer PENDIENTE (>30 min)
      usuario: usuarios[3], // Sofia
      clase: clase40MinPrueba
    })
  );
  
  // Reservas para clase a 25 MINUTOS con estado PENDIENTE (SÍ debe actualizarse a CERRADA)
  reservas.push(
    em.create(Reserva, {
      fecha_hora: new Date(ahora.getTime() - 15 * 60 * 1000), // Reservada hace 15 min
      estado: EstadoReserva.PENDIENTE, // 🚨 ESTADO PENDIENTE (<30 min, debe actualizarse)
      usuario: usuarios[4], // Miguel
      clase: clase25MinPrueba
    }),
    em.create(Reserva, {
      fecha_hora: new Date(ahora.getTime() - 8 * 60 * 1000), // Reservada hace 8 min
      estado: EstadoReserva.PENDIENTE, // 🚨 ESTADO PENDIENTE (<30 min, debe actualizarse)
      usuario: usuarios[5], // Carmen
      clase: clase25MinPrueba
    })
  );
  
  console.log(`🧪 Agregadas 6 reservas de prueba:`);
  console.log(`   - 2 reservas PENDIENTES para clase PASADA (deben → CERRADA)`);
  console.log(`   - 2 reservas PENDIENTES para clase a 40min (deben → PENDIENTE)`);
  console.log(`   - 2 reservas PENDIENTES para clase a 25min (deben → CERRADA)`);
  
  // Crear reservas para cada clase (2-3 reservas por clase)
  let contadorUsuario = 0; // 🔧 Contador global para rotación correcta
  clases.forEach((clase, claseIndex) => {
    const numReservas = Math.floor(Math.random() * 2) + 2; // 2-3 reservas por clase
    const fechaClase = clase.fecha_hora_ini;
    const ahora = new Date();
    const claseYaPaso = fechaClase < ahora;
    const falta30Min = (fechaClase.getTime() - ahora.getTime()) < (30 * 60 * 1000);
    
    for (let i = 0; i < numReservas; i++) {
      const usuario = usuarios[contadorUsuario % usuarios.length]; // 🔧 Usar contador global
      contadorUsuario++; // 🔧 Incrementar para próxima reserva
      let estado: EstadoReserva;
      let fechaReserva: Date;
      
      // Lógica de estados coherente con fechas:
      if (claseYaPaso) {
        // Clase ya pasó: solo puede estar 'cerrada' (se cerró automáticamente) o 'cancelada'
        const fueCancelada = Math.random() < 0.3; // 30% fueron canceladas antes
        
        if (fueCancelada) {
          estado = EstadoReserva.CANCELADA;
          // Fecha de reserva: entre 7 días y 2 horas antes de la clase
          const maxTiempo = 7 * 24 * 60 * 60 * 1000; // 7 días
          const minTiempo = 2 * 60 * 60 * 1000; // 2 horas
          const tiempoAleatorio = Math.floor(Math.random() * (maxTiempo - minTiempo)) + minTiempo;
          fechaReserva = new Date(fechaClase.getTime() - tiempoAleatorio);
        } else {
          estado = EstadoReserva.CERRADA;
          // Fecha de reserva: entre 7 días y 1 hora antes de la clase (se cerró automáticamente a los 30 min)
          const maxTiempo = 7 * 24 * 60 * 60 * 1000; // 7 días
          const minTiempo = 1 * 60 * 60 * 1000; // 1 hora
          const tiempoAleatorio = Math.floor(Math.random() * (maxTiempo - minTiempo)) + minTiempo;
          fechaReserva = new Date(fechaClase.getTime() - tiempoAleatorio);
        }
      } else {
        // Clase aún no ocurrió
        if (falta30Min) {
          // Faltan menos de 30 min: automáticamente 'cerrada' (no se pueden cancelar)
          estado = EstadoReserva.CERRADA;
          // Fecha de reserva: SIEMPRE en el pasado
          // Entre hace 7 días y hace 32 minutos (desde ahora hacia atrás)
          const maxTiempoAtras = 7 * 24 * 60 * 60 * 1000; // 7 días atrás
          const minTiempoAtras = 32 * 60 * 1000; // 32 minutos atrás
          const tiempoAleatorio = Math.floor(Math.random() * (maxTiempoAtras - minTiempoAtras)) + minTiempoAtras;
          fechaReserva = new Date(ahora.getTime() - tiempoAleatorio);
        } else {
          // Falta más de 30 min: puede estar 'pendiente' o 'cancelada'
          const fueCancelada = Math.random() < 0.25; // 25% canceladas
          
          if (fueCancelada) {
            estado = EstadoReserva.CANCELADA;
          } else {
            estado = EstadoReserva.PENDIENTE;
          }
          
          // Fecha de reserva: SIEMPRE en el pasado
          // Entre hace 7 días y hace 1 hora (desde ahora hacia atrás)
          const maxTiempoAtras = 7 * 24 * 60 * 60 * 1000; // 7 días atrás
          const minTiempoAtras = 1 * 60 * 60 * 1000; // 1 hora atrás
          const tiempoAleatorio = Math.floor(Math.random() * (maxTiempoAtras - minTiempoAtras)) + minTiempoAtras;
          fechaReserva = new Date(ahora.getTime() - tiempoAleatorio);
        }
      }
      
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