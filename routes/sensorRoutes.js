import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { SensorController } from '../controllers/sensorController.js';

const router = express.Router();

// ========================
// CRUD Sensores
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), SensorController.getAllSensores);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), SensorController.getSensorById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), SensorController.createSensor);
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), SensorController.updateSensor);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), SensorController.deleteSensor);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/dispositivo/:dispositivoId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), SensorController.getSensoresByDispositivo);
router.get('/tipo/:tipoVariableId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), SensorController.getSensoresByTipo);

// Control: Admin, Operador
router.put('/:id/activar', autenticar, autorizar(['ADMIN', 'OPERADOR']), SensorController.activarSensor);
router.put('/:id/desactivar', autenticar, autorizar(['ADMIN', 'OPERADOR']), SensorController.desactivarSensor);

export default router;
