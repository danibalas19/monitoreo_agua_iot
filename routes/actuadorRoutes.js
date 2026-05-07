import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ActuadorController } from '../controllers/actuadorController.js';

const router = express.Router();

// ========================
// CRUD Actuadores
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISUALIZADOR']), ActuadorController.getAllActuadores);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISUALIZADOR']), ActuadorController.getActuadorById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), ActuadorController.createActuador);
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), ActuadorController.updateActuador);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), ActuadorController.deleteActuador);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/dispositivo/:dispositivoId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISUALIZADOR']), ActuadorController.getActuadoresByDispositivo);
router.get('/jaguey/:jagueyId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISUALIZADOR']), ActuadorController.getActuadoresByJaguey);

// Controles operativos: Admin, Operador
router.put('/:id/activar', autenticar, autorizar(['ADMIN', 'OPERADOR']), ActuadorController.activarActuador);
router.put('/:id/desactivar', autenticar, autorizar(['ADMIN', 'OPERADOR']), ActuadorController.desactivarActuador);
router.put('/:id/estado', autenticar, autorizar(['ADMIN', 'OPERADOR']), ActuadorController.updateEstadoActuador);

export default router;
