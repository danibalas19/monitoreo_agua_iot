import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { LecturaController } from '../controllers/lecturaController.js';

const router = express.Router();

// ========================
// CRUD Lecturas
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), LecturaController.getAllLecturas);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), LecturaController.getLecturaById);

// Crear: Admin, Operador
router.post('/', autenticar, autorizar(['Admin', 'Operador']), LecturaController.createLectura);
router.post('/lote', autenticar, autorizar(['Admin', 'Operador']), LecturaController.createMultipleLecturas);

// Editar: Admin, Operador
router.put('/:id', autenticar, autorizar(['Admin', 'Operador']), LecturaController.updateLectura);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), LecturaController.deleteLectura);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/sensor/:sensorId', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), LecturaController.getLecturasBySensor);
router.get('/sensor/:sensorId/ultima', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), LecturaController.getUltimaLecturaBySensor);
router.get('/dispositivo/:dispositivoId/tipo/:tipoVariableId/promedio', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), LecturaController.getLecturasPromedioByDispositivo);

// Mantenimiento: Solo Admin
router.post('/mantenimiento/limpiar', autenticar, autorizar(['Admin']), LecturaController.limpiarLecturasAntiguas);

export default router;
