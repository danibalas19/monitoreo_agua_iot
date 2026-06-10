import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class DispositivoIotService {
  static async getAllDispositivos(filters = {}) {
    try {
      let query = `
        SELECT d.*, j.nombre as jaguey_nombre
        FROM dispositivo_iot d
        LEFT JOIN jaguey j ON d.jaguey_id = j.id
        WHERE d.activo = TRUE
      `;
      const params = [];

      if (filters.jaguey_id) {
        query += ' AND d.jaguey_id = ?';
        params.push(filters.jaguey_id);
      }

      if (filters.estado_conectividad) {
        query += ' AND d.estado_conectividad = ?';
        params.push(filters.estado_conectividad);
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener dispositivos IoT:', error);
      throw error;
    }
  }

  static async getDispositivoById(id) {
    try {
      const query = `
        SELECT d.*, j.nombre as jaguey_nombre
        FROM dispositivo_iot d
        LEFT JOIN jaguey j ON d.jaguey_id = j.id
        WHERE d.id = ? AND d.activo = TRUE
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener dispositivo ${id}:`, error);
      throw error;
    }
  }

  static async createDispositivo(data) {
    try {
      const query = `
        INSERT INTO dispositivo_iot (codigo, jaguey_id, tipo, estado_conectividad, ultima_conexion)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.codigo,
        data.jaguey_id,
        data.tipo,
        data.estado_conectividad || 'conectado',
        new Date()
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear dispositivo:', error);
      throw error;
    }
  }

  static async updateDispositivo(id, data) {
    try {
      const query = `
        UPDATE dispositivo_iot
        SET codigo = ?, jaguey_id = ?, tipo = ?, estado_conectividad = ?, ultima_conexion = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.codigo,
        data.jaguey_id,
        data.tipo,
        data.estado_conectividad,
        new Date(),
        id
      ]);
      return await this.getDispositivoById(id);
    } catch (error) {
      logger.error(`Error al actualizar dispositivo ${id}:`, error);
      throw error;
    }
  }

  static async updateEstadoConectividad(id, estado) {
    try {
      const query = `
        UPDATE dispositivo_iot
        SET estado_conectividad = ?, ultima_conexion = ?
        WHERE id = ?
      `;
      await pool.query(query, [estado, new Date(), id]);
      return await this.getDispositivoById(id);
    } catch (error) {
      logger.error(`Error al actualizar estado de conectividad del dispositivo ${id}:`, error);
      throw error;
    }
  }

  static async deleteDispositivo(id) {
    try {
      const query = 'UPDATE dispositivo_iot SET activo = FALSE WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar dispositivo ${id}:`, error);
      throw error;
    }
  }

  static async getDispositivosByJaguey(jagueyId) {
    try {
      const query = `
        SELECT d.*, j.nombre as jaguey_nombre
        FROM dispositivo_iot d
        LEFT JOIN jaguey j ON d.jaguey_id = j.id
        WHERE d.jaguey_id = ? AND d.activo = TRUE
        ORDER BY d.codigo
      `;
      const [rows] = await pool.query(query, [jagueyId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener dispositivos del jaguey ${jagueyId}:`, error);
      throw error;
    }
  }

  static async getDispositivosConectados() {
    try {
      const query = `
        SELECT d.*, j.nombre as jaguey_nombre
        FROM dispositivo_iot d
        LEFT JOIN jaguey j ON d.jaguey_id = j.id
        WHERE d.estado_conectividad = 'conectado' AND d.activo = TRUE
        ORDER BY d.ultima_conexion DESC
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener dispositivos conectados:', error);
      throw error;
    }
  }

  static async getDispositivosPorEstado() {
    try {
      const query = `
        SELECT estado_conectividad, COUNT(*) as cantidad
        FROM dispositivo_iot
        WHERE activo = TRUE
        GROUP BY estado_conectividad
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener dispositivos por estado:', error);
      throw error;
    }
  }
}
