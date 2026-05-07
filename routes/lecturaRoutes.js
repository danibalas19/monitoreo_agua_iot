import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { LecturaController } from '../controllers/lecturaController.js';

const router = express.Router();

// ========================
// CRUD Lecturas
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), LecturaController.getAllLecturas);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), LecturaController.getLecturaById);

// Crear: Admin, Operador
router.post('/', autenticar, autorizar(['ADMIN', 'OPERADOR']), LecturaController.createLectura);
router.post('/lote', autenticar, autorizar(['ADMIN', 'OPERADOR']), LecturaController.createMultipleLecturas);

// Editar: Admin, Operador
router.put('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR']), LecturaController.updateLectura);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), LecturaController.deleteLectura);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/sensor/:sensorId', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), LecturaController.getLecturasBySensor);
router.get('/sensor/:sensorId/ultima', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), LecturaController.getUltimaLecturaBySensor);
router.get('/dispositivo/:dispositivoId/tipo/:tipoVariableId/promedio', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), LecturaController.getLecturasPromedioByDispositivo);

// Mantenimiento: Solo Admin
router.post('/mantenimiento/limpiar', autenticar, autorizar(['ADMIN']), LecturaController.limpiarLecturasAntiguas);

export default router;
