import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { SensorController } from '../controllers/sensorController.js';

const router = express.Router();

// CRUD Sensores (protegidas con JWT)
router.get('/', autenticar, SensorController.getAllSensores);
router.get('/:id', autenticar, SensorController.getSensorById);
router.post('/', autenticar, SensorController.createSensor);
router.put('/:id', autenticar, SensorController.updateSensor);
router.delete('/:id', autenticar, SensorController.deleteSensor);

// Rutas especiales (protegidas con JWT)
router.get('/dispositivo/:dispositivoId', autenticar, SensorController.getSensoresByDispositivo);
router.get('/tipo/:tipoVariableId', autenticar, SensorController.getSensoresByTipo);
router.put('/:id/activar', autenticar, SensorController.activarSensor);
router.put('/:id/desactivar', autenticar, SensorController.desactivarSensor);

export default router;
