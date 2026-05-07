import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class ReporteService {
  static async getResumenGeneral() {
    try {
      const queries = [
        { name: 'totalJagueys', query: 'SELECT COUNT(*) as total FROM jaguey' },
        { name: 'totalDispositivos', query: 'SELECT COUNT(*) as total FROM dispositivo_iot' },
        { name: 'dispositivosActivos', query: 'SELECT COUNT(*) as total FROM dispositivo_iot WHERE estado_conectividad = "conectado"' },
        { name: 'totalSensores', query: 'SELECT COUNT(*) as total FROM sensor WHERE activo = true' },
        { name: 'alertasActivas', query: 'SELECT COUNT(*) as total FROM alerta WHERE resuelta = false' },
        { name: 'usuariosActivos', query: 'SELECT COUNT(*) as total FROM usuario WHERE activo = true' }
      ];

      const resumen = {};
      for (const item of queries) {
        const [result] = await pool.query(item.query);
        resumen[item.name] = result[0].total;
      }
      return resumen;
    } catch (error) {
      logger.error('Error al obtener resumen general:', error);
      throw error;
    }
  }

  static async getReportePorMunicipio() {
    try {
      const query = `
        SELECT 
          j.municipio,
          COUNT(DISTINCT j.id) as total_jagueys,
          COUNT(DISTINCT di.id) as total_dispositivos,
          SUM(CASE WHEN di.estado_conectividad = 'conectado' THEN 1 ELSE 0 END) as dispositivos_conectados,
          COUNT(DISTINCT s.id) as total_sensores,
          COUNT(DISTINCT a.id) as total_actuadores
        FROM jaguey j
        LEFT JOIN dispositivo_iot di ON j.id = di.jaguey_id
        LEFT JOIN sensor s ON di.id = s.dispositivo_id
        LEFT JOIN actuador a ON di.id = a.dispositivo_id
        GROUP BY j.municipio
        ORDER BY j.municipio
      `;
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      logger.error('Error al obtener reporte por municipio:', error);
      throw error;
    }
  }

  static async getReporteJaguey(jagueyId) {
    try {
      const query = `
        SELECT 
          j.id,
          j.nombre,
          j.ubicacion,
          j.municipio,
          j.capacidad_m3,
          ej.nombre as estado_jaguey,
          COUNT(DISTINCT di.id) as total_dispositivos,
          SUM(CASE WHEN di.estado_conectividad = 'conectado' THEN 1 ELSE 0 END) as dispositivos_conectados,
          COUNT(DISTINCT s.id) as total_sensores,
          COUNT(DISTINCT a.id) as total_actuadores
        FROM jaguey j
        LEFT JOIN estado_jaguey ej ON j.estado_id = ej.id
        LEFT JOIN dispositivo_iot di ON j.id = di.jaguey_id
        LEFT JOIN sensor s ON di.id = s.dispositivo_id
        LEFT JOIN actuador a ON di.id = a.dispositivo_id
        WHERE j.id = ?
        GROUP BY j.id
      `;
      const [rows] = await pool.query(query, [jagueyId]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener reporte del jaguey ${jagueyId}:`, error);
      throw error;
    }
  }

  static async getReporteLecturas(sensorId, fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          s.id,
          s.modelo,
          tv.nombre as tipo_variable,
          tv.unidad,
          COUNT(ls.id) as total_lecturas,
          AVG(ls.valor) as promedio,
          MIN(ls.valor) as minimo,
          MAX(ls.valor) as maximo,
          STDDEV(ls.valor) as desv_estandar
        FROM sensor s
        LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
        LEFT JOIN lectura_sensor ls ON s.id = ls.sensor_id 
          AND ls.timestamp BETWEEN ? AND ?
        WHERE s.id = ?
        GROUP BY s.id
      `;
      const [rows] = await pool.query(query, [fechaInicio, fechaFin, sensorId]);
      return rows[0] || null;
    } catch (error) {
      logger.error(`Error al obtener reporte de lecturas del sensor ${sensorId}:`, error);
      throw error;
    }
  }

  static async getReporteAlertas(fechaInicio, fechaFin, nivel = null) {
    try {
      let query = `
        SELECT 
          a.nivel,
          a.tipo,
          COUNT(*) as total_alertas,
          SUM(CASE WHEN a.resuelta = true THEN 1 ELSE 0 END) as alertas_resueltas,
          SUM(CASE WHEN a.resuelta = false THEN 1 ELSE 0 END) as alertas_activas
        FROM alerta a
        WHERE a.timestamp BETWEEN ? AND ?
      `;
      const params = [fechaInicio, fechaFin];

      if (nivel) {
        query += ' AND a.nivel = ?';
        params.push(nivel);
      }

      query += ' GROUP BY a.nivel, a.tipo ORDER BY a.nivel DESC';
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener reporte de alertas:', error);
      throw error;
    }
  }

  static async getReporteComandos(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          cr.comando,
          cr.estado,
          COUNT(*) as total_comandos,
          COUNT(DISTINCT cr.usuario_id) as total_usuarios,
          COUNT(DISTINCT cr.actuador_id) as total_actuadores
        FROM comando_remoto cr
        WHERE cr.timestamp BETWEEN ? AND ?
        GROUP BY cr.comando, cr.estado
        ORDER BY total_comandos DESC
      `;
      const [rows] = await pool.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      logger.error('Error al obtener reporte de comandos:', error);
      throw error;
    }
  }

  static async getReporteConectividad(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          lc.dispositivo_id,
          d.codigo as dispositivo_codigo,
          lc.estado,
          COUNT(*) as total_cambios,
          MAX(lc.timestamp) as ultimo_cambio
        FROM log_conectividad lc
        INNER JOIN dispositivo_iot d ON lc.dispositivo_id = d.id
        WHERE lc.timestamp BETWEEN ? AND ?
        GROUP BY lc.dispositivo_id, lc.estado
        ORDER BY lc.dispositivo_id, lc.timestamp DESC
      `;
      const [rows] = await pool.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      logger.error('Error al obtener reporte de conectividad:', error);
      throw error;
    }
  }

  static async getReporteAuditoria(fechaInicio, fechaFin, usuarioId = null) {
    try {
      let query = `
        SELECT 
          au.usuario_id,
          u.nombre as usuario_nombre,
          au.accion,
          au.tabla_afectada,
          COUNT(*) as total_acciones,
          MAX(au.timestamp) as ultimo_cambio
        FROM auditoria_sistema au
        LEFT JOIN usuario u ON au.usuario_id = u.id
        WHERE au.timestamp BETWEEN ? AND ?
      `;
      const params = [fechaInicio, fechaFin];

      if (usuarioId) {
        query += ' AND au.usuario_id = ?';
        params.push(usuarioId);
      }

      query += ' GROUP BY au.usuario_id, au.accion, au.tabla_afectada ORDER BY ultimo_cambio DESC';
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener reporte de auditoría:', error);
      throw error;
    }
  }

  static async exportarDatos(tipo, filtros = {}) {
    try {
      let query, params = [];

      switch (tipo) {
        case 'lecturas':
          query = `
            SELECT ls.*, s.modelo, tv.nombre as tipo_variable, tv.unidad
            FROM lectura_sensor ls
            INNER JOIN sensor s ON ls.sensor_id = s.id
            INNER JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
          `;
          if (filtros.sensorId) {
            query += ' WHERE ls.sensor_id = ?';
            params.push(filtros.sensorId);
          }
          query += ' ORDER BY ls.timestamp DESC';
          break;

        case 'alertas':
          query = `
            SELECT a.*, ls.valor, s.modelo, tv.nombre as tipo_variable
            FROM alerta a
            LEFT JOIN lectura_sensor ls ON a.lectura_id = ls.id
            LEFT JOIN sensor s ON ls.sensor_id = s.id
            LEFT JOIN tipo_variable tv ON s.tipo_variable_id = tv.id
            ORDER BY a.timestamp DESC
          `;
          break;

        default:
          throw new Error('Tipo de exportación no válido');
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error(`Error al exportar datos de tipo ${tipo}:`, error);
      throw error;
    }
  }
}
