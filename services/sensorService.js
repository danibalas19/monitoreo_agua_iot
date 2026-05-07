import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class SensorService {
  static getLatestReadingFields() {
    return `
      (
        SELECT ls.valor
        FROM lectura_sensor ls
        WHERE ls.sensor_id = s.id
        ORDER BY ls.timestamp DESC, ls.id DESC
        LIMIT 1
      ) as valor_actual,
      (
        SELECT ls.timestamp
        FROM lectura_sensor ls
        WHERE ls.sensor_id = s.id
        ORDER BY ls.timestamp DESC, ls.id DESC
        LIMIT 1
      ) as ultima_lectura
    `;
  }

  static async getAllSensores(filters = {}) {
    try {
      let query = `
        SELECT s.*, tv.nombre as tipo_variable_nombre, tv.unidad, d.codigo as dispositivo_codigo,
        ${this.getLatestReadingFields()}
        FROM sensor s
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        LEFT JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.dispositivo_id) {
        query += ' AND s.dispositivo_id = ?';
        params.push(filters.dispositivo_id);
      }

      if (filters.tipo_variable_id) {
        query += ' AND s.tipo_variable_id = ?';
        params.push(filters.tipo_variable_id);
      }

      if (filters.activo !== undefined) {
        query += ' AND s.activo = ?';
        params.push(filters.activo);
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener sensores:', error);
      throw error;
    }
  }

  static async getSensorById(id) {
    try {
      const query = `
        SELECT s.*, tv.nombre as tipo_variable_nombre, tv.unidad, d.codigo as dispositivo_codigo,
        ${this.getLatestReadingFields()}
        FROM sensor s
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        LEFT JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        WHERE s.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener sensor ${id}:`, error);
      throw error;
    }
  }

  static async createSensor(data) {
    try {
      const query = `
        INSERT INTO sensor (dispositivo_id, tipo_variable_id, modelo, activo)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.dispositivo_id,
        data.tipo_variable_id,
        data.modelo,
        data.activo !== false ? true : false
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear sensor:', error);
      throw error;
    }
  }

  static async updateSensor(id, data) {
    try {
      const query = `
        UPDATE sensor
        SET dispositivo_id = ?, tipo_variable_id = ?, modelo = ?, activo = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.dispositivo_id,
        data.tipo_variable_id,
        data.modelo,
        data.activo,
        id
      ]);
      return await this.getSensorById(id);
    } catch (error) {
      logger.error(`Error al actualizar sensor ${id}:`, error);
      throw error;
    }
  }

  static async deleteSensor(id) {
    try {
      const query = 'DELETE FROM sensor WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar sensor ${id}:`, error);
      throw error;
    }
  }

  static async getSensoresByDispositivo(dispositivoId) {
    try {
      const query = `
        SELECT s.*, tv.nombre as tipo_variable_nombre, tv.unidad,
        ${this.getLatestReadingFields()}
        FROM sensor s
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE s.dispositivo_id = ?
        ORDER BY s.modelo
      `;
      const [rows] = await pool.query(query, [dispositivoId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener sensores del dispositivo ${dispositivoId}:`, error);
      throw error;
    }
  }

  static async getSensoresByTipo(tipoVariableId) {
    try {
      const query = `
        SELECT s.*, tv.nombre as tipo_variable_nombre, tv.unidad, d.codigo as dispositivo_codigo,
        ${this.getLatestReadingFields()}
        FROM sensor s
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        LEFT JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        WHERE s.tipo_variable_id = ? AND s.activo = true
        ORDER BY d.codigo, s.modelo
      `;
      const [rows] = await pool.query(query, [tipoVariableId]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener sensores del tipo ${tipoVariableId}:`, error);
      throw error;
    }
  }

  static async activarSensor(id) {
    try {
      const query = 'UPDATE sensor SET activo = true WHERE id = ?';
      await pool.query(query, [id]);
      return await this.getSensorById(id);
    } catch (error) {
      logger.error(`Error al activar sensor ${id}:`, error);
      throw error;
    }
  }

  static async desactivarSensor(id) {
    try {
      const query = 'UPDATE sensor SET activo = false WHERE id = ?';
      await pool.query(query, [id]);
      return await this.getSensorById(id);
    } catch (error) {
      logger.error(`Error al desactivar sensor ${id}:`, error);
      throw error;
    }
  }
}
