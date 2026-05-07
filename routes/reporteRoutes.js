import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { ReporteController } from '../controllers/reporteController.js';

const router = express.Router();

// ========================
// REPORTES (Lectura: Admin, Operador, Visualizador)
// ========================
router.get('/resumen-general', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getResumenGeneral);
router.get('/por-municipio', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReportePorMunicipio);
router.get('/jaguey/:jagueyId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReporteJaguey);
router.get('/lecturas/sensor/:sensorId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReporteLecturas);
router.get('/alertas', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReporteAlertas);
router.get('/comandos', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReporteComandos);
router.get('/conectividad', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.getReporteConectividad);

// Auditoría: Solo Admin
router.get('/auditoria', autenticar, autorizar(['Admin']), ReporteController.getReporteAuditoria);

// ========================
// EXPORTACIÓN (Admin, Operador, Visualizador)
// ========================
router.get('/exportar/:tipo', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), ReporteController.exportarDatos);

export default router;
