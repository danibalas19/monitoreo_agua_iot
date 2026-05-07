import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ComandoRemotoController } from '../controllers/comandoRemotoController.js';

const router = express.Router();

// ========================
// CRUD Comandos Remotos
// ========================
// Lectura: Admin, Operador
router.get('/', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.getAllComandos);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.getComandoById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.createComando);
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.updateComando);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), ComandoRemotoController.deleteComando);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/actuador/:actuadorId', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.getComandosByActuador);
router.get('/pendientes/listar', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.getComandosPendientes);
router.get('/usuario/:usuarioId/historial', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.getHistorialPorUsuario);

// Control: Admin, Operador
router.put('/:id/estado', autenticar, autorizar(['Admin', 'Operador']), ComandoRemotoController.updateEstadoComando);

export default router;
