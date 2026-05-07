import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ActuadorController } from '../controllers/actuadorController.js';

const router = express.Router();

// CRUD Actuadores (protegidas con JWT)
router.get('/', autenticar, ActuadorController.getAllActuadores);
router.get('/:id', autenticar, ActuadorController.getActuadorById);
router.post('/', autenticar, ActuadorController.createActuador);
router.put('/:id', autenticar, ActuadorController.updateActuador);
router.delete('/:id', autenticar, ActuadorController.deleteActuador);

// Rutas especiales (protegidas con JWT)
router.get('/dispositivo/:dispositivoId', autenticar, ActuadorController.getActuadoresByDispositivo);
router.get('/jaguey/:jagueyId', autenticar, ActuadorController.getActuadoresByJaguey);
router.put('/:id/activar', autenticar, ActuadorController.activarActuador);
router.put('/:id/desactivar', autenticar, ActuadorController.desactivarActuador);
router.put('/:id/estado', autenticar, ActuadorController.updateEstadoActuador);

export default router;
