import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { AlertaController } from '../controllers/alertaController.js';

const router = express.Router();

// ========================
// CRUD Alertas
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), AlertaController.getAllAlertas);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), AlertaController.getAlertaById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), AlertaController.createAlerta);
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), AlertaController.updateAlerta);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), AlertaController.deleteAlerta);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/activas/listar', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), AlertaController.getAlertasActivas);
router.get('/stats/por-nivel', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), AlertaController.getAlertasPorNivel);
router.get('/recientes/horas', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), AlertaController.getAlertasRecientes);

// Control: Admin, Operador
router.post('/:id/resolver', autenticar, autorizar(['ADMIN', 'OPERADOR']), AlertaController.resolverAlerta);
router.post('/verificar/umbrales', autenticar, autorizar(['ADMIN', 'OPERADOR']), AlertaController.verificarUmbrales);

export default router;
