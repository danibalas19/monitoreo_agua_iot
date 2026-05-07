import { DispositivoIotService } from '../services/dispositivoIotService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class DispositivoIotController {
  static getAllDispositivos = asyncHandler(async (req, res) => {
    const filters = {
      jaguey_id: req.query.jaguey_id,
      estado_conectividad: req.query.estado_conectividad
    };
    const dispositivos = await DispositivoIotService.getAllDispositivos(filters);
    res.json({
      success: true,
      data: dispositivos,
      message: 'Dispositivos IoT obtenidos exitosamente'
    });
  });

  static getDispositivoById = asyncHandler(async (req, res) => {
    const dispositivo = await DispositivoIotService.getDispositivoById(req.params.id);
    if (!dispositivo) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo no encontrado'
      });
    }
    res.json({
      success: true,
      data: dispositivo,
      message: 'Dispositivo obtenido exitosamente'
    });
  });

  static createDispositivo = asyncHandler(async (req, res) => {
    const dispositivo = await DispositivoIotService.createDispositivo(req.body);
    res.status(201).json({
      success: true,
      data: dispositivo,
      message: 'Dispositivo creado exitosamente'
    });
    logger.info(`Dispositivo creado: ${dispositivo.codigo} (ID: ${dispositivo.id})`);
  });

  static updateDispositivo = asyncHandler(async (req, res) => {
    const dispositivo = await DispositivoIotService.updateDispositivo(req.params.id, req.body);
    res.json({
      success: true,
      data: dispositivo,
      message: 'Dispositivo actualizado exitosamente'
    });
    logger.info(`Dispositivo actualizado: ${dispositivo.codigo} (ID: ${dispositivo.id})`);
  });

  static deleteDispositivo = asyncHandler(async (req, res) => {
    await DispositivoIotService.deleteDispositivo(req.params.id);
    res.json({
      success: true,
      message: 'Dispositivo eliminado exitosamente'
    });
    logger.info(`Dispositivo eliminado (ID: ${req.params.id})`);
  });

  static getDispositivosByJaguey = asyncHandler(async (req, res) => {
    const dispositivos = await DispositivoIotService.getDispositivosByJaguey(req.params.jagueyId);
    res.json({
      success: true,
      data: dispositivos,
      message: 'Dispositivos del jaguey obtenidos exitosamente'
    });
  });

  static getDispositivosConectados = asyncHandler(async (req, res) => {
    const dispositivos = await DispositivoIotService.getDispositivosConectados();
    res.json({
      success: true,
      data: dispositivos,
      message: 'Dispositivos conectados obtenidos exitosamente'
    });
  });

  static updateEstadoConectividad = asyncHandler(async (req, res) => {
    const dispositivo = await DispositivoIotService.updateEstadoConectividad(
      req.params.id,
      req.body.estado_conectividad
    );
    res.json({
      success: true,
      data: dispositivo,
      message: 'Estado de conectividad actualizado exitosamente'
    });
    logger.info(`Estado de conectividad actualizado - Dispositivo ${dispositivo.codigo}: ${dispositivo.estado_conectividad}`);
  });

  static getDispositivosPorEstado = asyncHandler(async (req, res) => {
    const stats = await DispositivoIotService.getDispositivosPorEstado();
    res.json({
      success: true,
      data: stats,
      message: 'Dispositivos por estado obtenidos exitosamente'
    });
  });
}
