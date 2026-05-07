import express from 'express';
import { AlertaController } from '../controllers/alertaController.js';

const router = express.Router();

// CRUD Alertas
router.get('/', AlertaController.getAllAlertas);
router.get('/:id', AlertaController.getAlertaById);
router.post('/', AlertaController.createAlerta);
router.put('/:id', AlertaController.updateAlerta);
router.delete('/:id', AlertaController.deleteAlerta);

// Rutas especiales
router.get('/activas/listar', AlertaController.getAlertasActivas);
router.post('/:id/resolver', AlertaController.resolverAlerta);
router.post('/verificar/umbrales', AlertaController.verificarUmbrales);
router.get('/stats/por-nivel', AlertaController.getAlertasPorNivel);
router.get('/recientes/horas', AlertaController.getAlertasRecientes);

export default router;
