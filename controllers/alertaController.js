import { AlertaService } from '../services/alertaService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AlertaController {
  static getAllAlertas = asyncHandler(async (req, res) => {
    const filters = {
      nivel: req.query.nivel,
      resuelta: req.query.resuelta ? req.query.resuelta === 'true' : undefined,
      tipo: req.query.tipo
    };
    const alertas = await AlertaService.getAllAlertas(filters);
    res.json({
      success: true,
      data: alertas,
      message: 'Alertas obtenidas exitosamente'
    });
  });

  static getAlertaById = asyncHandler(async (req, res) => {
    const alerta = await AlertaService.getAlertaById(req.params.id);
    if (!alerta) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    res.json({
      success: true,
      data: alerta,
      message: 'Alerta obtenida exitosamente'
    });
  });

  static createAlerta = asyncHandler(async (req, res) => {
    const alerta = await AlertaService.createAlerta(req.body);
    res.status(201).json({
      success: true,
      data: alerta,
      message: 'Alerta creada exitosamente'
    });
    logger.warn(`Alerta creada - Nivel: ${alerta.nivel}, Tipo: ${alerta.tipo}`);
  });

  static updateAlerta = asyncHandler(async (req, res) => {
    const alerta = await AlertaService.updateAlerta(req.params.id, req.body);
    res.json({
      success: true,
      data: alerta,
      message: 'Alerta actualizada exitosamente'
    });
  });

  static resolverAlerta = asyncHandler(async (req, res) => {
    const alerta = await AlertaService.resolverAlerta(req.params.id);
    res.json({
      success: true,
      data: alerta,
      message: 'Alerta resuelta exitosamente'
    });
    logger.info(`Alerta resuelta (ID: ${alerta.id})`);
  });

  static deleteAlerta = asyncHandler(async (req, res) => {
    await AlertaService.deleteAlerta(req.params.id);
    res.json({
      success: true,
      message: 'Alerta eliminada exitosamente'
    });
  });

  static getAlertasActivas = asyncHandler(async (req, res) => {
    const alertas = await AlertaService.getAlertasActivas();
    res.json({
      success: true,
      data: alertas,
      message: 'Alertas activas obtenidas exitosamente'
    });
  });

  static verificarUmbrales = asyncHandler(async (req, res) => {
    const umbral = await AlertaService.verificarUmbrales(
      req.body.sensor_id,
      req.body.valor,
      req.body.tipo_variable_id
    );
    
    if (umbral) {
      res.json({
        success: true,
        data: umbral,
        alerta: true,
        message: 'Valor fuera de umbral detectado'
      });
    } else {
      res.json({
        success: true,
        alerta: false,
        message: 'Valor dentro de los umbrales normales'
      });
    }
  });

  static getAlertasPorNivel = asyncHandler(async (req, res) => {
    const stats = await AlertaService.getAlertasPorNivel();
    res.json({
      success: true,
      data: stats,
      message: 'Alertas por nivel obtenidas exitosamente'
    });
  });

  static getAlertasRecientes = asyncHandler(async (req, res) => {
    const horas = req.query.horas || 24;
    const alertas = await AlertaService.getAlertasRecientes(horas);
    res.json({
      success: true,
      data: alertas,
      message: `Alertas de las últimas ${horas} horas obtenidas exitosamente`
    });
  });
}
