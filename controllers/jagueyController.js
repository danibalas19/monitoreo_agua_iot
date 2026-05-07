import { JagueyService } from '../services/jagueyService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class JagueyController {
  static getAllJagueys = asyncHandler(async (req, res) => {
    const filters = {
      municipio: req.query.municipio,
      estado_id: req.query.estado_id
    };
    const jagueys = await JagueyService.getAllJagueys(filters);
    res.json({
      success: true,
      data: jagueys,
      message: 'Jagueys obtenidos exitosamente'
    });
  });

  static getJagueyById = asyncHandler(async (req, res) => {
    const jaguey = await JagueyService.getJagueyById(req.params.id);
    if (!jaguey) {
      return res.status(404).json({
        success: false,
        message: 'Jaguey no encontrado'
      });
    }
    res.json({
      success: true,
      data: jaguey,
      message: 'Jaguey obtenido exitosamente'
    });
  });

  static createJaguey = asyncHandler(async (req, res) => {
    const jaguey = await JagueyService.createJaguey(req.body);
    res.status(201).json({
      success: true,
      data: jaguey,
      message: 'Jaguey creado exitosamente'
    });
    logger.info(`Jaguey creado: ${jaguey.nombre} (ID: ${jaguey.id})`);
  });

  static updateJaguey = asyncHandler(async (req, res) => {
    const jaguey = await JagueyService.updateJaguey(req.params.id, req.body);
    res.json({
      success: true,
      data: jaguey,
      message: 'Jaguey actualizado exitosamente'
    });
    logger.info(`Jaguey actualizado: ${jaguey.nombre} (ID: ${jaguey.id})`);
  });

  static deleteJaguey = asyncHandler(async (req, res) => {
    await JagueyService.deleteJaguey(req.params.id);
    res.json({
      success: true,
      message: 'Jaguey eliminado exitosamente'
    });
    logger.info(`Jaguey eliminado (ID: ${req.params.id})`);
  });

  static getJagueysByMunicipio = asyncHandler(async (req, res) => {
    const jagueys = await JagueyService.getJagueysByMunicipio(req.params.municipio);
    res.json({
      success: true,
      data: jagueys,
      message: 'Jagueys del municipio obtenidos exitosamente'
    });
  });

  static getJagueyStats = asyncHandler(async (req, res) => {
    const stats = await JagueyService.getJagueyStats(req.params.id);
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Jaguey no encontrado'
      });
    }
    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas del jaguey obtenidas exitosamente'
    });
  });
}
