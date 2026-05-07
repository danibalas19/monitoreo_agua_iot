import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ComandoRemotoController } from '../controllers/comandoRemotoController.js';

const router = express.Router();

// CRUD Comandos Remotos (protegidas con JWT)
router.get('/', autenticar, ComandoRemotoController.getAllComandos);
router.get('/:id', autenticar, ComandoRemotoController.getComandoById);
router.post('/', autenticar, ComandoRemotoController.createComando);
router.put('/:id', autenticar, ComandoRemotoController.updateComando);
router.delete('/:id', autenticar, ComandoRemotoController.deleteComando);

// Rutas especiales (protegidas con JWT)
router.get('/actuador/:actuadorId', autenticar, ComandoRemotoController.getComandosByActuador);
router.get('/pendientes/listar', autenticar, ComandoRemotoController.getComandosPendientes);
router.put('/:id/estado', autenticar, ComandoRemotoController.updateEstadoComando);
router.get('/usuario/:usuarioId/historial', autenticar, ComandoRemotoController.getHistorialPorUsuario);

export default router;
