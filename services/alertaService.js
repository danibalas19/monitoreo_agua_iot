import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class AlertaService {
  static async getAllAlertas(filters = {}) {
    try {
      let query = `
        SELECT a.*, ls.valor, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre
        FROM alerta a
        LEFT JOIN lectura_sensor ls ON a.lectura_id = ls.id
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.nivel) {
        query += ' AND a.nivel = ?';
        params.push(filters.nivel);
      }

      if (filters.resuelta !== undefined) {
        query += ' AND a.resuelta = ?';
        params.push(filters.resuelta);
      }

      if (filters.tipo) {
        query += ' AND a.tipo = ?';
        params.push(filters.tipo);
      }

      query += ' ORDER BY a.timestamp DESC LIMIT 1000';
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener alertas:', error);
      throw error;
    }
  }

  static async getAlertaById(id) {
    try {
      const query = `
        SELECT a.*, ls.valor, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre
        FROM alerta a
        LEFT JOIN lectura_sensor ls ON a.lectura_id = ls.id
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE a.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener alerta ${id}:`, error);
      throw error;
    }
  }

  static async createAlerta(data) {
    try {
      const query = `
        INSERT INTO alerta (lectura_id, tipo, mensaje, nivel, timestamp, resuelta)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.lectura_id,
        data.tipo,
        data.mensaje,
        data.nivel,
        new Date(),
        false
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear alerta:', error);
      throw error;
    }
  }

  static async updateAlerta(id, data) {
    try {
      const query = `
        UPDATE alerta
        SET lectura_id = ?, tipo = ?, mensaje = ?, nivel = ?, resuelta = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.lectura_id,
        data.tipo,
        data.mensaje,
        data.nivel,
        data.resuelta,
        id
      ]);
      return await this.getAlertaById(id);
    } catch (error) {
      logger.error(`Error al actualizar alerta ${id}:`, error);
      throw error;
    }
  }

  static async resolverAlerta(id) {
    try {
      const query = 'UPDATE alerta SET resuelta = true WHERE id = ?';
      await pool.query(query, [id]);
      return await this.getAlertaById(id);
    } catch (error) {
      logger.error(`Error al resolver alerta ${id}:`, error);
      throw error;
    }
  }

  static async deleteAlerta(id) {
    try {
      const query = 'DELETE FROM alerta WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar alerta ${id}:`, error);
      throw error;
    }
  }

  static async getAlertasActivas() {
    try {
      const query = `
        SELECT a.*, ls.valor, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre
        FROM alerta a
        LEFT JOIN lectura_sensor ls ON a.lectura_id = ls.id
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE a.resuelta = false
        ORDER BY a.nivel DESC, a.timestamp DESC
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener alertas activas:', error);
      throw error;
    }
    }

  static async verificarUmbrales(sensorId, valor, tipoVariableId) {
    try {
      const query = `
        SELECT id, nivel, min_valor, max_valor
        FROM umbral_alerta
        WHERE tipo_variable_id = ?
        ORDER BY nivel DESC
      `;
      const [umbrales] = await pool.query(query, [tipoVariableId]);

      for (const umbral of umbrales) {
        if ((umbral.min_valor && valor < umbral.min_valor) || 
            (umbral.max_valor && valor > umbral.max_valor)) {
          return umbral;
        }
      }
      return null;
    } catch (error) {
      logger.error(`Error al verificar umbrales del sensor ${sensorId}:`, error);
      throw error;
    }
  }

  static async getAlertasPorNivel() {
    try {
      const query = `
        SELECT nivel, COUNT(*) as cantidad
        FROM alerta
        WHERE resuelta = false
        GROUP BY nivel
        ORDER BY FIELD(nivel, 'crítico', 'alto', 'medio', 'bajo')
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener alertas por nivel:', error);
      throw error;
    }
  }

  static async getAlertasRecientes(horas = 24) {
    try {
      const query = `
        SELECT a.*, ls.valor, s.modelo as sensor_modelo, tv.nombre as tipo_variable_nombre
        FROM alerta a
        LEFT JOIN lectura_sensor ls ON a.lectura_id = ls.id
        LEFT JOIN sensor s ON ls.sensor_id = s.id
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        WHERE a.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY a.timestamp DESC
      `;
      const [rows] = await pool.query(query, [horas]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener alertas de las últimas ${horas} horas:`, error);
      throw error;
    }
  }
}
