import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { JagueyController } from '../controllers/jagueyController.js';

const router = express.Router();

// CRUD Jagueys (protegidas con JWT)
router.get('/', autenticar, JagueyController.getAllJagueys);
router.get('/:id', autenticar, JagueyController.getJagueyById);
router.post('/', autenticar, JagueyController.createJaguey);
router.put('/:id', autenticar, JagueyController.updateJaguey);
router.delete('/:id', autenticar, JagueyController.deleteJaguey);

// Rutas especiales (protegidas con JWT)
router.get('/municipio/:municipio', autenticar, JagueyController.getJagueysByMunicipio);
router.get('/:id/stats', autenticar, JagueyController.getJagueyStats);

export default router;
