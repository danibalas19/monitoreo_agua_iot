import express from 'express';
import { ComandoRemotoController } from '../controllers/comandoRemotoController.js';

const router = express.Router();

// CRUD Comandos Remotos
router.get('/', ComandoRemotoController.getAllComandos);
router.get('/:id', ComandoRemotoController.getComandoById);
router.post('/', ComandoRemotoController.createComando);
router.put('/:id', ComandoRemotoController.updateComando);
router.delete('/:id', ComandoRemotoController.deleteComando);

// Rutas especiales
router.get('/actuador/:actuadorId', ComandoRemotoController.getComandosByActuador);
router.get('/pendientes/listar', ComandoRemotoController.getComandosPendientes);
router.put('/:id/estado', ComandoRemotoController.updateEstadoComando);
router.get('/usuario/:usuarioId/historial', ComandoRemotoController.getHistorialPorUsuario);

export default router;
