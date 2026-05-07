import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ReporteController } from '../controllers/reporteController.js';

const router = express.Router();

// Reportes (protegidas con JWT)
router.get('/resumen-general', autenticar, ReporteController.getResumenGeneral);
router.get('/por-municipio', autenticar, ReporteController.getReportePorMunicipio);
router.get('/jaguey/:jagueyId', autenticar, ReporteController.getReporteJaguey);
router.get('/lecturas/sensor/:sensorId', autenticar, ReporteController.getReporteLecturas);
router.get('/alertas', autenticar, ReporteController.getReporteAlertas);
router.get('/comandos', autenticar, ReporteController.getReporteComandos);
router.get('/conectividad', autenticar, ReporteController.getReporteConectividad);
router.get('/auditoria', autenticar, ReporteController.getReporteAuditoria);

// Exportación (protegida con JWT)
router.get('/exportar/:tipo', autenticar, ReporteController.exportarDatos);

export default router;
