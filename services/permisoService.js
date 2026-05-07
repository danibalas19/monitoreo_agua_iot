import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class PermisoService {
  /**
   * Obtiene todos los permisos disponibles
   */
  static async getAllPermisos() {
    try {
      const query = `
        SELECT id, nombre, descripcion, modulo, accion
        FROM permiso
        ORDER BY modulo, nombre
      `;
      const [permisos] = await pool.query(query);
      return permisos;
    } catch (error) {
      logger.error('Error al obtener permisos:', error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un rol específico
   * @param {number} rolId - ID del rol
   */
  static async getPermisosByRol(rolId) {
    try {
      const query = `
        SELECT p.id, p.nombre, p.descripcion, p.modulo, p.accion
        FROM permiso p
        JOIN rol_permiso rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = ?
        ORDER BY p.modulo, p.nombre
      `;
      const [permisos] = await pool.query(query, [rolId]);
      return permisos;
    } catch (error) {
      logger.error(`Error al obtener permisos del rol ${rolId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los permisos de un usuario (a través de sus roles)
   * @param {number} usuarioId - ID del usuario
   */
  static async getPermisosByUsuario(usuarioId) {
    try {
      const query = `
        SELECT DISTINCT p.id, p.nombre, p.descripcion, p.modulo, p.accion
        FROM permiso p
        JOIN rol_permiso rp ON p.id = rp.permiso_id
        JOIN usuario_rol ur ON rp.rol_id = ur.rol_id
        WHERE ur.usuario_id = ?
        ORDER BY p.modulo, p.nombre
      `;
      const [permisos] = await pool.query(query, [usuarioId]);
      return permisos;
    } catch (error) {
      logger.error(`Error al obtener permisos del usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un usuario agrupados por módulo
   * Útil para enviar al frontend con estructura organizada
   * @param {number} usuarioId - ID del usuario
   */
  static async getPermisosByUsuarioGrouped(usuarioId) {
    try {
      const permisos = await this.getPermisosByUsuario(usuarioId);
      
      const permisosPorModulo = {};
      permisos.forEach(permiso => {
        if (!permisosPorModulo[permiso.modulo]) {
          permisosPorModulo[permiso.modulo] = [];
        }
        permisosPorModulo[permiso.modulo].push({
          id: permiso.id,
          nombre: permiso.nombre,
          accion: permiso.accion,
          descripcion: permiso.descripcion
        });
      });

      return permisosPorModulo;
    } catch (error) {
      logger.error(`Error al obtener permisos agrupados del usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * @param {number} usuarioId - ID del usuario
   * @param {string} nombrePermiso - Nombre del permiso (ej: 'usuario.crear')
   */
  static async usuarioTienePermiso(usuarioId, nombrePermiso) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM usuario_rol ur
        JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
        JOIN permiso p ON rp.permiso_id = p.id
        WHERE ur.usuario_id = ? AND p.nombre = ?
      `;
      const [resultado] = await pool.query(query, [usuarioId, nombrePermiso]);
      return resultado[0].count > 0;
    } catch (error) {
      logger.error(`Error al verificar permiso ${nombrePermiso} para usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene alguno de los permisos proporcionados
   * @param {number} usuarioId - ID del usuario
   * @param {Array<string>} permisos - Array de nombres de permisos
   */
  static async usuarioTieneAlgunPermiso(usuarioId, permisos) {
    try {
      const placeholders = permisos.map(() => '?').join(',');
      const query = `
        SELECT COUNT(DISTINCT p.nombre) as count
        FROM usuario_rol ur
        JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
        JOIN permiso p ON rp.permiso_id = p.id
        WHERE ur.usuario_id = ? AND p.nombre IN (${placeholders})
      `;
      const [resultado] = await pool.query(query, [usuarioId, ...permisos]);
      return resultado[0].count > 0;
    } catch (error) {
      logger.error(`Error al verificar permisos para usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene todos los permisos proporcionados
   * @param {number} usuarioId - ID del usuario
   * @param {Array<string>} permisos - Array de nombres de permisos
   */
  static async usuarioTieneTodosPermisos(usuarioId, permisos) {
    try {
      const placeholders = permisos.map(() => '?').join(',');
      const query = `
        SELECT COUNT(DISTINCT p.nombre) as count
        FROM usuario_rol ur
        JOIN rol_permiso rp ON ur.rol_id = rp.rol_id
        JOIN permiso p ON rp.permiso_id = p.id
        WHERE ur.usuario_id = ? AND p.nombre IN (${placeholders})
      `;
      const [resultado] = await pool.query(query, [usuarioId, ...permisos]);
      return resultado[0].count === permisos.length;
    } catch (error) {
      logger.error(`Error al verificar permisos para usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param {number} usuarioId - ID del usuario
   * @param {string} nombreRol - Nombre del rol (ej: 'Admin')
   */
  static async usuarioTieneRol(usuarioId, nombreRol) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM usuario_rol ur
        JOIN rol r ON ur.rol_id = r.id
        WHERE ur.usuario_id = ? AND r.nombre = ?
      `;
      const [resultado] = await pool.query(query, [usuarioId, nombreRol]);
      return resultado[0].count > 0;
    } catch (error) {
      logger.error(`Error al verificar rol ${nombreRol} para usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los roles de un usuario
   * @param {number} usuarioId - ID del usuario
   */
  static async getRolesByUsuario(usuarioId) {
    try {
      const query = `
        SELECT r.id, r.nombre
        FROM rol r
        JOIN usuario_rol ur ON r.id = ur.rol_id
        WHERE ur.usuario_id = ?
        ORDER BY r.nombre
      `;
      const [roles] = await pool.query(query, [usuarioId]);
      return roles;
    } catch (error) {
      logger.error(`Error al obtener roles del usuario ${usuarioId}:`, error);
      throw error;
    }
  }

  /**
   * Asigna un permiso a un rol
   * @param {number} rolId - ID del rol
   * @param {number} permisoId - ID del permiso
   */
  static async asignarPermisoARol(rolId, permisoId) {
    try {
      const query = `
        INSERT IGNORE INTO rol_permiso (rol_id, permiso_id)
        VALUES (?, ?)
      `;
      await pool.query(query, [rolId, permisoId]);
      logger.info(`Permiso ${permisoId} asignado al rol ${rolId}`);
      return true;
    } catch (error) {
      logger.error(`Error al asignar permiso al rol:`, error);
      throw error;
    }
  }

  /**
   * Remueve un permiso de un rol
   * @param {number} rolId - ID del rol
   * @param {number} permisoId - ID del permiso
   */
  static async removerPermisoDeRol(rolId, permisoId) {
    try {
      const query = `
        DELETE FROM rol_permiso
        WHERE rol_id = ? AND permiso_id = ?
      `;
      await pool.query(query, [rolId, permisoId]);
      logger.info(`Permiso ${permisoId} removido del rol ${rolId}`);
      return true;
    } catch (error) {
      logger.error(`Error al remover permiso del rol:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el ID de un permiso por su nombre
   * @param {string} nombrePermiso - Nombre del permiso
   */
  static async getPermisoIdByName(nombrePermiso) {
    try {
      const query = `
        SELECT id FROM permiso WHERE nombre = ?
      `;
      const [resultado] = await pool.query(query, [nombrePermiso]);
      return resultado[0]?.id || null;
    } catch (error) {
      logger.error(`Error al obtener ID del permiso ${nombrePermiso}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el ID de un rol por su nombre
   * @param {string} nombreRol - Nombre del rol
   */
  static async getRolIdByName(nombreRol) {
    try {
      const query = `
        SELECT id FROM rol WHERE nombre = ?
      `;
      const [resultado] = await pool.query(query, [nombreRol]);
      return resultado[0]?.id || null;
    } catch (error) {
      logger.error(`Error al obtener ID del rol ${nombreRol}:`, error);
      throw error;
    }
  }
}
