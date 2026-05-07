import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { DispositivoIotController } from '../controllers/dispositivoIotController.js';

const router = express.Router();

// CRUD Dispositivos (protegidas con JWT)
router.get('/', autenticar, DispositivoIotController.getAllDispositivos);
router.get('/:id', autenticar, DispositivoIotController.getDispositivoById);
router.post('/', autenticar, DispositivoIotController.createDispositivo);
router.put('/:id', autenticar, DispositivoIotController.updateDispositivo);
router.delete('/:id', autenticar, DispositivoIotController.deleteDispositivo);

// Rutas especiales (protegidas con JWT)
router.get('/jaguey/:jagueyId', autenticar, DispositivoIotController.getDispositivosByJaguey);
router.get('/conectados/listar', autenticar, DispositivoIotController.getDispositivosConectados);
router.put('/:id/estado-conectividad', autenticar, DispositivoIotController.updateEstadoConectividad);
router.get('/stats/por-estado', autenticar, DispositivoIotController.getDispositivosPorEstado);

export default router;
