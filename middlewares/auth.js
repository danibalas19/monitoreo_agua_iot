import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const autenticar = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.usuario = decoded;
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

export const autorizar = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (rolesPermitidos.length > 0) {
      // Aquí puedes agregar lógica para verificar los roles del usuario
      // Por ahora, simplemente permitimos que continúe si está autenticado
    }

    next();
  };
};
