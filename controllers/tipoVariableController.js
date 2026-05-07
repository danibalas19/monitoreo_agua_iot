import pool from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

export class TipoVariableController {
  static getAllTiposVariables = asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const [tiposVariables] = await connection.query('SELECT * FROM tipo_variable ORDER BY nombre');
      
      res.json({
        success: true,
        data: tiposVariables,
        message: 'Tipos de variables obtenidos exitosamente'
      });
    } finally {
      await connection.release();
    }
  });

  static getTipoVariableById = asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const [tiposVariables] = await connection.query(
        'SELECT * FROM tipo_variable WHERE id = ?',
        [req.params.id]
      );

      if (tiposVariables.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de variable no encontrado'
        });
      }

      res.json({
        success: true,
        data: tiposVariables[0],
        message: 'Tipo de variable obtenido exitosamente'
      });
    } finally {
      await connection.release();
    }
  });
}
