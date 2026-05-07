import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import pool from '../config/database.js';

/**
 * Middleware de Autenticación
 * Verifica que el JWT sea válido y extrae información del usuario
 */
export const autenticar = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.usuario = decoded;
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    const statusCode = error.name === 'TokenExpiredError' ? 401 : 401;
    return res.status(statusCode).json({
      success: false,
      message: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware de Autorización por Roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {Array<string>} rolesPermitidos - Array de roles permitidos (ej: ['ADMIN', 'OPERADOR'])
 */
export const autorizar = (rolesPermitidos = []) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario está autenticado
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Si no hay roles específicos requeridos, permitir acceso
      if (!rolesPermitidos || rolesPermitidos.length === 0) {
        return next();
      }

      // Obtener roles del usuario de la base de datos
      const query = `
        SELECT DISTINCT r.nombre
        FROM usuario_rol ur
        JOIN rol r ON ur.rol_id = r.id
        WHERE ur.usuario_id = ?
      `;
      const [roleRows] = await pool.query(query, [req.usuario.id]);
      const rolesUsuario = roleRows.map(row => row.nombre.toUpperCase());

      // Verificar si el usuario tiene alguno de los roles permitidos
      const tieneRol = rolesPermitidos.some(rol => 
        rolesUsuario.includes(rol.toUpperCase())
      );

      if (!tieneRol) {
        logger.warn(`Acceso denegado para usuario ${req.usuario.id}. Roles requeridos: ${rolesPermitidos.join(', ')}, Roles usuario: ${rolesUsuario.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Roles requeridos: ${rolesPermitidos.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      // Adjuntar roles al objeto usuario
      req.usuario.roles = rolesUsuario;
      next();
    } catch (error) {
      logger.error('Error en autorización:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        code: 'AUTH_ERROR'
      });
    }
  };
};

/**
 * Middleware de Verificación de Permisos Granulares
 * Verifica que el usuario tenga un permiso específico
 * @param {string} nombrePermiso - Nombre del permiso requerido (ej: 'usuario.crear')
 */
export const verificarPermiso = (nombrePermiso) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Consultar si el usuario tiene el permiso
      const query = `
        SELECT COUNT(*) as count
        FROM usuario_rol ur
        JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
        JOIN permiso p ON rp.permiso_id = p.id
        WHERE ur.usuario_id = ? AND p.nombre = ?
      `;
      const [resultado] = await pool.query(query, [req.usuario.id, nombrePermiso]);

      if (resultado[0].count === 0) {
        logger.warn(`Permiso denegado para usuario ${req.usuario.id}. Permiso requerido: ${nombrePermiso}`);
        return res.status(403).json({
          success: false,
          message: `Permiso denegado. Requiere: ${nombrePermiso}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      logger.error('Error al verificar permiso:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        code: 'AUTH_ERROR'
      });
    }
  };
};

/**
 * Función auxiliar para obtener todos los permisos de un usuario
 * Útil para devolver al frontend qué puede hacer el usuario
 */
export const obtenerPermisosUsuario = async (usuarioId) => {
  try {
    const query = `
      SELECT DISTINCT p.nombre, p.modulo, p.accion
      FROM usuario_rol ur
      JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
      JOIN permiso p ON rp.permiso_id = p.id
      WHERE ur.usuario_id = ?
      ORDER BY p.modulo, p.nombre
    `;
    const [permisos] = await pool.query(query, [usuarioId]);
    return permisos;
  } catch (error) {
    logger.error('Error al obtener permisos del usuario:', error);
    throw error;
  }
};

/**
 * Middleware para adjuntar permisos al objeto request
 * Utilizar antes de responder para incluir permisos disponibles
 */
export const cargarPermisosMiddleware = async (req, res, next) => {
  try {
    if (req.usuario) {
      req.usuario.permisos = await obtenerPermisosUsuario(req.usuario.id);
    }
    next();
  } catch (error) {
    logger.error('Error al cargar permisos:', error);
    next();
  }
};
