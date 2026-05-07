import { SensorService } from '../services/sensorService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class SensorController {
  static getAllSensores = asyncHandler(async (req, res) => {
    const filters = {
      dispositivo_id: req.query.dispositivo_id,
      tipo_variable_id: req.query.tipo_variable_id,
      activo: req.query.activo ? req.query.activo === 'true' : undefined
    };
    const sensores = await SensorService.getAllSensores(filters);
    res.json({
      success: true,
      data: sensores,
      message: 'Sensores obtenidos exitosamente'
    });
  });

  static getSensorById = asyncHandler(async (req, res) => {
    const sensor = await SensorService.getSensorById(req.params.id);
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor no encontrado'
      });
    }
    res.json({
      success: true,
      data: sensor,
      message: 'Sensor obtenido exitosamente'
    });
  });

  static createSensor = asyncHandler(async (req, res) => {
    const sensor = await SensorService.createSensor(req.body);
    res.status(201).json({
      success: true,
      data: sensor,
      message: 'Sensor creado exitosamente'
    });
    logger.info(`Sensor creado: ${sensor.modelo} (ID: ${sensor.id})`);
  });

  static updateSensor = asyncHandler(async (req, res) => {
    const sensor = await SensorService.updateSensor(req.params.id, req.body);
    res.json({
      success: true,
      data: sensor,
      message: 'Sensor actualizado exitosamente'
    });
    logger.info(`Sensor actualizado: ${sensor.modelo} (ID: ${sensor.id})`);
  });

  static deleteSensor = asyncHandler(async (req, res) => {
    await SensorService.deleteSensor(req.params.id);
    res.json({
      success: true,
      message: 'Sensor eliminado exitosamente'
    });
    logger.info(`Sensor eliminado (ID: ${req.params.id})`);
  });

  static getSensoresByDispositivo = asyncHandler(async (req, res) => {
    const sensores = await SensorService.getSensoresByDispositivo(req.params.dispositivoId);
    res.json({
      success: true,
      data: sensores,
      message: 'Sensores del dispositivo obtenidos exitosamente'
    });
  });

  static getSensoresByTipo = asyncHandler(async (req, res) => {
    const sensores = await SensorService.getSensoresByTipo(req.params.tipoVariableId);
    res.json({
      success: true,
      data: sensores,
      message: 'Sensores del tipo obtenidos exitosamente'
    });
  });

  static activarSensor = asyncHandler(async (req, res) => {
    const sensor = await SensorService.activarSensor(req.params.id);
    res.json({
      success: true,
      data: sensor,
      message: 'Sensor activado exitosamente'
    });
    logger.info(`Sensor activado: ${sensor.modelo} (ID: ${sensor.id})`);
  });

  static desactivarSensor = asyncHandler(async (req, res) => {
    const sensor = await SensorService.desactivarSensor(req.params.id);
    res.json({
      success: true,
      data: sensor,
      message: 'Sensor desactivado exitosamente'
    });
    logger.info(`Sensor desactivado: ${sensor.modelo} (ID: ${sensor.id})`);
  });
}
