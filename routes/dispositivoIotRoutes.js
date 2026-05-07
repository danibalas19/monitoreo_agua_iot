import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { DispositivoIotController } from '../controllers/dispositivoIotController.js';

const router = express.Router();

// ========================
// CRUD Dispositivos
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), DispositivoIotController.getAllDispositivos);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), DispositivoIotController.getDispositivoById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), DispositivoIotController.createDispositivo);
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), DispositivoIotController.updateDispositivo);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), DispositivoIotController.deleteDispositivo);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/jaguey/:jagueyId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), DispositivoIotController.getDispositivosByJaguey);
router.get('/conectados/listar', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), DispositivoIotController.getDispositivosConectados);
router.get('/stats/por-estado', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), DispositivoIotController.getDispositivosPorEstado);

// Control: Admin, Operador
router.put('/:id/estado-conectividad', autenticar, autorizar(['Admin', 'Operador']), DispositivoIotController.updateEstadoConectividad);

export default router;
