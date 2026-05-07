import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { LecturaController } from '../controllers/lecturaController.js';

const router = express.Router();

// CRUD Lecturas (protegidas con JWT)
router.get('/', autenticar, LecturaController.getAllLecturas);
router.get('/:id', autenticar, LecturaController.getLecturaById);
router.post('/', autenticar, LecturaController.createLectura);
router.post('/lote', autenticar, LecturaController.createMultipleLecturas);
router.put('/:id', autenticar, LecturaController.updateLectura);
router.delete('/:id', autenticar, LecturaController.deleteLectura);

// Rutas especiales (protegidas con JWT)
router.get('/sensor/:sensorId', autenticar, LecturaController.getLecturasBySensor);
router.get('/sensor/:sensorId/ultima', autenticar, LecturaController.getUltimaLecturaBySensor);
router.get('/dispositivo/:dispositivoId/tipo/:tipoVariableId/promedio', autenticar, LecturaController.getLecturasPromedioByDispositivo);
router.post('/mantenimiento/limpiar', autenticar, LecturaController.limpiarLecturasAntiguas);

export default router;
