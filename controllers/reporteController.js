import { ReporteService } from '../services/reporteService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ReporteController {
  static getResumenGeneral = asyncHandler(async (req, res) => {
    const resumen = await ReporteService.getResumenGeneral();
    res.json({
      success: true,
      data: resumen,
      message: 'Resumen general obtenido exitosamente'
    });
  });

  static getReportePorMunicipio = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReportePorMunicipio();
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte por municipio obtenido exitosamente'
    });
  });

  static getReporteJaguey = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteJaguey(req.params.jagueyId);
    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Jaguey no encontrado'
      });
    }
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte del jaguey obtenido exitosamente'
    });
  });

  static getReporteLecturas = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteLecturas(
      req.params.sensorId,
      req.query.fecha_inicio,
      req.query.fecha_fin
    );
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte de lecturas obtenido exitosamente'
    });
  });

  static getReporteAlertas = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteAlertas(
      req.query.fecha_inicio,
      req.query.fecha_fin,
      req.query.nivel
    );
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte de alertas obtenido exitosamente'
    });
  });

  static getReporteComandos = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteComandos(
      req.query.fecha_inicio,
      req.query.fecha_fin
    );
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte de comandos obtenido exitosamente'
    });
  });

  static getReporteConectividad = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteConectividad(
      req.query.fecha_inicio,
      req.query.fecha_fin
    );
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte de conectividad obtenido exitosamente'
    });
  });

  static getReporteAuditoria = asyncHandler(async (req, res) => {
    const reporte = await ReporteService.getReporteAuditoria(
      req.query.fecha_inicio,
      req.query.fecha_fin,
      req.query.usuario_id
    );
    res.json({
      success: true,
      data: reporte,
      message: 'Reporte de auditoría obtenido exitosamente'
    });
  });

  static exportarDatos = asyncHandler(async (req, res) => {
    const datos = await ReporteService.exportarDatos(req.params.tipo, req.query);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=exportacion_${req.params.tipo}_${Date.now()}.json`);
    res.json({
      success: true,
      data: datos,
      message: `Datos de ${req.params.tipo} exportados exitosamente`
    });
    
    logger.info(`Datos exportados: ${req.params.tipo} (${datos.length} registros)`);
  });
}
