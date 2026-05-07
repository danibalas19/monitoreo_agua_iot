import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ActuadorController } from '../controllers/actuadorController.js';

const router = express.Router();

// ========================
// CRUD Actuadores
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ActuadorController.getAllActuadores);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ActuadorController.getActuadorById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), ActuadorController.createActuador);
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), ActuadorController.updateActuador);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), ActuadorController.deleteActuador);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/dispositivo/:dispositivoId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ActuadorController.getActuadoresByDispositivo);
router.get('/jaguey/:jagueyId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ActuadorController.getActuadoresByJaguey);

// Controles operativos: Admin, Operador
router.put('/:id/activar', autenticar, autorizar(['Admin', 'Operador']), ActuadorController.activarActuador);
router.put('/:id/desactivar', autenticar, autorizar(['Admin', 'Operador']), ActuadorController.desactivarActuador);
router.put('/:id/estado', autenticar, autorizar(['Admin', 'Operador']), ActuadorController.updateEstadoActuador);

export default router;
