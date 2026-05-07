import express from 'express';
import { UsuarioController } from '../controllers/usuarioController.js';

const router = express.Router();

// CRUD Usuarios
router.get('/', UsuarioController.getAllUsuarios);
router.get('/:id', UsuarioController.getUsuarioById);
router.post('/', UsuarioController.createUsuario);
router.put('/:id', UsuarioController.updateUsuario);
router.delete('/:id', UsuarioController.deleteUsuario);

// Rutas especiales
router.post('/auth/login', UsuarioController.autenticar);
router.put('/:id/cambiar-password', UsuarioController.cambiarPassword);
router.put('/:id/desactivar', UsuarioController.desactivarUsuario);
router.put('/:id/activar', UsuarioController.activarUsuario);

export default router;
