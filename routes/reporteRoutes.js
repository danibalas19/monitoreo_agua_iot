import express from 'express';
import { ReporteController } from '../controllers/reporteController.js';

const router = express.Router();

// Reportes
router.get('/resumen-general', ReporteController.getResumenGeneral);
router.get('/por-municipio', ReporteController.getReportePorMunicipio);
router.get('/jaguey/:jagueyId', ReporteController.getReporteJaguey);
router.get('/lecturas/sensor/:sensorId', ReporteController.getReporteLecturas);
router.get('/alertas', ReporteController.getReporteAlertas);
router.get('/comandos', ReporteController.getReporteComandos);
router.get('/conectividad', ReporteController.getReporteConectividad);
router.get('/auditoria', ReporteController.getReporteAuditoria);

// Exportación
router.get('/exportar/:tipo', ReporteController.exportarDatos);

export default router;
