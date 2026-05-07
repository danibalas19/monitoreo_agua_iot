import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ComandoRemotoController } from '../controllers/comandoRemotoController.js';

const router = express.Router();

// ========================
// CRUD Comandos Remotos
// ========================
// Lectura: Admin, Operador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.getAllComandos);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.getComandoById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.createComando);
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.updateComando);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), ComandoRemotoController.deleteComando);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/actuador/:actuadorId', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.getComandosByActuador);
router.get('/pendientes/listar', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.getComandosPendientes);
router.get('/usuario/:usuarioId/historial', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.getHistorialPorUsuario);

// Control: Admin, Operador
router.put('/:id/estado', autenticar, autorizar(['ADMIN', 'OPERADOR']), ComandoRemotoController.updateEstadoComando);

export default router;
