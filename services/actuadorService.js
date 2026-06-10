import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class ActuadorService {
  static async getAllActuadores(filters = {}) {
    try {
      let query = `
        SELECT a.*, d.codigo as dispositivo_codigo, ea.nombre as estado_nombre
        FROM actuador a
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN estado_actuador ea ON a.estado_actual = ea.id
        WHERE a.activo = TRUE
      `;
      const params = [];

      if (filters.dispositivo_id) {
        query += ' AND a.dispositivo_id = ?';
        params.push(filters.dispositivo_id);
      }

      if (filters.tipo) {
        query += ' AND a.tipo = ?';
        params.push(filters.tipo);
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener actuadores:', error);
      throw error;
    }
  }

  static async getActuadorById(id) {
    try {
      const query = `
        SELECT a.*, d.codigo as dispositivo_codigo, d.jaguey_id, ea.nombre as estado_nombre
        FROM actuador a
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN estado_actuador ea ON a.estado_actual = ea.id
        WHERE a.id = ? AND a.activo = TRUE
      `;
      const [rows] = await pool.query(query, [id, id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener actuador ${id}:`, error);
      throw error;
    }
  }

  static async createActuador(data) {
    try {
      const query = `
        INSERT INTO actuador (dispositivo_id, tipo, estado_actual, activo)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.dispositivo_id,
        data.tipo,
        data.estado_actual || 2, // Default to 'Desactivado'
        data.activo !== false ? true : false
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear actuador:', error);
      throw error;
    }
  }

  static async updateActuador(id, data) {
    try {
      const query = `
        UPDATE actuador
        SET dispositivo_id = ?, tipo = ?, estado_actual = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.dispositivo_id,
        data.tipo,
        data.estado_actual,
        id
      ]);
      return await this.getActuadorById(id);
    } catch (error) {
      logger.error(`Error al actualizar actuador ${id}:`, error);
      throw error;
    }
  }

  static async updateEstadoActuador(id, estadoId) {
    try {
      const query = 'UPDATE actuador SET estado_actual = ? WHERE id = ?';
      await pool.query(query, [estadoId, id]);
      return await this.getActuadorById(id);
    } catch (error) {
      logger.error(`Error al actualizar estado del actuador ${id}:`, error);
      throw error;
    }
  }

  static async deleteActuador(id) {
    try {
      const query = 'UPDATE actuador SET activo = FALSE WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar actuador ${id}:`, error);
      throw error;
    }
  }

  static async getActuadoresByDispositivo(dispositivoId) {
    try {
      const query = `
        SELECT a.*, d.codigo as dispositivo_codigo, ea.nombre as estado_nombre
        FROM actuador a
        LEFT JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        LEFT JOIN estado_actuador ea ON a.estado_actual = ea.id
        WHERE a.dispositivo_id = ? AND a.activo = TRUE
        ORDER BY a.tipo
      `;
      const [rows] = await pool.query(query, [dispositivoId, dispositivoId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener actuadores del dispositivo ${dispositivoId}:`, error);
      throw error;
    }
  }

  static async getActuadoresByJaguey(jagueyId) {
    try {
      const query = `
        SELECT a.*, d.codigo as dispositivo_codigo, ea.nombre as estado_nombre, j.nombre as jaguey_nombre
        FROM actuador a
        INNER JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        INNER JOIN jaguey j ON d.jaguey_id = j.id
        LEFT JOIN estado_actuador ea ON a.estado_actual = ea.id
        WHERE d.jaguey_id = ? AND a.activo = TRUE
        ORDER BY d.codigo, a.tipo
      `;
      const [rows] = await pool.query(query, [jagueyId, jagueyId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener actuadores del jaguey ${jagueyId}:`, error);
      throw error;
    }
  }

  static async activarActuador(id) {
    try {
      // Suponiendo que el estado 1 es ACTIVADO
      return await this.updateEstadoActuador(id, 1);
    } catch (error) {
      logger.error(`Error al activar actuador ${id}:`, error);
      throw error;
    }
  }

  static async desactivarActuador(id) {
    try {
      // Suponiendo que el estado 2 es DESACTIVADO
      return await this.updateEstadoActuador(id, 2);
    } catch (error) {
      logger.error(`Error al desactivar actuador ${id}:`, error);
      throw error;
    }
  }
}
