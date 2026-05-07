import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { SensorController } from '../controllers/sensorController.js';

const router = express.Router();

// ========================
// CRUD Sensores
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), SensorController.getAllSensores);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), SensorController.getSensorById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), SensorController.createSensor);
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), SensorController.updateSensor);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), SensorController.deleteSensor);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/dispositivo/:dispositivoId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), SensorController.getSensoresByDispositivo);
router.get('/tipo/:tipoVariableId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), SensorController.getSensoresByTipo);

// Control: Admin, Operador
router.put('/:id/activar', autenticar, autorizar(['Admin', 'Operador']), SensorController.activarSensor);
router.put('/:id/desactivar', autenticar, autorizar(['Admin', 'Operador']), SensorController.desactivarSensor);

export default router;
