import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { AlertaController } from '../controllers/alertaController.js';

const router = express.Router();

// ========================
// CRUD Alertas
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), AlertaController.getAllAlertas);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), AlertaController.getAlertaById);

// Crear/Editar: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), AlertaController.createAlerta);
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), AlertaController.updateAlerta);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), AlertaController.deleteAlerta);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/activas/listar', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), AlertaController.getAlertasActivas);
router.get('/stats/por-nivel', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), AlertaController.getAlertasPorNivel);
router.get('/recientes/horas', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), AlertaController.getAlertasRecientes);

// Control: Admin, Operador
router.post('/:id/resolver', autenticar, autorizar(['Admin', 'Operador']), AlertaController.resolverAlerta);
router.post('/verificar/umbrales', autenticar, autorizar(['Admin', 'Operador']), AlertaController.verificarUmbrales);

export default router;
