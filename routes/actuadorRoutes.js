import express from 'express';
import { ActuadorController } from '../controllers/actuadorController.js';

const router = express.Router();

// CRUD Actuadores
router.get('/', ActuadorController.getAllActuadores);
router.get('/:id', ActuadorController.getActuadorById);
router.post('/', ActuadorController.createActuador);
router.put('/:id', ActuadorController.updateActuador);
router.delete('/:id', ActuadorController.deleteActuador);

// Rutas especiales
router.get('/dispositivo/:dispositivoId', ActuadorController.getActuadoresByDispositivo);
router.get('/jaguey/:jagueyId', ActuadorController.getActuadoresByJaguey);
router.put('/:id/activar', ActuadorController.activarActuador);
router.put('/:id/desactivar', ActuadorController.desactivarActuador);
router.put('/:id/estado', ActuadorController.updateEstadoActuador);

export default router;
