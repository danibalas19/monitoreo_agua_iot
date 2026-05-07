import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = express.Router();

// Nota: En una aplicación real, protegerías las rutas con estos middlewares
// Ejemplo:
// router.get('/', autenticar, controlador.obtener);
// router.post('/', autenticar, autorizar(['admin']), controlador.crear);

// Este archivo sirve como ejemplo de cómo estructurar las rutas protegidas

export default router;
