/**
 * @file credentials.h
 * @brief Credenciales y configuración de red para el sistema IoT
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * ⚠️ SEGURIDAD: Este archivo contiene credenciales sensibles.
 * NO PUBLICAR EN REPOSITORIOS PÚBLICOS. Usar variables de entorno en producción.
 */

#ifndef CREDENTIALS_H
#define CREDENTIALS_H

// ==========================================
// CONFIGURACIÓN WiFi
// ==========================================
// Cambiar estos valores con tus credenciales WiFi
#define WIFI_SSID              "FLIA CUELLO PEREZ 5G"
#define WIFI_PASSWORD          "1006889554"
#define WIFI_MAX_ATTEMPTS      3
#define WIFI_RETRY_DELAY       5000           // 5 segundos entre intentos

// ==========================================
// CONFIGURACIÓN MQTT
// ==========================================
#define MQTT_BROKER            "192.168.1.100" // IP del broker MQTT (Mosquitto)
#define MQTT_PORT              1883            // Puerto MQTT estándar
#define MQTT_USERNAME          ""              // Usuario MQTT (opcional)
#define MQTT_PASSWORD          ""              // Contraseña MQTT (opcional)
#define MQTT_CLIENT_ID         "ESP32-AGUA-001" // Identificador único del dispositivo

// ==========================================
// TÓPICOS MQTT
// ==========================================
// Patrón: agua/jaguey/{jaguey_id}/dispositivo/{dispositivo_id}/{tipo}
#define MQTT_TOPIC_SENSORS     "agua/sensores"           // Publicar lecturas
#define MQTT_TOPIC_COMMANDS    "agua/comandos"           // Recibir comandos
#define MQTT_TOPIC_STATUS      "agua/estado"             // Estado del dispositivo
#define MQTT_TOPIC_DEBUG       "agua/debug"              // Mensajes de debug
#define MQTT_TOPIC_ERRORS      "agua/errores"            // Mensajes de error

// Tópicos específicos por sensor (ej: agua/sensores/pH, agua/sensores/temperatura)
#define MQTT_TOPIC_PH          "agua/sensores/pH"
#define MQTT_TOPIC_TDS         "agua/sensores/tds"         // TDS en ppm
#define MQTT_TOPIC_TURBIDITY   "agua/sensores/turbidez"
#define MQTT_TOPIC_TEMP        "agua/sensores/temperatura"
#define MQTT_TOPIC_LEVEL       "agua/sensores/nivel"        // Nivel en centímetros
#define MQTT_TOPIC_LEVEL_PERCENT "agua/sensores/nivel_porcento"  // Porcentaje de llenado

// ==========================================
// CONFIGURACIÓN API REST
// ==========================================
// URL del servidor backend
#define API_BASE_URL           "http://192.168.1.100:3000/api/v1"
#define API_ENDPOINT_LECTURAS  "/lecturas"
#define API_ENDPOINT_ALERTAS   "/alertas"
#define API_ENDPOINT_COMANDOS  "/comandos-remotos"

// Credenciales para autenticación en API (JWT)
#define API_USERNAME           "danibalaspinto@gmail.com"
#define API_PASSWORD           "Mine123"

// ==========================================
// IDENTIFICADORES DEL DISPOSITIVO
// ==========================================
// Estos valores se deben sincronizar con la base de datos del backend
#define DISPOSITIVO_ID         1              // ID del dispositivo en la BD
#define DISPOSITIVO_CODIGO     "DISP-ESP32-001"
#define JAGUEY_ID              1              // ID del jaguey en la BD

// ==========================================
// VERSIÓN Y METADATA
// ==========================================
#define FIRMWARE_VERSION       "1.0.0"
#define FIRMWARE_NAME          "Monitoreo Agua IoT"
#define DEVICE_TYPE            "ESP32_DOIT_DEVKIT_V1"
#define BUILD_DATE             __DATE__
#define BUILD_TIME             __TIME__

// ==========================================
// CONFIGURACIÓN DE DEBUG
// ==========================================
#define DEBUG_MODE             true           // Habilitar logs debug
#define DEBUG_SERIAL_SPEED     115200
#define LOG_TO_MQTT            true           // Enviar logs por MQTT

// ==========================================
// SEGURIDAD - TLS/SSL (Opcional para producción)
// ==========================================
#define USE_SSL                false          // Cambiar a true en producción
#define CA_CERT                ""             // Certificado CA si se usa SSL

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================
/**
 * Obtener credenciales de forma segura desde EEPROM/NVS
 * TODO: Implementar lectura desde almacenamiento encriptado
 */
void loadCredentialsFromStorage() {
  // Implementar lectura desde NVS (Non-Volatile Storage)
  // Esto es más seguro que hardcodear credenciales
}

#endif // CREDENTIALS_H
