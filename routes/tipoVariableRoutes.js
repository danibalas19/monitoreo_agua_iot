import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { TipoVariableController } from '../controllers/tipoVariableController.js';

const router = express.Router();

// ========================
// CRUD Tipos de Variables
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), TipoVariableController.getAllTiposVariables);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), TipoVariableController.getTipoVariableById);

export default router;
