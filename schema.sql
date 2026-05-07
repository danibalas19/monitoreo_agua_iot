# Script SQL para crear la base de datos
# Ejecuta este script en tu gestor MySQL para crear todas las tablas

# =========================
# BASE DE DATOS
# =========================
CREATE DATABASE IF NOT EXISTS monitoreo_agua_iot;
USE monitoreo_agua_iot;

# =========================
# 1. ESTADOS
# =========================
CREATE TABLE IF NOT EXISTS estado_jaguey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS estado_actuador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

# Inserts iniciales
INSERT IGNORE INTO estado_jaguey (id, nombre, descripcion) VALUES 
(1, 'Activo', 'Jaguey en operación normal'),
(2, 'Inactivo', 'Jaguey sin operación'),
(3, 'Mantenimiento', 'Jaguey en mantenimiento');

INSERT IGNORE INTO estado_actuador (id, nombre) VALUES 
(1, 'Activado'),
(2, 'Desactivado');

# =========================
# 2. JAGUEY
# =========================
CREATE TABLE IF NOT EXISTS jaguey (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    ubicacion VARCHAR(200),
    municipio VARCHAR(100),
    latitud FLOAT,
    longitud FLOAT,
    capacidad_m3 FLOAT,
    estado_id INT,
    FOREIGN KEY (estado_id) REFERENCES estado_jaguey(id)
);

# =========================
# 3. DISPOSITIVOS IoT
# =========================
CREATE TABLE IF NOT EXISTS dispositivo_iot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(100),
    jaguey_id INT,
    tipo VARCHAR(50),
    estado_conectividad VARCHAR(50),
    ultima_conexion DATETIME,
    FOREIGN KEY (jaguey_id) REFERENCES jaguey(id)
);

# =========================
# 4. VARIABLES Y SENSORES
# =========================
CREATE TABLE IF NOT EXISTS tipo_variable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    unidad VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS sensor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id INT,
    tipo_variable_id INT,
    modelo VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivo_iot(id),
    FOREIGN KEY (tipo_variable_id) REFERENCES tipo_variable(id)
);

# Inserts de tipos de variables
INSERT IGNORE INTO tipo_variable (id, nombre, unidad) VALUES 
(1, 'Nivel', 'metros'),
(2, 'Temperatura', '°C'),
(3, 'pH', 'unidades pH'),
(4, 'Conductividad', 'µS/cm'),
(5, 'Humedad', '%');

# =========================
# 5. LECTURAS
# =========================
CREATE TABLE IF NOT EXISTS lectura_sensor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    valor FLOAT,
    timestamp DATETIME,
    estado VARCHAR(20),
    FOREIGN KEY (sensor_id) REFERENCES sensor(id)
);

# =========================
# 6. ALERTAS
# =========================
CREATE TABLE IF NOT EXISTS umbral_alerta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_variable_id INT,
    min_valor FLOAT,
    max_valor FLOAT,
    nivel VARCHAR(20),
    FOREIGN KEY (tipo_variable_id) REFERENCES tipo_variable(id)
);

CREATE TABLE IF NOT EXISTS alerta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lectura_id INT,
    tipo VARCHAR(50),
    mensaje TEXT,
    nivel VARCHAR(20),
    timestamp DATETIME,
    resuelta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (lectura_id) REFERENCES lectura_sensor(id)
);

CREATE TABLE IF NOT EXISTS notificacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alerta_id INT,
    usuario_id INT,
    canal VARCHAR(50),
    estado_envio VARCHAR(50),
    fecha_envio DATETIME,
    FOREIGN KEY (alerta_id) REFERENCES alerta(id)
);

# =========================
# 7. ACTUADORES
# =========================
CREATE TABLE IF NOT EXISTS actuador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id INT,
    tipo VARCHAR(50),
    estado_actual INT,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivo_iot(id),
    FOREIGN KEY (estado_actual) REFERENCES estado_actuador(id)
);

# =========================
# 8. CONTROL REMOTO
# =========================
CREATE TABLE IF NOT EXISTS comando_remoto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actuador_id INT,
    usuario_id INT,
    comando VARCHAR(50),
    timestamp DATETIME,
    estado VARCHAR(20),
    FOREIGN KEY (actuador_id) REFERENCES actuador(id)
);

CREATE TABLE IF NOT EXISTS respuesta_comando (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comando_id INT,
    respuesta TEXT,
    timestamp DATETIME,
    FOREIGN KEY (comando_id) REFERENCES comando_remoto(id)
);

# =========================
# 9. USUARIOS Y ROLES
# =========================
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id INT,
    rol_id INT,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (rol_id) REFERENCES rol(id)
);

# Inserts de roles
INSERT IGNORE INTO rol (id, nombre) VALUES 
(1, 'Admin'),
(2, 'Operador'),
(3, 'Visualizador');

# =========================
# 10. LOGS Y AUDITORÍA
# =========================
CREATE TABLE IF NOT EXISTS log_conectividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id INT,
    estado VARCHAR(50),
    timestamp DATETIME,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivo_iot(id)
);

CREATE TABLE IF NOT EXISTS auditoria_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100),
    tabla_afectada VARCHAR(50),
    registro_id INT,
    timestamp DATETIME,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

# =========================
# ÍNDICES PARA OPTIMIZACIÓN
# =========================
CREATE INDEX idx_jaguey_municipio ON jaguey(municipio);
CREATE INDEX idx_jaguey_estado ON jaguey(estado_id);
CREATE INDEX idx_dispositivo_jaguey ON dispositivo_iot(jaguey_id);
CREATE INDEX idx_dispositivo_estado ON dispositivo_iot(estado_conectividad);
CREATE INDEX idx_sensor_dispositivo ON sensor(dispositivo_id);
CREATE INDEX idx_sensor_tipo ON sensor(tipo_variable_id);
CREATE INDEX idx_lectura_sensor ON lectura_sensor(sensor_id);
CREATE INDEX idx_lectura_timestamp ON lectura_sensor(timestamp);
CREATE INDEX idx_alerta_lectura ON alerta(lectura_id);
CREATE INDEX idx_alerta_resuelta ON alerta(resuelta);
CREATE INDEX idx_alerta_timestamp ON alerta(timestamp);
CREATE INDEX idx_comando_actuador ON comando_remoto(actuador_id);
CREATE INDEX idx_comando_usuario ON comando_remoto(usuario_id);
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_log_dispositivo ON log_conectividad(dispositivo_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_sistema(usuario_id);
CREATE INDEX idx_auditoria_timestamp ON auditoria_sistema(timestamp);

