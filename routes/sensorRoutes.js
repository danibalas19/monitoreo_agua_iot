import express from 'express';
import { SensorController } from '../controllers/sensorController.js';

const router = express.Router();

// CRUD Sensores
router.get('/', SensorController.getAllSensores);
router.get('/:id', SensorController.getSensorById);
router.post('/', SensorController.createSensor);
router.put('/:id', SensorController.updateSensor);
router.delete('/:id', SensorController.deleteSensor);

// Rutas especiales
router.get('/dispositivo/:dispositivoId', SensorController.getSensoresByDispositivo);
router.get('/tipo/:tipoVariableId', SensorController.getSensoresByTipo);
router.put('/:id/activar', SensorController.activarSensor);
router.put('/:id/desactivar', SensorController.desactivarSensor);

export default router;
