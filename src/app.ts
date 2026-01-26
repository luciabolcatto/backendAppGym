import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { UsuarioRouter } from './usuario/usuario.routes.js';
import { ContratoRouter } from './contrato/contrato.routes.js';
import { ReservaRouter } from './reserva/reserva.routes.js';
import { actividadRouter } from './actividad/actividad.routes.js';
import { EntrenadorRouter } from './entrenador/entrenador.routes.js';
import { MembresiaRouter } from './membresia/membresia.routes.js';
import {ClaseRouter} from './clase/clase.routes.js';
import { AdminRouter } from './admin/admin.routes.js';
import { StripeRouter } from './stripe/stripe.routes.js';
import { handleWebhook } from './stripe/stripe.controller.js';
import { valoracionRouter } from './valoracion/valoracion.routes.js';
import { orm } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { verificarVencimientos } from './contrato/contrato.controler.js';
import { actualizarReservas } from './reserva/reserva.controler.js';

dotenv.config();
const app = express();

// Webhook de Stripe - DEBE ir ANTES de express.json()
// Stripe requiere el body raw para verificar la firma
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  RequestContext.create(orm.em, () => handleWebhook(req, res));
});

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], //se pueden agregar mas metodos aca
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Servir archivos estáticos (imágenes)
// Ej: http://localhost:5500/public/uploads/<clase>/<id>/<archivo>
app.use('/public', express.static('public'));

//luego de los middlewares base
app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});
//antes de las rutas y middlewares de negocio

app.use('/api/Usuarios', UsuarioRouter);
app.use('/api/Contratos', ContratoRouter);
app.use('/api/Reservas', ReservaRouter);
app.use('/api/actividad', actividadRouter);
app.use('/api/entrenadores', EntrenadorRouter);
app.use('/api/membresias', MembresiaRouter);
app.use('/api/clases',ClaseRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/stripe', StripeRouter);
app.use('/api/valoraciones', valoracionRouter);


app.use((_, res, __) => {
  res.status(404).send({ message: 'Resource not found' });
});

app.listen(5500, async () => {
  console.log('Server runnning on http://localhost:5500/');
  
  // Verificar contratos vencidos al iniciar el servidor
  console.log(' Verificando contratos vencidos al iniciar...');
  
  try {
    // Crear un contexto de EntityManager para la verificación inicial
    await RequestContext.create(orm.em, async () => {
      const resultado = await verificarVencimientos() as any;
      console.log(` Se verificaron contratos vencidos al iniciar`);
      if (resultado?.contratosActualizados > 0) {
        console.log(` Contratos actualizados: ${resultado.contratosActualizados}`);
      }
    });
  } catch (error) {
    console.error(' Error al verificar contratos vencidos:', error);
  }

  // Actualizar reservas al iniciar el servidor
  console.log(' Actualizando reservas al iniciar...');
  
  try {
    await RequestContext.create(orm.em, async () => {
      const resultado = await actualizarReservas() as any;
      if (resultado.actualizadas > 0) {
        console.log(` ${resultado.actualizadas} reservas actualizadas al iniciar`);
      } else {
        console.log(` No hay reservas para actualizar al iniciar`);
      }
    });
  } catch (error) {
    console.error(' Error al actualizar reservas al iniciar:', error);
  }

  // Scheduler automático para contratos (cada hora)
  setInterval(async () => {
    try {
      await RequestContext.create(orm.em, async () => {
        const resultado = await verificarVencimientos() as any;
        if (resultado?.contratosActualizados > 0) {
          console.log(` Scheduler: ${resultado.contratosActualizados} contratos actualizados automáticamente`);
        }
      });
    } catch (error) {
      console.error(' Error en scheduler de contratos:', error);
    }
  }, 60 * 60 * 1000); // Cada hora

  // Scheduler automático para reservas (cada 10 minutos)
  setInterval(async () => {
    try {
      await RequestContext.create(orm.em, async () => {
        const resultado = await actualizarReservas() as any;
        if (resultado.actualizadas > 0) {
          console.log(` Scheduler: ${resultado.actualizadas} reservas actualizadas automáticamente`);
        }
      });
    } catch (error) {
      console.error(' Error en scheduler de reservas:', error);
    }
  }, 10 * 60 * 1000); // Cada 10 minutos

  console.log(' Schedulers iniciados:');
  console.log('   - Contratos: cada 1 hora');
  console.log('   - Reservas: cada 10 minutos');
});
