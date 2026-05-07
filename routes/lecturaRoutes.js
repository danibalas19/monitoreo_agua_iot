import express from 'express';
import { LecturaController } from '../controllers/lecturaController.js';

const router = express.Router();

// CRUD Lecturas
router.get('/', LecturaController.getAllLecturas);
router.get('/:id', LecturaController.getLecturaById);
router.post('/', LecturaController.createLectura);
router.post('/lote', LecturaController.createMultipleLecturas);
router.put('/:id', LecturaController.updateLectura);
router.delete('/:id', LecturaController.deleteLectura);

// Rutas especiales
router.get('/sensor/:sensorId', LecturaController.getLecturasBySensor);
router.get('/sensor/:sensorId/ultima', LecturaController.getUltimaLecturaBySensor);
router.get('/dispositivo/:dispositivoId/tipo/:tipoVariableId/promedio', LecturaController.getLecturasPromedioByDispositivo);
router.post('/mantenimiento/limpiar', LecturaController.limpiarLecturasAntiguas);

export default router;
