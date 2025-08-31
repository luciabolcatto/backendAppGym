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
import { orm } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //se pueden agregar mas metodos aca
    allowedHeaders: ['Content-Type', 'Authorization'],}));

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
app.use('/uploads', express.static('public/uploads'));

app.use((_, res, __) => {
  res.status(404).send({ message: 'Resource not found' });
});

app.listen(5500, () => {
  console.log('Server runnning on http://localhost:5500/');
});
