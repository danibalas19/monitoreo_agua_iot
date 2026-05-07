import { LecturaService } from '../services/lecturaService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class LecturaController {
  static getAllLecturas = asyncHandler(async (req, res) => {
    const filters = {
      sensor_id: req.query.sensor_id,
      tipo_variable_id: req.query.tipo_variable_id,
      jaguey_id: req.query.jaguey_id,
      estado: req.query.estado,
      fechaInicio: req.query.fecha_inicio,
      fechaFin: req.query.fecha_fin,
      limit: req.query.limit
    };
    const lecturas = await LecturaService.getAllLecturas(filters);
    res.json({
      success: true,
      data: lecturas,
      message: 'Lecturas obtenidas exitosamente'
    });
  });

  static getLecturaById = asyncHandler(async (req, res) => {
    const lectura = await LecturaService.getLecturaById(req.params.id);
    if (!lectura) {
      return res.status(404).json({
        success: false,
        message: 'Lectura no encontrada'
      });
    }
    res.json({
      success: true,
      data: lectura,
      message: 'Lectura obtenida exitosamente'
    });
  });

  static createLectura = asyncHandler(async (req, res) => {
    const lectura = await LecturaService.createLectura(req.body);
    res.status(201).json({
      success: true,
      data: lectura,
      message: 'Lectura creada exitosamente'
    });
    logger.debug(`Lectura creada - Sensor: ${lectura.sensor_id}, Valor: ${lectura.valor}`);
  });

  static createMultipleLecturas = asyncHandler(async (req, res) => {
    const lecturas = await LecturaService.createMultipleLecturas(req.body.lecturas);
    res.status(201).json({
      success: true,
      data: lecturas,
      message: `${lecturas.length} lecturas creadas exitosamente`
    });
    logger.info(`${lecturas.length} lecturas creadas en lote`);
  });

  static updateLectura = asyncHandler(async (req, res) => {
    const lectura = await LecturaService.updateLectura(req.params.id, req.body);
    res.json({
      success: true,
      data: lectura,
      message: 'Lectura actualizada exitosamente'
    });
  });

  static deleteLectura = asyncHandler(async (req, res) => {
    await LecturaService.deleteLectura(req.params.id);
    res.json({
      success: true,
      message: 'Lectura eliminada exitosamente'
    });
  });

  static getLecturasBySensor = asyncHandler(async (req, res) => {
    const limit = req.query.limit || 100;
    const lecturas = await LecturaService.getLecturasBySensor(req.params.sensorId, limit);
    res.json({
      success: true,
      data: lecturas,
      message: 'Lecturas del sensor obtenidas exitosamente'
    });
  });

  static getUltimaLecturaBySensor = asyncHandler(async (req, res) => {
    const lectura = await LecturaService.getUltimaLecturaBySensor(req.params.sensorId);
    if (!lectura) {
      return res.status(404).json({
        success: false,
        message: 'No hay lecturas para este sensor'
      });
    }
    res.json({
      success: true,
      data: lectura,
      message: 'Última lectura del sensor obtenida exitosamente'
    });
  });

  static getLecturasPromedioByDispositivo = asyncHandler(async (req, res) => {
    const horas = req.query.horas || 24;
    const promedios = await LecturaService.getLecturasPromedioByDispositivo(
      req.params.dispositivoId,
      req.params.tipoVariableId,
      horas
    );
    res.json({
      success: true,
      data: promedios,
      message: 'Promedios de lecturas obtenidos exitosamente'
    });
  });

  static limpiarLecturasAntiguas = asyncHandler(async (req, res) => {
    const diasRetener = req.body.dias_retener || 30;
    const result = await LecturaService.limpiarLecturasAntiguas(diasRetener);
    res.json({
      success: true,
      data: result,
      message: `${result.deletedRows} lecturas antiguas eliminadas`
    });
    logger.info(`Limpieza de lecturas: ${result.deletedRows} registros eliminados (mayor a ${diasRetener} días)`);
  });
}
