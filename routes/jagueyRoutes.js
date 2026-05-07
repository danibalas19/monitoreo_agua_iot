import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { JagueyController } from '../controllers/jagueyController.js';

const router = express.Router();

// ========================
// CRUD Jagueys
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), JagueyController.getAllJagueys);
router.get('/:id', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), JagueyController.getJagueyById);

// Crear/Editar: Admin
router.post('/', autenticar, autorizar(['Admin']), JagueyController.createJaguey);
router.put('/:id', autenticar, autorizar(['Admin']), JagueyController.updateJaguey);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['Admin']), JagueyController.deleteJaguey);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/municipio/:municipio', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), JagueyController.getJagueysByMunicipio);
router.get('/:id/stats', autenticar, autorizar(['Admin', 'Operador', 'Visualizador']), JagueyController.getJagueyStats);

export default router;


