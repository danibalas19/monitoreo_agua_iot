import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { UsuarioController } from '../controllers/usuarioController.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post('/auth/login', UsuarioController.autenticar);
router.post('/', UsuarioController.createUsuario); // Registro de nuevos usuarios

// CRUD Usuarios (protegidas)
router.get('/', autenticar, UsuarioController.getAllUsuarios);
router.get('/:id', autenticar, UsuarioController.getUsuarioById);
router.put('/:id', autenticar, UsuarioController.updateUsuario);
router.delete('/:id', autenticar, UsuarioController.deleteUsuario);

// Rutas especiales (protegidas)
router.put('/:id/cambiar-password', autenticar, UsuarioController.cambiarPassword);
router.put('/:id/desactivar', autenticar, UsuarioController.desactivarUsuario);
router.put('/:id/activar', autenticar, UsuarioController.activarUsuario);

export default router;
