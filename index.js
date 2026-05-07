import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Importar middlewares y utilities
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { morganMiddleware, logger } from './utils/logger.js';

// Importar rutas
import jagueyRoutes from './routes/jagueyRoutes.js';
import dispositivoIotRoutes from './routes/dispositivoIotRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import lecturaRoutes from './routes/lecturaRoutes.js';
import alertaRoutes from './routes/alertaRoutes.js';
import actuadorRoutes from './routes/actuadorRoutes.js';
import comandoRemotoRoutes from './routes/comandoRemotoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y parseo
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger
app.use(morganMiddleware);
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor de monitoreo de agua IoT activo',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API versión
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    name: 'Monitoreo Agua IoT API'
  });
});

// Rutas de la API
const apiV1 = '/api/v1';

app.use(`${apiV1}/jagueys`, jagueyRoutes);
app.use(`${apiV1}/dispositivos`, dispositivoIotRoutes);
app.use(`${apiV1}/sensores`, sensorRoutes);
app.use(`${apiV1}/lecturas`, lecturaRoutes);
app.use(`${apiV1}/alertas`, alertaRoutes);
app.use(`${apiV1}/actuadores`, actuadorRoutes);
app.use(`${apiV1}/comandos-remotos`, comandoRemotoRoutes);
app.use(`${apiV1}/usuarios`, usuarioRoutes);
app.use(`${apiV1}/reportes`, reporteRoutes);

// Ruta no encontrada
app.use(notFoundHandler);

// Manejador de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`================================================`);
  logger.info(`✓ Servidor de Monitoreo de Agua IoT iniciado`);
  logger.info(`✓ Puerto: ${PORT}`);
  logger.info(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`✓ URL: http://localhost:${PORT}`);
  logger.info(`✓ Health Check: http://localhost:${PORT}/health`);
  logger.info(`================================================`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  process.exit(1);
});


