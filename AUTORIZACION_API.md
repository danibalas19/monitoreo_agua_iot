# Sistema de Autenticación y Autorización - Documentación API

## Resumen Ejecutivo

Se implementó un sistema **completo de autenticación (JWT) y autorización basada en roles** con 3 niveles:

1. **Admin** - Control total del sistema
2. **Operador** - Acceso operativo (lectura completa, crear/editar registros)
3. **Visualizador** - Solo lectura

---

## Arquitectura

### Componentes Principales

#### 1. **Middleware de Autenticación** (`middlewares/auth.js`)

**`autenticar`** - Verifica JWT
```javascript
router.get('/usuarios', autenticar, UsuarioController.getAllUsuarios);
```
- Valida token JWT en header `Authorization: Bearer <token>`
- Retorna `401 Unauthorized` si no hay token o es inválido
- Retorna `401 TokenExpiredError` si expiró

**`autorizar(rolesPermitidos)`** - Verifica roles
```javascript
router.delete('/:id', autenticar, autorizar(['Admin']), UsuarioController.delete);
router.post('/', autenticar, autorizar(['Admin', 'Operador']), UsuarioController.create);
```
- Verifica que el usuario tenga uno de los roles permitidos
- Retorna `403 Forbidden` si no tiene el rol
- Consulta BD para obtener roles reales del usuario

**`verificarPermiso(nombrePermiso)`** - Permisos granulares
```javascript
router.get('/auditoria', autenticar, verificarPermiso('reporte.auditoria'), Controller.get);
```
- Verifica permisos específicos (más granular que roles)
- Útil para acciones sensibles

#### 2. **Servicio de Permisos** (`services/permisoService.js`)

Métodos disponibles:
```javascript
// Obtener permisos
PermisoService.getPermisosByRol(rolId);
PermisoService.getPermisosByUsuario(usuarioId);
PermisoService.getPermisosByUsuarioGrouped(usuarioId); // Agrupado por módulo

// Verificar permisos
PermisoService.usuarioTienePermiso(usuarioId, 'usuario.crear');
PermisoService.usuarioTieneAlgunPermiso(usuarioId, ['usuario.crear', 'usuario.editar']);
PermisoService.usuarioTieneTodosPermisos(usuarioId, ['usuario.crear', 'usuario.editar']);

// Gestionar roles
PermisoService.getRolesByUsuario(usuarioId);
PermisoService.asignarPermisoARol(rolId, permisoId);
PermisoService.removerPermisoDeRol(rolId, permisoId);
```

---

## Flujo de Autenticación y Autorización

### 1. Login (Público)
```javascript
POST /api/usuarios/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña"
}

// Respuesta 200
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "roles": "Admin,Operador"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Petición Protegida
```javascript
GET /api/usuarios
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Si token es válido → Continúa
// Si token es inválido → 401 Unauthorized
// Si token expiró → 401 Token Expired
```

### 3. Verificación de Rol
```javascript
DELETE /api/usuarios/5
Authorization: Bearer <token>

// Sistema verifica: ¿Usuario tiene rol 'Admin'?
// Si → 200 OK, usuario eliminado
// Si no → 403 Forbidden
```

---

## Estructura de Roles y Permisos

### Base de Datos

```sql
-- Tabla de Permisos
permiso (
  id, 
  nombre (único),          -- 'usuario.crear'
  descripcion,
  modulo,                  -- 'usuario'
  accion                   -- 'create', 'read', 'update', 'delete'
)

-- Relación Rol-Permiso (muchos a muchos)
rol_permiso (
  rol_id,
  permiso_id
)

-- Relación Usuario-Rol (muchos a muchos)
usuario_rol (
  usuario_id,
  rol_id
)
```

### Permisos Disponibles

**Admin** tiene acceso a:
- TODOS los permisos (120+ permisos)

**Operador** tiene acceso a:
- Lectura: todos los módulos
- Crear/Editar: dispositivos, sensores, lecturas, actuadores, comandos, alertas
- NO: gestión de usuarios, eliminación de datos críticos, auditoría

**Visualizador** tiene acceso a:
- Lectura ÚNICA: dispositivos, sensores, lecturas, jagueys, alertas, reportes
- NO: crear, editar, eliminar, administración

---

## Endpoints Protegidos por Módulo

### USUARIOS (Admin Only)
```
GET    /api/usuarios              (Admin)
GET    /api/usuarios/:id          (Admin)
POST   /api/usuarios              (Admin)
PUT    /api/usuarios/:id          (Admin)
DELETE /api/usuarios/:id          (Admin)
PUT    /api/usuarios/:id/cambiar-password  (Usuario autenticado)
PUT    /api/usuarios/:id/activar  (Admin)
PUT    /api/usuarios/:id/desactivar (Admin)

POST   /api/usuarios/auth/login   (PUBLIC - sin JWT)

// Nuevos endpoints
GET    /api/usuarios/:id/roles    (Admin)
GET    /api/usuarios/:id/permisos (Admin)
POST   /api/usuarios/:id/roles    (Admin) - asignar rol
DELETE /api/usuarios/:id/roles/:rolId (Admin) - remover rol
```

### DISPOSITIVOS (Admin crea, Operador/Visualizador leen)
```
GET    /api/dispositivos              (Admin, Operador, Visualizador)
GET    /api/dispositivos/:id          (Admin, Operador, Visualizador)
POST   /api/dispositivos              (Admin, Operador)
PUT    /api/dispositivos/:id          (Admin, Operador)
DELETE /api/dispositivos/:id          (Admin)
GET    /api/dispositivos/jaguey/:id   (Admin, Operador, Visualizador)
GET    /api/dispositivos/conectados   (Admin, Operador, Visualizador)
```

### SENSORES
```
GET    /api/sensores                  (Admin, Operador, Visualizador)
GET    /api/sensores/:id              (Admin, Operador, Visualizador)
POST   /api/sensores                  (Admin, Operador)
PUT    /api/sensores/:id              (Admin, Operador)
DELETE /api/sensores/:id              (Admin)
PUT    /api/sensores/:id/activar      (Admin, Operador)
PUT    /api/sensores/:id/desactivar   (Admin, Operador)
```

### LECTURAS
```
GET    /api/lecturas                  (Admin, Operador, Visualizador)
GET    /api/lecturas/:id              (Admin, Operador, Visualizador)
POST   /api/lecturas                  (Admin, Operador)
POST   /api/lecturas/lote             (Admin, Operador)
PUT    /api/lecturas/:id              (Admin, Operador)
DELETE /api/lecturas/:id              (Admin)
GET    /api/lecturas/sensor/:id       (Admin, Operador, Visualizador)
GET    /api/lecturas/sensor/:id/ultima (Admin, Operador, Visualizador)
```

### ACTUADORES
```
GET    /api/actuadores                (Admin, Operador, Visualizador)
GET    /api/actuadores/:id            (Admin, Operador, Visualizador)
POST   /api/actuadores                (Admin, Operador)
PUT    /api/actuadores/:id            (Admin, Operador)
DELETE /api/actuadores/:id            (Admin)
PUT    /api/actuadores/:id/activar    (Admin, Operador)
PUT    /api/actuadores/:id/desactivar (Admin, Operador)
```

### COMANDOS REMOTOS
```
GET    /api/comandos                  (Admin, Operador)
GET    /api/comandos/:id              (Admin, Operador)
POST   /api/comandos                  (Admin, Operador)
PUT    /api/comandos/:id              (Admin, Operador)
DELETE /api/comandos/:id              (Admin)
GET    /api/comandos/actuador/:id     (Admin, Operador)
GET    /api/comandos/pendientes       (Admin, Operador)
PUT    /api/comandos/:id/estado       (Admin, Operador)
```

### ALERTAS
```
GET    /api/alertas                   (Admin, Operador, Visualizador)
GET    /api/alertas/:id               (Admin, Operador, Visualizador)
POST   /api/alertas                   (Admin, Operador)
PUT    /api/alertas/:id               (Admin, Operador)
DELETE /api/alertas/:id               (Admin)
GET    /api/alertas/activas           (Admin, Operador, Visualizador)
POST   /api/alertas/:id/resolver      (Admin, Operador)
GET    /api/alertas/stats/por-nivel   (Admin, Operador, Visualizador)
```

### JAGUEYS
```
GET    /api/jagueys                   (Admin, Operador, Visualizador)
GET    /api/jagueys/:id               (Admin, Operador, Visualizador)
POST   /api/jagueys                   (Admin)
PUT    /api/jagueys/:id               (Admin)
DELETE /api/jagueys/:id               (Admin)
GET    /api/jagueys/municipio/:nombre (Admin, Operador, Visualizador)
GET    /api/jagueys/:id/stats         (Admin, Operador, Visualizador)
```

### REPORTES
```
GET    /api/reportes/resumen-general           (Admin, Operador, Visualizador)
GET    /api/reportes/por-municipio             (Admin, Operador, Visualizador)
GET    /api/reportes/jaguey/:id                (Admin, Operador, Visualizador)
GET    /api/reportes/lecturas/sensor/:id       (Admin, Operador, Visualizador)
GET    /api/reportes/alertas                   (Admin, Operador, Visualizador)
GET    /api/reportes/comandos                  (Admin, Operador, Visualizador)
GET    /api/reportes/conectividad              (Admin, Operador, Visualizador)
GET    /api/reportes/auditoria                 (Admin ONLY)
GET    /api/reportes/exportar/:tipo            (Admin, Operador, Visualizador)
```

---

## Códigos de Error

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token no proporcionado",
  "code": "NO_TOKEN"
}

{
  "success": false,
  "message": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Acceso denegado. Roles requeridos: Admin",
  "code": "INSUFFICIENT_PERMISSIONS"
}

{
  "success": false,
  "message": "Permiso denegado. Requiere: usuario.crear",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

---

## Ejemplo de Uso en Frontend

### React Hook para Autenticación
```javascript
// hooks/useAuth.js
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('token'));

const login = async (email, password) => {
  const res = await fetch('/api/usuarios/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  setToken(data.data.token);
  setUser(data.data.usuario);
  localStorage.setItem('token', data.data.token);
};

const logout = () => {
  setUser(null);
  setToken(null);
  localStorage.removeItem('token');
};

const hasRole = (role) => user?.roles?.includes(role);
const hasPermission = (permission) => {
  // Verificar en permisos del usuario
  return true; // Según API
};

export { useAuth, login, logout, hasRole, hasPermission };
```

### Petición con Token
```javascript
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

// Uso
fetchWithAuth('/api/usuarios')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Gestión de Roles desde API

### Obtener roles de un usuario
```javascript
GET /api/usuarios/:id/roles
Authorization: Bearer <token>

Respuesta:
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Admin" },
    { "id": 2, "nombre": "Operador" }
  ]
}
```

### Obtener permisos de un usuario (agrupado)
```javascript
GET /api/usuarios/:id/permisos
Authorization: Bearer <token>

Respuesta:
{
  "success": true,
  "data": {
    "usuario": [
      { "id": 1, "nombre": "usuario.listar", "accion": "read" },
      { "id": 2, "nombre": "usuario.crear", "accion": "create" }
    ],
    "dispositivo": [
      { "id": 15, "nombre": "dispositivo.listar", "accion": "read" }
    ]
  }
}
```

### Asignar rol a usuario
```javascript
POST /api/usuarios/:id/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "rol_id": 2  // Operador
}

Respuesta:
{
  "success": true,
  "data": { /* usuario actualizado */ }
}
```

---

## Seguridad Recomendada

1. **Variables de Entorno**
   ```
   JWT_SECRET=tu_secreto_muy_seguro_aqui
   JWT_EXPIRE=7d
   ```

2. **HTTPS en Producción**
   - Todos los tokens deben transmitirse sobre HTTPS

3. **Refresh Tokens** (Futuro)
   - Implementar refresh tokens para mayor seguridad

4. **Rate Limiting**
   - Limitar intentos de login

5. **Auditoría**
   - Registrar todas las acciones admin

---

## Próximas Fases

### Fase 2: Frontend
- Componentes de login
- Guards de rutas por rol
- Renderizado condicional
- Control de acceso visual

### Fase 3: Avanzado
- Refresh tokens
- Rate limiting
- 2FA
- Auditoría detallada
- Caché de permisos
