import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class JagueyService {
  static async getAllJagueys(filters = {}) {
    try {
      let query = `
        SELECT j.*, ej.nombre as estado_nombre
        FROM jaguey j
        LEFT JOIN estado_jaguey ej ON j.estado_id = ej.id
        WHERE j.activo = TRUE
      `;
      const params = [];

      if (filters.municipio) {
        query += ' AND j.municipio = ?';
        params.push(filters.municipio);
      }

      if (filters.estado_id) {
        query += ' AND j.estado_id = ?';
        params.push(filters.estado_id);
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener jagueys:', error);
      throw error;
    }
  }

  static async getJagueyById(id) {
    try {
      const query = `
        SELECT j.*, ej.nombre as estado_nombre
        FROM jaguey j
        LEFT JOIN estado_jaguey ej ON j.estado_id = ej.id
        WHERE j.id = ? AND j.activo = TRUE
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener jaguey ${id}:`, error);
      throw error;
    }
  }

  static async createJaguey(data) {
    try {
      const query = `
        INSERT INTO jaguey (nombre, ubicacion, municipio, latitud, longitud, capacidad_m3, estado_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        data.nombre,
        data.ubicacion,
        data.municipio,
        data.latitud,
        data.longitud,
        data.capacidad_m3,
        data.estado_id || 1
      ]);
      return { id: result.insertId, ...data };
    } catch (error) {
      logger.error('Error al crear jaguey:', error);
      throw error;
    }
  }

  static async updateJaguey(id, data) {
    try {
      const query = `
        UPDATE jaguey
        SET nombre = ?, ubicacion = ?, municipio = ?, latitud = ?, longitud = ?, capacidad_m3 = ?, estado_id = ?
        WHERE id = ?
      `;
      await pool.query(query, [
        data.nombre,
        data.ubicacion,
        data.municipio,
        data.latitud,
        data.longitud,
        data.capacidad_m3,
        data.estado_id,
        id
      ]);
      return await this.getJagueyById(id);
    } catch (error) {
      logger.error(`Error al actualizar jaguey ${id}:`, error);
      throw error;
    }
  }

  static async deleteJaguey(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const queryJaguey = 'UPDATE jaguey SET activo = FALSE WHERE id = ?';
      await connection.query(queryJaguey, [id]);

      const queryDispositivos = 'UPDATE dispositivo_iot SET activo = FALSE WHERE jaguey_id = ?';
      await connection.query(queryDispositivos, [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error al eliminar jaguey ${id} y sus dispositivos:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async restoreJaguey(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Restaurar el Jaguey
      const queryJaguey = 'UPDATE jaguey SET activo = TRUE WHERE id = ?';
      await connection.query(queryJaguey, [id]);

      // 2. Restaurar los Sensores asociados a los dispositivos del jaguey
      const querySensores = `
        UPDATE sensor s
        INNER JOIN dispositivo_iot d ON s.dispositivo_id = d.id
        SET s.activo = TRUE
        WHERE d.jaguey_id = ?
      `;
      await connection.query(querySensores, [id]);

      // 3. Restaurar los Actuadores asociados a los dispositivos del jaguey
      const queryActuadores = `
        UPDATE actuador a
        INNER JOIN dispositivo_iot d ON a.dispositivo_id = d.id
        SET a.activo = TRUE
        WHERE d.jaguey_id = ?
      `;
      await connection.query(queryActuadores, [id]);

      // 4. Restaurar los Dispositivos IoT
      const queryDispositivos = 'UPDATE dispositivo_iot SET activo = TRUE WHERE jaguey_id = ?';
      await connection.query(queryDispositivos, [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error(`Error al restaurar jaguey ${id} y sus dependencias:`, error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getJagueysByMunicipio(municipio) {
    try {
      const query = `
        SELECT j.*, ej.nombre as estado_nombre
        FROM jaguey j
        LEFT JOIN estado_jaguey ej ON j.estado_id = ej.id
        WHERE j.municipio = ? AND j.activo = TRUE
        ORDER BY j.nombre
      `;
      const [rows] = await pool.query(query, [municipio]);
      return rows;
    } catch (error) {
      logger.error(`Error al obtener jagueys del municipio ${municipio}:`, error);
      throw error;
    }
  }

  static async getJagueyStats(id) {
    try {
      const query = `
        SELECT 
          j.id,
          j.nombre,
          j.capacidad_m3,
          COUNT(DISTINCT di.id) as total_dispositivos,
          COUNT(DISTINCT s.id) as total_sensores,
          COUNT(DISTINCT a.id) as total_actuadores
        FROM jaguey j
        LEFT JOIN dispositivo_iot di ON j.id = di.jaguey_id
        LEFT JOIN sensor s ON di.id = s.dispositivo_id
        LEFT JOIN actuador a ON di.id = a.dispositivo_id
        WHERE j.id = ? AND j.activo = TRUE
        GROUP BY j.id
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener estadísticas del jaguey ${id}:`, error);
      throw error;
    }
  }
}
