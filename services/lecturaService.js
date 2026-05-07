import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class LecturaService {
  static origenColumnReady = false;

  static async ensureOrigenColumn() {
    if (this.origenColumnReady) return;

    const [columns] = await pool.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'lectura_sensor'
          AND COLUMN_NAME = 'origen'
      `
    );

    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE lectura_sensor
        ADD COLUMN origen ENUM('AUTOMATICA', 'MANUAL') DEFAULT 'AUTOMATICA'
      `);
    }

    this.origenColumnReady = true;
  }

  static async getAllLecturas(filters = {}) {
    try {
      await this.ensureOrigenColumn();

      let query = `
        SELECT 
          ls.*,
          s.modelo as sensor_modelo,
          s.dispositivo_id,
          tv.id as tipo_variable_id,
          tv.nombre as tipo_variable_nombre,
          tv.unidad,
          d.codigo as dispositivo_codigo,
          d.jaguey_id,
          j.nombre as jaguey_nombre
        FROM lectura_sensor ls
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        LEFT JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        LEFT JOIN jaguey j ON d.jaguey_id = j.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.sensor_id) {
        query += ' AND ls.sensor_id = ?';
        params.push(filters.sensor_id);
      }

      if (filters.estado) {
        query += ' AND ls.estado = ?';
        params.push(filters.estado);
      }

      if (filters.tipo_variable_id) {
        query += ' AND s.tipo_variable_id = ?';
        params.push(filters.tipo_variable_id);
      }

      if (filters.jaguey_id) {
        query += ' AND d.jaguey_id = ?';
        params.push(filters.jaguey_id);
      }

      if (filters.fechaInicio && filters.fechaFin) {
        query += ' AND ls.timestamp BETWEEN ? AND ?';
        params.push(filters.fechaInicio, filters.fechaFin);
      }

      const limit = Number(filters.limit) || 1000;
      query += ' ORDER BY ls.timestamp DESC LIMIT ?';
      params.push(limit);
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener lecturas:', error);
      throw error;
    }
  }

  static async getLecturaById(id) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        SELECT ls.*, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre, tv.unidad
        FROM lectura_sensor ls
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE ls.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener lectura ${id}:`, error);
      throw error;
    }
  }

  static async createLectura(data) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        INSERT INTO lectura_sensor (sensor_id, valor, timestamp, estado, origen)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.sensor_id,
        data.valor,
        data.timestamp ? new Date(data.timestamp) : new Date(),
        data.estado || 'normal',
        data.origen === 'MANUAL' ? 'MANUAL' : 'AUTOMATICA'
      ]);
      return await this.getLecturaById(result.insertId);
    } catch (error) {
      logger.error('Error al crear lectura:', error);
      throw error;
    }
  }

  static async createMultipleLecturas(lecturas) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        INSERT INTO lectura_sensor (sensor_id, valor, timestamp, estado, origen)
        VALUES (?, ?, ?, ?, ?)
      `;
      const results = [];
      for (const lectura of lecturas) {
        const [result] = await pool.query(query, [
          lectura.sensor_id,
          lectura.valor,
          lectura.timestamp || new Date(),
          lectura.estado || 'normal',
          lectura.origen === 'MANUAL' ? 'MANUAL' : 'AUTOMATICA'
        ]);
        results.push({ id: result.insertId, ...lectura });
      }
      return results;
    } catch (error) {
      logger.error('Error al crear múltiples lecturas:', error);
      throw error;
    }
  }

  static async updateLectura(id, data) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        UPDATE lectura_sensor
        SET sensor_id = ?, valor = ?, timestamp = ?, estado = ?, origen = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.sensor_id,
        data.valor,
        data.timestamp,
        data.estado,
        data.origen === 'MANUAL' ? 'MANUAL' : 'AUTOMATICA',
        id
      ]);
      return await this.getLecturaById(id);
    } catch (error) {
      logger.error(`Error al actualizar lectura ${id}:`, error);
      throw error;
    }
  }

  static async deleteLectura(id) {
    try {
      const query = 'DELETE FROM lectura_sensor WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar lectura ${id}:`, error);
      throw error;
    }
  }

  static async getLecturasBySensor(sensorId, limit = 100) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        SELECT ls.*, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre, tv.unidad
        FROM lectura_sensor ls
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE ls.sensor_id = ?
        ORDER BY ls.timestamp DESC
        LIMIT ?
      `;
      const [rows] = await pool.query(query, [sensorId, limit]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener lecturas del sensor ${sensorId}:`, error);
      throw error;
    }
  }

  static async getUltimaLecturaBySensor(sensorId) {
    try {
      await this.ensureOrigenColumn();

      const query = `
        SELECT ls.*, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre, tv.unidad
        FROM lectura_sensor ls
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE ls.sensor_id = ?
        ORDER BY ls.timestamp DESC
        LIMIT 1
      `;
      const [rows] = await pool.query(query, [sensorId]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener última lectura del sensor ${sensorId}:`, error);
      throw error;
    }
  }

  static async getLecturasPromedioByDispositivo(dispositivoId, tipoVariableId, horas = 24) {
    try {
      const query = `
        SELECT 
          s.id as sensor_id,
          s.modelo,
          tv.nombre as tipo_variable_nombre,
          tv.unidad,
          AVG(ls.valor) as promedio,
          MIN(ls.valor) as minimo,
          MAX(ls.valor) as maximo,
          COUNT(ls.id) as total_lecturas
        FROM lectura_sensor ls
        INNER JOIN sensor s ON ls.sensor_id = s.id
        INNER JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        INNER JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        WHERE d.id = ? 
          AND s.tipo_variable_id = ?
          AND ls.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        GROUP BY s.id, s.modelo, tv.nombre, tv.unidad
      `;
      const [rows] = await pool.query(query, [dispositivoId, tipoVariableId, horas]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener promedios del dispositivo ${dispositivoId}:`, error);
      throw error;
    }
  }

  static async limpiarLecturasAntiguas(diasRetener = 30) {
    try {
      const query = `
        DELETE FROM lectura_sensor
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      const [result] = await pool.query(query, [diasRetener]);
      return { deletedRows: result.affectedRows };
    } catch (error) {
      logger.error('Error al limpiar lecturas antiguas:', error);
      throw error;
    }
  }
}
