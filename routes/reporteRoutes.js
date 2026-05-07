import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ReporteController } from '../controllers/reporteController.js';

const router = express.Router();

// ========================
// REPORTES (Lectura: Admin, Operador, Visualizador)
// ========================
router.get('/resumen-general', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getResumenGeneral);
router.get('/por-municipio', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReportePorMunicipio);
router.get('/jaguey/:jagueyId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReporteJaguey);
router.get('/lecturas/sensor/:sensorId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReporteLecturas);
router.get('/alertas', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReporteAlertas);
router.get('/comandos', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReporteComandos);
router.get('/conectividad', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.getReporteConectividad);

// Auditoría: Solo Admin
router.get('/auditoria', autenticar, autorizar(['ADMIN']), ReporteController.getReporteAuditoria);

// ========================
// EXPORTACIÓN (Admin, Operador, Visualizador)
// ========================
router.get('/exportar/:tipo', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), ReporteController.exportarDatos);

export default router;
