import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { DispositivoIotController } from '../controllers/dispositivoIotController.js';

const router = express.Router();

// ========================
// CRUD Dispositivos
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), DispositivoIotController.getAllDispositivos);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), DispositivoIotController.getDispositivoById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), DispositivoIotController.createDispositivo);
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), DispositivoIotController.updateDispositivo);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), DispositivoIotController.deleteDispositivo);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/jaguey/:jagueyId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), DispositivoIotController.getDispositivosByJaguey);
router.get('/conectados/listar', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), DispositivoIotController.getDispositivosConectados);
router.get('/stats/por-estado', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), DispositivoIotController.getDispositivosPorEstado);

// Control: Admin, Operador
router.put('/:id/estado-conectividad', autenticar, autorizar(['ADMIN', 'OPERADOR']), DispositivoIotController.updateEstadoConectividad);

export default router;
