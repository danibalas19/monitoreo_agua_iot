import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { AlertaController } from '../controllers/alertaController.js';

const router = express.Router();

// CRUD Alertas (protegidas con JWT)
router.get('/', autenticar, AlertaController.getAllAlertas);
router.get('/:id', autenticar, AlertaController.getAlertaById);
router.post('/', autenticar, AlertaController.createAlerta);
router.put('/:id', autenticar, AlertaController.updateAlerta);
router.delete('/:id', autenticar, AlertaController.deleteAlerta);

// Rutas especiales (protegidas con JWT)
router.get('/activas/listar', autenticar, AlertaController.getAlertasActivas);
router.post('/:id/resolver', autenticar, AlertaController.resolverAlerta);
router.post('/verificar/umbrales', autenticar, AlertaController.verificarUmbrales);
router.get('/stats/por-nivel', autenticar, AlertaController.getAlertasPorNivel);
router.get('/recientes/horas', autenticar, AlertaController.getAlertasRecientes);

export default router;
