import { ComandoRemotoService } from '../services/comandoRemotoService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ComandoRemotoController {
  static getAllComandos = asyncHandler(async (req, res) => {
    const filters = {
      actuador_id: req.query.actuador_id,
      estado: req.query.estado,
      usuario_id: req.query.usuario_id
    };
    const comandos = await ComandoRemotoService.getAllComandos(filters);
    res.json({
      success: true,
      data: comandos,
      message: 'Comandos remotos obtenidos exitosamente'
    });
  });

  static getComandoById = asyncHandler(async (req, res) => {
    const comando = await ComandoRemotoService.getComandoById(req.params.id);
    if (!comando) {
      return res.status(404).json({
        success: false,
        message: 'Comando no encontrado'
      });
    }
    res.json({
      success: true,
      data: comando,
      message: 'Comando obtenido exitosamente'
    });
  });

  static createComando = asyncHandler(async (req, res) => {
    const comando = await ComandoRemotoService.createComando(req.body);
    res.status(201).json({
      success: true,
      data: comando,
      message: 'Comando remoto creado exitosamente'
    });
    logger.info(`Comando remoto creado: ${comando.comando} (ID: ${comando.id}) por usuario ${comando.usuario_id}`);
  });

  static updateComando = asyncHandler(async (req, res) => {
    const comando = await ComandoRemotoService.updateComando(req.params.id, req.body);
    res.json({
      success: true,
      data: comando,
      message: 'Comando actualizado exitosamente'
    });
  });

  static updateEstadoComando = asyncHandler(async (req, res) => {
    const comando = await ComandoRemotoService.updateEstadoComando(req.params.id, req.body.estado);
    res.json({
      success: true,
      data: comando,
      message: 'Estado del comando actualizado exitosamente'
    });
    logger.info(`Estado del comando actualizado: ${comando.estado} (ID: ${comando.id})`);
  });

  static deleteComando = asyncHandler(async (req, res) => {
    await ComandoRemotoService.deleteComando(req.params.id);
    res.json({
      success: true,
      message: 'Comando eliminado exitosamente'
    });
  });

  static getComandosByActuador = asyncHandler(async (req, res) => {
    const comandos = await ComandoRemotoService.getComandosByActuador(req.params.actuadorId);
    res.json({
      success: true,
      data: comandos,
      message: 'Comandos del actuador obtenidos exitosamente'
    });
  });

  static getComandosPendientes = asyncHandler(async (req, res) => {
    const comandos = await ComandoRemotoService.getComandosPendientes();
    res.json({
      success: true,
      data: comandos,
      message: 'Comandos pendientes obtenidos exitosamente'
    });
  });

  static getHistorialPorUsuario = asyncHandler(async (req, res) => {
    const limit = req.query.limit || 50;
    const historial = await ComandoRemotoService.getHistorialPorUsuario(req.params.usuarioId, limit);
    res.json({
      success: true,
      data: historial,
      message: 'Historial de comandos del usuario obtenido exitosamente'
    });
  });
}
