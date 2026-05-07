import { UsuarioService } from '../services/usuarioService.js';
import { PermisoService } from '../services/permisoService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class UsuarioController {
  static getAllUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await UsuarioService.getAllUsuarios();
    res.json({
      success: true,
      data: usuarios,
      message: 'Usuarios obtenidos exitosamente'
    });
  });

  static getUsuarioById = asyncHandler(async (req, res) => {
    const usuario = await UsuarioService.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    res.json({
      success: true,
      data: usuario,
      message: 'Usuario obtenido exitosamente'
    });
  });

  static createUsuario = asyncHandler(async (req, res) => {
    const usuario = await UsuarioService.createUsuario(req.body);
    res.status(201).json({
      success: true,
      data: usuario,
      message: 'Usuario creado exitosamente'
    });
    logger.info(`Usuario creado: ${usuario.nombre} (${usuario.email})`);
  });

  static updateUsuario = asyncHandler(async (req, res) => {
    const usuario = await UsuarioService.updateUsuario(req.params.id, req.body);
    res.json({
      success: true,
      data: usuario,
      message: 'Usuario actualizado exitosamente'
    });
    logger.info(`Usuario actualizado: ${usuario.nombre} (ID: ${usuario.id})`);
  });

  static deleteUsuario = asyncHandler(async (req, res) => {
    await UsuarioService.deleteUsuario(req.params.id);
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
    logger.info(`Usuario eliminado (ID: ${req.params.id})`);
  });

  static cambiarPassword = asyncHandler(async (req, res) => {
    await UsuarioService.cambiarPassword(
      req.params.id,
      req.body.password_actual,
      req.body.password_nueva
    );
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
    logger.info(`Contraseña cambada para usuario (ID: ${req.params.id})`);
  });

  static autenticar = asyncHandler(async (req, res) => {
    const result = await UsuarioService.autenticar(req.body.email, req.body.password);
    res.json({
      success: true,
      data: {
        usuario: result.usuario,
        token: result.token
      },
      message: 'Autenticación exitosa'
    });
    logger.info(`Usuario autenticado: ${result.usuario.nombre}`);
  });

  static desactivarUsuario = asyncHandler(async (req, res) => {
    const usuario = await UsuarioService.desactivarUsuario(req.params.id);
    res.json({
      success: true,
      data: usuario,
      message: 'Usuario desactivado exitosamente'
    });
    logger.info(`Usuario desactivado: ${usuario.nombre} (ID: ${usuario.id})`);
  });

  static activarUsuario = asyncHandler(async (req, res) => {
    const usuario = await UsuarioService.activarUsuario(req.params.id);
    res.json({
      success: true,
      data: usuario,
      message: 'Usuario activado exitosamente'
    });
    logger.info(`Usuario activado: ${usuario.nombre} (ID: ${usuario.id})`);
  });

  /**
   * Obtiene los roles de un usuario
   */
  static getRolesUsuario = asyncHandler(async (req, res) => {
    const roles = await PermisoService.getRolesByUsuario(req.params.id);
    res.json({
      success: true,
      data: roles,
      message: 'Roles obtenidos exitosamente'
    });
  });

  /**
   * Obtiene los permisos de un usuario (agrupados por módulo)
   */
  static getPermisosUsuario = asyncHandler(async (req, res) => {
    const permisos = await PermisoService.getPermisosByUsuarioGrouped(req.params.id);
    res.json({
      success: true,
      data: permisos,
      message: 'Permisos obtenidos exitosamente'
    });
  });

  /**
   * Asigna un rol a un usuario
   */
  static asignarRol = asyncHandler(async (req, res) => {
    const { rol_id } = req.body;
    
    if (!rol_id) {
      return res.status(400).json({
        success: false,
        message: 'rol_id es requerido'
      });
    }

    await UsuarioService.asignarRoles(req.params.id, [rol_id]);
    const usuario = await UsuarioService.getUsuarioById(req.params.id);
    
    res.json({
      success: true,
      data: usuario,
      message: 'Rol asignado exitosamente'
    });
    logger.info(`Rol ${rol_id} asignado al usuario ${req.params.id}`);
  });

  /**
   * Remueve un rol de un usuario
   */
  static removerRol = asyncHandler(async (req, res) => {
    const { rol_id } = req.body;
    
    if (!rol_id) {
      return res.status(400).json({
        success: false,
        message: 'rol_id es requerido'
      });
    }

    const query = `
      DELETE FROM usuario_rol 
      WHERE usuario_id = ? AND rol_id = ?
    `;
    const pool = require('../config/database.js').default;
    await pool.query(query, [req.params.id, rol_id]);
    
    const usuario = await UsuarioService.getUsuarioById(req.params.id);
    
    res.json({
      success: true,
      data: usuario,
      message: 'Rol removido exitosamente'
    });
    logger.info(`Rol ${rol_id} removido del usuario ${req.params.id}`);
  });
}
