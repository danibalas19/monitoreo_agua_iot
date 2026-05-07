import express from 'express';
import { autenticar, autorizar } from '../middlewares/auth.js';
import { JagueyController } from '../controllers/jagueyController.js';

const router = express.Router();

// Vista pública: puntos del mapa sin autenticación
router.get('/public/mapa', JagueyController.getPublicJagueys);

// ========================
// CRUD Jagueys
// ========================
// Lectura: Admin, Operador, Visualizador
router.get('/', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), JagueyController.getAllJagueys);
router.get('/:id', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), JagueyController.getJagueyById);

// Crear/Editar: Admin
router.post('/', autenticar, autorizar(['ADMIN']), JagueyController.createJaguey);
router.put('/:id', autenticar, autorizar(['ADMIN']), JagueyController.updateJaguey);

// Eliminar: Solo Admin
router.delete('/:id', autenticar, autorizar(['ADMIN']), JagueyController.deleteJaguey);

// ========================
// Rutas Especiales
// ========================
// Lectura
router.get('/municipio/:municipio', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), JagueyController.getJagueysByMunicipio);
router.get('/:id/stats', autenticar, autorizar(['ADMIN', 'OPERADOR', 'VISOR']), JagueyController.getJagueyStats);

export default router;


