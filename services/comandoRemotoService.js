import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class ComandoRemotoService {
  static async getAllComandos(filters = {}) {
    try {
      let query = `
        SELECT cr.*, a.tipo as actuador_tipo, d.codigo as dispositivo_codigo, u.nombre as usuario_nombre
        FROM comando_remoto cr
        LEFT JOIN actuador a ON cr.actuador_id = a.id
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN usuario u ON cr.usuario_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.actuador_id) {
        query += ' AND cr.actuador_id = ?';
        params.push(filters.actuador_id);
      }

      if (filters.estado) {
        query += ' AND cr.estado = ?';
        params.push(filters.estado);
      }

      if (filters.usuario_id) {
        query += ' AND cr.usuario_id = ?';
        params.push(filters.usuario_id);
      }

      query += ' ORDER BY cr.timestamp DESC LIMIT 500';
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener comandos remotos:', error);
      throw error;
    }
  }

  static async getComandoById(id) {
    try {
      const query = `
        SELECT cr.*, a.tipo as actuador_tipo, d.codigo as dispositivo_codigo, u.nombre as usuario_nombre
        FROM comando_remoto cr
        LEFT JOIN actuador a ON cr.actuador_id = a.id
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN usuario u ON cr.usuario_id = u.id
        WHERE cr.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener comando ${id}:`, error);
      throw error;
    }
  }

  static async createComando(data) {
    try {
      const query = `
        INSERT INTO comando_remoto (actuador_id, usuario_id, comando, timestamp, estado)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.actuador_id,
        data.usuario_id,
        data.comando,
        new Date(),
        data.estado || 'pendiente'
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear comando remoto:', error);
      throw error;
    }
  }

  static async updateComando(id, data) {
    try {
      const query = `
        UPDATE comando_remoto
        SET actuador_id = ?, usuario_id = ?, comando = ?, estado = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.actuador_id,
        data.usuario_id,
        data.comando,
        data.estado,
        id
      ]);
      return await this.getComandoById(id);
    } catch (error) {
      logger.error(`Error al actualizar comando ${id}:`, error);
      throw error;
    }
  }

  static async updateEstadoComando(id, estado) {
    try {
      const query = 'UPDATE comando_remoto SET estado = ? WHERE id = ?';
      await pool.query(query, [estado, id]);
      return await this.getComandoById(id);
    } catch (error) {
      logger.error(`Error al actualizar estado del comando ${id}:`, error);
      throw error;
    }
  }

  static async deleteComando(id) {
    try {
      const query = 'DELETE FROM comando_remoto WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar comando ${id}:`, error);
      throw error;
    }
  }

  static async getComandosByActuador(actuadorId) {
    try {
      const query = `
        SELECT cr.*, a.tipo as actuador_tipo, u.nombre as usuario_nombre
        FROM comando_remoto cr
        LEFT JOIN actuador a ON cr.actuador_id = a.id
        LEFT JOIN usuario u ON cr.usuario_id = u.id
        WHERE cr.actuador_id = ?
        ORDER BY cr.timestamp DESC
      `;
      const [rows] = await pool.query(query, [actuadorId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener comandos del actuador ${actuadorId}:`, error);
      throw error;
    }
  }

  static async getComandosPendientes() {
    try {
      const query = `
        SELECT cr.*, a.tipo as actuador_tipo, d.codigo as dispositivo_codigo, u.nombre as usuario_nombre
        FROM comando_remoto cr
        LEFT JOIN actuador a ON cr.actuador_id = a.id
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN usuario u ON cr.usuario_id = u.id
        WHERE cr.estado = 'pendiente'
        ORDER BY cr.timestamp ASC
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener comandos pendientes:', error);
      throw error;
    }
  }

  static async getHistorialPorUsuario(usuarioId, limit = 50) {
    try {
      const query = `
        SELECT cr.*, a.tipo as actuador_tipo, d.codigo as dispositivo_codigo
        FROM comando_remoto cr
        LEFT JOIN actuador a ON cr.actuador_id = a.id
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        WHERE cr.usuario_id = ?
        ORDER BY cr.timestamp DESC
        LIMIT ?
      `;
      const [rows] = await pool.query(query, [usuarioId, limit]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener historial del usuario ${usuarioId}:`, error);
      throw error;
    }
  }
}
