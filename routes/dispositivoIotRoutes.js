import express from 'express';
import { DispositivoIotController } from '../controllers/dispositivoIotController.js';

const router = express.Router();

// CRUD Dispositivos
router.get('/', DispositivoIotController.getAllDispositivos);
router.get('/:id', DispositivoIotController.getDispositivoById);
router.post('/', DispositivoIotController.createDispositivo);
router.put('/:id', DispositivoIotController.updateDispositivo);
router.delete('/:id', DispositivoIotController.deleteDispositivo);

// Rutas especiales
router.get('/jaguey/:jagueyId', DispositivoIotController.getDispositivosByJaguey);
router.get('/conectados/listar', DispositivoIotController.getDispositivosConectados);
router.put('/:id/estado-conectividad', DispositivoIotController.updateEstadoConectividad);
router.get('/stats/por-estado', DispositivoIotController.getDispositivosPorEstado);

export default router;
