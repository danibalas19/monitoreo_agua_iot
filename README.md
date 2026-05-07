# Sistema de Monitoreo de Agua IoT - Guía de Instalación y Uso

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd monitoreo_agua_iot
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

Ejecuta el script SQL proporcionado para crear todas las tablas:

```sql
-- Ejecuta el contenido del archivo schema.sql en tu gestor MySQL
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y actualiza los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de base de datos:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=monitoreo_agua_iot
DB_PORT=3306

JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con recarga automática):

```bash
npm run dev
```

### Modo producción:

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Documentación de API

### Endpoints Principales

Base URL: `http://localhost:3000/api/v1`

#### Health Check
- **GET** `/health` - Verifica que el servidor esté activo

#### Jagueys
- **GET** `/jagueys` - Obtener todos los jagueys
- **GET** `/jagueys/:id` - Obtener un jaguey específico
- **POST** `/jagueys` - Crear nuevo jaguey
- **PUT** `/jagueys/:id` - Actualizar jaguey
- **DELETE** `/jagueys/:id` - Eliminar jaguey
- **GET** `/jagueys/municipio/:municipio` - Obtener jagueys por municipio
- **GET** `/jagueys/:id/stats` - Obtener estadísticas del jaguey

#### Dispositivos IoT
- **GET** `/dispositivos` - Obtener todos los dispositivos
- **GET** `/dispositivos/:id` - Obtener un dispositivo específico
- **POST** `/dispositivos` - Crear nuevo dispositivo
- **PUT** `/dispositivos/:id` - Actualizar dispositivo
- **DELETE** `/dispositivos/:id` - Eliminar dispositivo
- **GET** `/dispositivos/jaguey/:jagueyId` - Obtener dispositivos de un jaguey
- **GET** `/dispositivos/conectados/listar` - Obtener dispositivos conectados
- **PUT** `/dispositivos/:id/estado-conectividad` - Actualizar estado de conectividad

#### Sensores
- **GET** `/sensores` - Obtener todos los sensores
- **GET** `/sensores/:id` - Obtener un sensor específico
- **POST** `/sensores` - Crear nuevo sensor
- **PUT** `/sensores/:id` - Actualizar sensor
- **DELETE** `/sensores/:id` - Eliminar sensor
- **GET** `/sensores/dispositivo/:dispositivoId` - Obtener sensores de un dispositivo
- **PUT** `/sensores/:id/activar` - Activar sensor
- **PUT** `/sensores/:id/desactivar` - Desactivar sensor

#### Lecturas
- **GET** `/lecturas` - Obtener todas las lecturas
- **GET** `/lecturas/:id` - Obtener una lectura específica
- **POST** `/lecturas` - Crear nueva lectura
- **POST** `/lecturas/lote` - Crear múltiples lecturas
- **PUT** `/lecturas/:id` - Actualizar lectura
- **DELETE** `/lecturas/:id` - Eliminar lectura
- **GET** `/lecturas/sensor/:sensorId` - Obtener lecturas de un sensor
- **GET** `/lecturas/sensor/:sensorId/ultima` - Obtener última lectura de un sensor

#### Alertas
- **GET** `/alertas` - Obtener todas las alertas
- **GET** `/alertas/:id` - Obtener una alerta específica
- **POST** `/alertas` - Crear nueva alerta
- **PUT** `/alertas/:id` - Actualizar alerta
- **DELETE** `/alertas/:id` - Eliminar alerta
- **GET** `/alertas/activas/listar` - Obtener alertas activas
- **POST** `/alertas/:id/resolver` - Resolver una alerta
- **POST** `/alertas/verificar/umbrales` - Verificar si un valor excede umbrales

#### Actuadores
- **GET** `/actuadores` - Obtener todos los actuadores
- **GET** `/actuadores/:id` - Obtener un actuador específico
- **POST** `/actuadores` - Crear nuevo actuador
- **PUT** `/actuadores/:id` - Actualizar actuador
- **DELETE** `/actuadores/:id` - Eliminar actuador
- **PUT** `/actuadores/:id/activar` - Activar actuador
- **PUT** `/actuadores/:id/desactivar` - Desactivar actuador
- **GET** `/actuadores/jaguey/:jagueyId` - Obtener actuadores de un jaguey

#### Comandos Remotos
- **GET** `/comandos-remotos` - Obtener todos los comandos
- **GET** `/comandos-remotos/:id` - Obtener un comando específico
- **POST** `/comandos-remotos` - Crear nuevo comando
- **PUT** `/comandos-remotos/:id` - Actualizar comando
- **DELETE** `/comandos-remotos/:id` - Eliminar comando
- **GET** `/comandos-remotos/pendientes/listar` - Obtener comandos pendientes
- **PUT** `/comandos-remotos/:id/estado` - Actualizar estado del comando

#### Usuarios
- **GET** `/usuarios` - Obtener todos los usuarios
- **GET** `/usuarios/:id` - Obtener un usuario específico
- **POST** `/usuarios` - Crear nuevo usuario
- **PUT** `/usuarios/:id` - Actualizar usuario
- **DELETE** `/usuarios/:id` - Eliminar usuario
- **POST** `/usuarios/auth/login` - Autenticarse
- **PUT** `/usuarios/:id/cambiar-password` - Cambiar contraseña
- **PUT** `/usuarios/:id/desactivar` - Desactivar usuario
- **PUT** `/usuarios/:id/activar` - Activar usuario

#### Reportes
- **GET** `/reportes/resumen-general` - Obtener resumen general del sistema
- **GET** `/reportes/por-municipio` - Obtener reporte por municipio
- **GET** `/reportes/jaguey/:jagueyId` - Obtener reporte de un jaguey
- **GET** `/reportes/alertas` - Obtener reporte de alertas
- **GET** `/reportes/conectividad` - Obtener reporte de conectividad
- **GET** `/reportes/auditoria` - Obtener reporte de auditoría
- **GET** `/reportes/exportar/:tipo` - Exportar datos

## 🔒 Autenticación

Para usar endpoints protegidos, incluye el header de autorización:

```
Authorization: Bearer <token_jwt>
```

### Ejemplo de login:

```bash
curl -X POST http://localhost:3000/api/v1/usuarios/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "contraseña"}'
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "usuario": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Autenticación exitosa"
}
```

## 📊 Estructura de la Base de Datos

### Tablas Principales:

1. **jaguey** - Almacenamientos de agua
2. **dispositivo_iot** - Dispositivos de medición
3. **sensor** - Sensores individuales
4. **lectura_sensor** - Datos de mediciones
5. **alerta** - Alertas generadas
6. **actuador** - Dispositivos de control
7. **comando_remoto** - Comandos ejecutados
8. **usuario** - Usuarios del sistema
9. **log_conectividad** - Historial de conectividad
10. **auditoria_sistema** - Registro de acciones

## 🛠️ Estructura del Proyecto

```
monitoreo_agua_iot/
├── config/
│   └── database.js          # Configuración de conexión a BD
├── controllers/             # Controladores de negocio
│   ├── jagueyController.js
│   ├── dispositivoIotController.js
│   ├── sensorController.js
│   ├── lecturaController.js
│   ├── alertaController.js
│   ├── actuadorController.js
│   ├── comandoRemotoController.js
│   ├── usuarioController.js
│   └── reporteController.js
├── services/                # Lógica de negocio
│   ├── jagueyService.js
│   ├── dispositivoIotService.js
│   ├── sensorService.js
│   ├── lecturaService.js
│   ├── alertaService.js
│   ├── actuadorService.js
│   ├── comandoRemotoService.js
│   ├── usuarioService.js
│   └── reporteService.js
├── routes/                  # Definición de rutas
│   ├── jagueyRoutes.js
│   ├── dispositivoIotRoutes.js
│   ├── sensorRoutes.js
│   ├── lecturaRoutes.js
│   ├── alertaRoutes.js
│   ├── actuadorRoutes.js
│   ├── comandoRemotoRoutes.js
│   ├── usuarioRoutes.js
│   └── reporteRoutes.js
├── middlewares/             # Middlewares personalizados
│   ├── errorHandler.js
│   ├── validateRequest.js
│   └── auth.js
├── utils/                   # Funciones utilitarias
│   ├── constants.js
│   └── logger.js
├── .env.example             # Ejemplo de variables de entorno
├── package.json
└── index.js                 # Archivo principal
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos

- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Puerto en uso

Si el puerto 3000 está en uso, cambia la variable `PORT` en `.env`

### Errores de CORS

Asegúrate que `CORS_ORIGIN` en `.env` incluye tu dominio frontend

## 📝 Ejemplos de Uso

### Crear un Jaguey

```bash
curl -X POST http://localhost:3000/api/v1/jagueys \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Jaguey Principal",
    "ubicacion": "Zona Rural Norte",
    "municipio": "Chinandega",
    "latitud": 12.6295,
    "longitud": -87.1921,
    "capacidad_m3": 5000,
    "estado_id": 1
  }'
```

### Crear una Lectura

```bash
curl -X POST http://localhost:3000/api/v1/lecturas \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_id": 1,
    "valor": 45.5,
    "timestamp": "2024-01-15T10:30:00Z",
    "estado": "normal"
  }'
```

### Obtener Alertas Activas

```bash
curl http://localhost:3000/api/v1/alertas/activas/listar
```

## 📧 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

## 📄 Licencia

ISC - Daniel Balasnoa
