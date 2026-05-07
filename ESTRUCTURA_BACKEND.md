# Estructura Backend Completa - Monitoreo Agua IoT

## 📁 Árbol de Carpetas

```
monitoreo_agua_iot/
├── config/
│   └── database.js                    # Conexión a MySQL con pool de conexiones
│
├── controllers/                       # Controladores (6 capas de lógica)
│   ├── jagueyController.js            # CRUD y operaciones de jagueys
│   ├── dispositivoIotController.js    # CRUD y operaciones de dispositivos
│   ├── sensorController.js            # CRUD y operaciones de sensores
│   ├── lecturaController.js           # CRUD y operaciones de lecturas
│   ├── alertaController.js            # CRUD y operaciones de alertas
│   ├── actuadorController.js          # CRUD y operaciones de actuadores
│   ├── comandoRemotoController.js     # CRUD y operaciones de comandos
│   ├── usuarioController.js           # CRUD y operaciones de usuarios
│   └── reporteController.js           # Reportes y exportación de datos
│
├── services/                          # Lógica de negocio (9 servicios)
│   ├── jagueyService.js               # Lógica de jagueys
│   ├── dispositivoIotService.js       # Lógica de dispositivos
│   ├── sensorService.js               # Lógica de sensores
│   ├── lecturaService.js              # Lógica de lecturas y promedios
│   ├── alertaService.js               # Lógica de alertas y umbrales
│   ├── actuadorService.js             # Lógica de actuadores
│   ├── comandoRemotoService.js        # Lógica de comandos remotos
│   ├── usuarioService.js              # Lógica de usuarios y autenticación
│   └── reporteService.js              # Lógica de reportes
│
├── routes/                            # Definición de rutas (9 rutas)
│   ├── jagueyRoutes.js                # Rutas para jagueys
│   ├── dispositivoIotRoutes.js        # Rutas para dispositivos
│   ├── sensorRoutes.js                # Rutas para sensores
│   ├── lecturaRoutes.js               # Rutas para lecturas
│   ├── alertaRoutes.js                # Rutas para alertas
│   ├── actuadorRoutes.js              # Rutas para actuadores
│   ├── comandoRemotoRoutes.js         # Rutas para comandos
│   ├── usuarioRoutes.js               # Rutas para usuarios
│   ├── reporteRoutes.js               # Rutas para reportes
│   └── ejemplo_rutas_protegidas.js    # Ejemplo de cómo proteger rutas
│
├── middlewares/                       # Middlewares personalizados
│   ├── errorHandler.js                # Manejo centralizado de errores
│   ├── validateRequest.js             # Validación de datos con Joi
│   └── auth.js                        # Autenticación y autorización JWT
│
├── utils/                             # Funciones utilitarias
│   ├── constants.js                   # Constantes del sistema
│   └── logger.js                      # Sistema de logging
│
├── .env.example                       # Plantilla de variables de entorno
├── .gitignore                         # Archivos a ignorar en Git
├── schema.sql                         # Script SQL para crear BD
├── README.md                          # Documentación completa
├── package.json                       # Dependencias y scripts
└── index.js                           # Archivo principal del servidor
```

## 🔌 Endpoints por Categoría

### Jagueys (7 endpoints)
```
GET    /api/v1/jagueys                      - Listar todos
GET    /api/v1/jagueys/:id                  - Obtener uno
POST   /api/v1/jagueys                      - Crear
PUT    /api/v1/jagueys/:id                  - Actualizar
DELETE /api/v1/jagueys/:id                  - Eliminar
GET    /api/v1/jagueys/municipio/:municipio- Filtrar por municipio
GET    /api/v1/jagueys/:id/stats            - Estadísticas
```

### Dispositivos IoT (8 endpoints)
```
GET    /api/v1/dispositivos                 - Listar todos
GET    /api/v1/dispositivos/:id             - Obtener uno
POST   /api/v1/dispositivos                 - Crear
PUT    /api/v1/dispositivos/:id             - Actualizar
DELETE /api/v1/dispositivos/:id             - Eliminar
GET    /api/v1/dispositivos/jaguey/:id      - Por jaguey
GET    /api/v1/dispositivos/conectados      - Solo conectados
PUT    /api/v1/dispositivos/:id/estado      - Cambiar estado
```

### Sensores (8 endpoints)
```
GET    /api/v1/sensores                     - Listar todos
GET    /api/v1/sensores/:id                 - Obtener uno
POST   /api/v1/sensores                     - Crear
PUT    /api/v1/sensores/:id                 - Actualizar
DELETE /api/v1/sensores/:id                 - Eliminar
GET    /api/v1/sensores/dispositivo/:id     - Por dispositivo
GET    /api/v1/sensores/tipo/:id            - Por tipo
PUT    /api/v1/sensores/:id/activar         - Activar
PUT    /api/v1/sensores/:id/desactivar      - Desactivar
```

### Lecturas (9 endpoints)
```
GET    /api/v1/lecturas                     - Listar todos
GET    /api/v1/lecturas/:id                 - Obtener uno
POST   /api/v1/lecturas                     - Crear una
POST   /api/v1/lecturas/lote                - Crear múltiples
PUT    /api/v1/lecturas/:id                 - Actualizar
DELETE /api/v1/lecturas/:id                 - Eliminar
GET    /api/v1/lecturas/sensor/:id          - Por sensor
GET    /api/v1/lecturas/sensor/:id/ultima   - Última lectura
GET    /api/v1/lecturas/dispositivo/:id     - Promedios
POST   /api/v1/lecturas/mantenimiento       - Limpiar antiguas
```

### Alertas (9 endpoints)
```
GET    /api/v1/alertas                      - Listar todos
GET    /api/v1/alertas/:id                  - Obtener una
POST   /api/v1/alertas                      - Crear
PUT    /api/v1/alertas/:id                  - Actualizar
DELETE /api/v1/alertas/:id                  - Eliminar
GET    /api/v1/alertas/activas              - Solo activas
POST   /api/v1/alertas/:id/resolver         - Resolver
POST   /api/v1/alertas/verificar/umbrales   - Verificar límites
GET    /api/v1/alertas/stats/por-nivel      - Estadísticas
GET    /api/v1/alertas/recientes            - Recientes
```

### Actuadores (9 endpoints)
```
GET    /api/v1/actuadores                   - Listar todos
GET    /api/v1/actuadores/:id               - Obtener uno
POST   /api/v1/actuadores                   - Crear
PUT    /api/v1/actuadores/:id               - Actualizar
DELETE /api/v1/actuadores/:id               - Eliminar
GET    /api/v1/actuadores/dispositivo/:id   - Por dispositivo
GET    /api/v1/actuadores/jaguey/:id        - Por jaguey
PUT    /api/v1/actuadores/:id/activar       - Activar
PUT    /api/v1/actuadores/:id/desactivar    - Desactivar
```

### Comandos Remotos (8 endpoints)
```
GET    /api/v1/comandos-remotos             - Listar todos
GET    /api/v1/comandos-remotos/:id         - Obtener uno
POST   /api/v1/comandos-remotos             - Crear
PUT    /api/v1/comandos-remotos/:id         - Actualizar
DELETE /api/v1/comandos-remotos/:id         - Eliminar
GET    /api/v1/comandos-remotos/pendientes  - Pendientes
PUT    /api/v1/comandos-remotos/:id/estado  - Cambiar estado
GET    /api/v1/comandos-remotos/historial   - Por usuario
```

### Usuarios (9 endpoints)
```
GET    /api/v1/usuarios                     - Listar todos
GET    /api/v1/usuarios/:id                 - Obtener uno
POST   /api/v1/usuarios                     - Crear
PUT    /api/v1/usuarios/:id                 - Actualizar
DELETE /api/v1/usuarios/:id                 - Eliminar
POST   /api/v1/usuarios/auth/login          - Autenticar
PUT    /api/v1/usuarios/:id/cambiar-password- Cambiar password
PUT    /api/v1/usuarios/:id/desactivar      - Desactivar
PUT    /api/v1/usuarios/:id/activar         - Activar
```

### Reportes (9 endpoints)
```
GET    /api/v1/reportes/resumen-general     - Resumen del sistema
GET    /api/v1/reportes/por-municipio       - Por municipio
GET    /api/v1/reportes/jaguey/:id          - De un jaguey
GET    /api/v1/reportes/lecturas/:id        - De lecturas
GET    /api/v1/reportes/alertas             - De alertas
GET    /api/v1/reportes/comandos            - De comandos
GET    /api/v1/reportes/conectividad        - De conectividad
GET    /api/v1/reportes/auditoria           - De auditoría
GET    /api/v1/reportes/exportar/:tipo      - Exportar datos
```

## 🗄️ Base de Datos

### Tablas Creadas (14 tablas)
1. **estado_jaguey** - Estados de jagueys
2. **estado_actuador** - Estados de actuadores
3. **jaguey** - Almacenamientos de agua
4. **dispositivo_iot** - Dispositivos de medición
5. **tipo_variable** - Tipos de variables (nivel, temp, pH, etc.)
6. **sensor** - Sensores individuales
7. **lectura_sensor** - Datos de mediciones
8. **umbral_alerta** - Umbrales para alertas
9. **alerta** - Alertas generadas
10. **notificacion** - Notificaciones de alertas
11. **actuador** - Dispositivos de control
12. **comando_remoto** - Comandos ejecutados
13. **usuario** - Usuarios del sistema
14. **rol** - Roles de usuarios
15. **log_conectividad** - Historial de conectividad
16. **auditoria_sistema** - Registro de acciones

### Índices (17 índices)
- Optimizados para búsquedas por municipio, dispositivo, sensor, timestamp, etc.

## 📦 Dependencias

```json
{
  "express": "^5.2.1",        // Framework web
  "mysql2": "^3.6.5",         // Cliente MySQL
  "cors": "^2.8.5",           // CORS
  "helmet": "^7.1.0",         // Seguridad
  "morgan": "^1.10.0",        // Logging HTTP
  "joi": "^17.11.0",          // Validación
  "bcryptjs": "^2.4.3",       // Hash de contraseñas
  "jsonwebtoken": "^9.1.2",   // JWT
  "dotenv": "^17.4.2"         // Variables de entorno
}
```

## 🚀 Características Implementadas

✅ CRUD completo para todas las entidades
✅ Validación de datos con Joi
✅ Autenticación y autorización con JWT
✅ Hash de contraseñas con bcrypt
✅ Manejo centralizado de errores
✅ Logging de eventos
✅ Reportes y exportación de datos
✅ Pool de conexiones a BD
✅ Middlewares de seguridad (Helmet, CORS)
✅ Estructura modular y escalable
✅ Índices para optimización
✅ Constantes centralizadas
✅ Documentación completa

## 🔐 Seguridad

- Headers seguros con Helmet
- CORS configurado
- Validación de entrada con Joi
- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Manejo de errores sin exponer detalles sensibles
- Variables de entorno protegidas

## 📈 Escalabilidad

- Arquitectura de 3 capas (Controllers, Services, Database)
- Modular y fácil de extender
- Pool de conexiones para mejor rendimiento
- Índices de BD optimizados
- Endpoints bien organizados

## 🎯 Próximos Pasos (Opcional)

1. Agregar validación más exhaustiva
2. Implementar paginación en listados
3. Agregar autenticación OAuth2
4. Implementar WebSockets para actualizaciones en tiempo real
5. Agregar caché con Redis
6. Implementar tests unitarios y de integración
7. Agregar documentación Swagger/OpenAPI
8. Configurar CI/CD
9. Agregar rate limiting
10. Implementar soft deletes
