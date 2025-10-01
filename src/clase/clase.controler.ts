import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Clase } from './clase.entity.js';
import { Actividad } from '../actividad/actividad.entity.js';
import { ObjectId } from 'mongodb';
import { Entrenador } from '../entrenador/entrenador.entity.js';

const em = orm.em;

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
async function findAll(req: Request, res: Response) {
  try {
    const actividadId = req.query.actividadId as string | undefined;

    // build where condition: si viene actividadId, filtramos por la relación
    let where: any = {};

    // If actividadId is provided, attempt to filter in the DB when possible.
    // We try to use getReference for a valid ObjectId-like value. If it's not
    // a valid ObjectId, we won't fail the request — we'll fetch and filter
    // in-memory to support non-ObjectId ids or populated relations.
    let clases: any[] = [];

    if (actividadId) {
      try {
        where = { actividad: actividadId };
        clases = await em.find(Clase, where, {
          populate: ['entrenador', 'actividad', 'reservas'],
        });
      } catch (err) {
        console.error('Error filtrando por actividadId:', err);
        return res
          .status(500)
          .json({ message: 'Error filtrando por actividad' });
      }
    } else {
      clases = await em.find(
        Clase,
        {},
        {
          populate: ['entrenador', 'actividad', 'reservas'],
        }
      );
    }

    res
      .status(200)
      .json({ message: 'se encontraron las clases', data: clases });
  } catch (error: any) {
    console.error('findAll clases error:', error);
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const clase = await em.findOneOrFail(
      Clase,
      { id },
      { populate: ['entrenador', 'actividad', 'reservas'] }
    );
    res.status(200).json({ message: 'clase encontrada', data: clase });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput || req.body;

    // Recuperar entidades relacionadas
    const actividad = await em.findOneOrFail(Actividad, input.actividad);
    const entrenador = await em.findOneOrFail(Entrenador, input.entrenador);

    // Crear la clase usando referencias reales
    const clase = em.create(Clase, {
      fecha_hora_ini: input.fecha_hora_ini,
      fecha_hora_fin: input.fecha_hora_fin,
      cupo_disp: input.cupo_disp,
      actividad, // referencia real
      entrenador, // referencia real
    });

    await em.flush();

    res.status(201).json({ message: 'clase creada', data: clase });
  } catch (error: any) {
    console.error('Error creando clase:', error);
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const clase = await em.findOneOrFail(Clase, { id });
    const input = req.body.sanitizedInput || req.body;
    em.assign(clase, input);
    await em.flush();
    res.status(200).json({ message: 'clase actualizada', data: clase });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const clase = em.getReference(Clase, id);
    await em.removeAndFlush(clase);
    res.status(200).send({ message: 'clase eliminada' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeClaseInput, findAll, findOne, add, update, remove };
