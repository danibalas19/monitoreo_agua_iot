import { ActuadorService } from '../services/actuadorService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ActuadorController {
  static getAllActuadores = asyncHandler(async (req, res) => {
    const filters = {
      dispositivo_id: req.query.dispositivo_id,
      tipo: req.query.tipo
    };
    const actuadores = await ActuadorService.getAllActuadores(filters);
    res.json({
      success: true,
      data: actuadores,
      message: 'Actuadores obtenidos exitosamente'
    });
  });

  static getActuadorById = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.getActuadorById(req.params.id);
    if (!actuador) {
      return res.status(404).json({
        success: false,
        message: 'Actuador no encontrado'
      });
    }
    res.json({
      success: true,
      data: actuador,
      message: 'Actuador obtenido exitosamente'
    });
  });

  static createActuador = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.createActuador(req.body);
    res.status(201).json({
      success: true,
      data: actuador,
      message: 'Actuador creado exitosamente'
    });
    logger.info(`Actuador creado: ${actuador.tipo} (ID: ${actuador.id})`);
  });

  static updateActuador = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.updateActuador(req.params.id, req.body);
    res.json({
      success: true,
      data: actuador,
      message: 'Actuador actualizado exitosamente'
    });
    logger.info(`Actuador actualizado: ${actuador.tipo} (ID: ${actuador.id})`);
  });

  static deleteActuador = asyncHandler(async (req, res) => {
    await ActuadorService.deleteActuador(req.params.id);
    res.json({
      success: true,
      message: 'Actuador eliminado exitosamente'
    });
    logger.info(`Actuador eliminado (ID: ${req.params.id})`);
  });

  static getActuadoresByDispositivo = asyncHandler(async (req, res) => {
    const actuadores = await ActuadorService.getActuadoresByDispositivo(req.params.dispositivoId);
    res.json({
      success: true,
      data: actuadores,
      message: 'Actuadores del dispositivo obtenidos exitosamente'
    });
  });

  static getActuadoresByJaguey = asyncHandler(async (req, res) => {
    const actuadores = await ActuadorService.getActuadoresByJaguey(req.params.jagueyId);
    res.json({
      success: true,
      data: actuadores,
      message: 'Actuadores del jaguey obtenidos exitosamente'
    });
  });

  static activarActuador = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.activarActuador(req.params.id);
    res.json({
      success: true,
      data: actuador,
      message: 'Actuador activado exitosamente'
    });
    logger.info(`Actuador activado: ${actuador.tipo} (ID: ${actuador.id})`);
  });

  static desactivarActuador = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.desactivarActuador(req.params.id);
    res.json({
      success: true,
      data: actuador,
      message: 'Actuador desactivado exitosamente'
    });
    logger.info(`Actuador desactivado: ${actuador.tipo} (ID: ${actuador.id})`);
  });

  static updateEstadoActuador = asyncHandler(async (req, res) => {
    const actuador = await ActuadorService.updateEstadoActuador(req.params.id, req.body.estado_actual);
    res.json({
      success: true,
      data: actuador,
      message: 'Estado del actuador actualizado exitosamente'
    });
    logger.info(`Estado del actuador actualizado (ID: ${actuador.id})`);
  });
}
