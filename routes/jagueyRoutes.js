import express from 'express';
import { JagueyController } from '../controllers/jagueyController.js';

const router = express.Router();

// CRUD Jagueys
router.get('/', JagueyController.getAllJagueys);
router.get('/:id', JagueyController.getJagueyById);
router.post('/', JagueyController.createJaguey);
router.put('/:id', JagueyController.updateJaguey);
router.delete('/:id', JagueyController.deleteJaguey);

// Rutas especiales
router.get('/municipio/:municipio', JagueyController.getJagueysByMunicipio);
router.get('/:id/stats', JagueyController.getJagueyStats);

export default router;
