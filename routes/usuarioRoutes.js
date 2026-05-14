import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { UsuarioController } from '../controllers/usuarioController.js';

const router = express.Router();

// ========================
// RUTAS PÚBLICAS (sin autenticación)
// ========================
router.post('/auth/login', UsuarioController.autenticar);
router.post('/', UsuarioController.createUsuario); // Registro de nuevos usuarios
router.post('/forgot-password', UsuarioController.forgotPassword);
router.post('/reset-password', UsuarioController.resetPassword);

// ========================
// RUTAS PROTEGIDAS - ADMIN ONLY
// ========================
// CRUD Usuarios (solo Admin)
router.get('/', autenticar, autorizar(['ADMIN']), UsuarioController.getAllUsuarios);
router.get('/:id', autenticar, autorizar(['ADMIN']), UsuarioController.getUsuarioById);
router.put('/:id', autenticar, autorizar(['ADMIN']), UsuarioController.updateUsuario);
router.delete('/:id', autenticar, autorizar(['ADMIN']), UsuarioController.deleteUsuario);

// Rutas de gestión (solo Admin)
router.put('/:id/desactivar', autenticar, autorizar(['ADMIN']), UsuarioController.desactivarUsuario);
router.put('/:id/activar', autenticar, autorizar(['ADMIN']), UsuarioController.activarUsuario);

// ========================
// RUTAS PROTEGIDAS - CUALQUIER USUARIO AUTENTICADO
// ========================
// Cambiar contraseña propia
router.put('/:id/cambiar-password', autenticar, UsuarioController.cambiarPassword);

export default router;
