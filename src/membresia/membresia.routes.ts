import { Router } from 'express';
import { MembresiaController } from './membresia.controller.js';

const router = Router();
const controller = new MembresiaController();

// Definimos las rutas y qué método del controller llaman
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export { router as MembresiaRouter };
