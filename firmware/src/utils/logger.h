/**
 * @file logger.h
 * @brief Sistema de logging para debugging y monitoreo
 * @author Daniel Balasnoa
 * @version 1.0.0
 */

#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>
#include "../config/credentials.h"
#include "../config/hardware.h"

enum LogLevel {
  LOG_DEBUG = 0,
  LOG_INFO = 1,
  LOG_WARNING = 2,
  LOG_ERROR = 3,
  LOG_CRITICAL = 4
};

class Logger {
private:
  LogLevel currentLevel;
  bool serialEnabled;
  bool sdCardEnabled;

public:
  Logger() 
    : currentLevel(LOG_DEBUG),
      serialEnabled(true),
      sdCardEnabled(false) {
  }

  /**
   * Inicializar logger
   */
  void begin(LogLevel level = LOG_DEBUG) {
    currentLevel = level;
    Serial.begin(DEBUG_SERIAL_SPEED);
    
    // Esperar a que Serial esté listo
    delay(1000);
    
    Serial.println("\n================================================");
    Serial.println("MONITOREO AGUA IoT - FIRMWARE ESP32");
    Serial.print("Versión: ");
    Serial.println(FIRMWARE_VERSION);
    Serial.print("Build: ");
    Serial.print(BUILD_DATE);
    Serial.print(" ");
    Serial.println(BUILD_TIME);
    Serial.println("================================================\n");
  }

  /**
   * Log de DEBUG
   */
  void debug(const char* msg) {
    if (currentLevel <= LOG_DEBUG) {
      Serial.print("[DEBUG] ");
      Serial.println(msg);
    }
  }

  /**
   * Log de INFO
   */
  void info(const char* msg) {
    if (currentLevel <= LOG_INFO) {
      Serial.print("[INFO] ");
      Serial.println(msg);
    }
  }

  /**
   * Log de WARNING
   */
  void warning(const char* msg) {
    if (currentLevel <= LOG_WARNING) {
      Serial.print("[WARNING] ");
      Serial.println(msg);
    }
  }

  /**
   * Log de ERROR
   */
  void error(const char* msg) {
    if (currentLevel <= LOG_ERROR) {
      Serial.print("[ERROR] ");
      Serial.println(msg);
    }
  }

  /**
   * Log de CRITICAL
   */
  void critical(const char* msg) {
    if (currentLevel <= LOG_CRITICAL) {
      Serial.print("[CRITICAL] ");
      Serial.println(msg);
    }
  }

  /**
   * Log con formato
   */
  void printf(const char* format, ...) {
    char buffer[256];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    Serial.println(buffer);
  }

  /**
   * Obtener nivel de log actual
   */
  LogLevel getLevel() {
    return currentLevel;
  }

  /**
   * Cambiar nivel de log
   */
  void setLevel(LogLevel level) {
    currentLevel = level;
  }

  /**
   * Mostrar información del dispositivo
   */
  void printDeviceInfo() {
    Serial.println("\n==== INFORMACIÓN DEL DISPOSITIVO ====");
    Serial.print("Dispositivo ID: ");
    Serial.println(DISPOSITIVO_ID);
    Serial.print("Código: ");
    Serial.println(DISPOSITIVO_CODIGO);
    Serial.print("Jaguey ID: ");
    Serial.println(JAGUEY_ID);
    Serial.print("MAC Address: ");
    Serial.println(WiFi.macAddress());
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Señal WiFi: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("Memoria libre: ");
    Serial.print(ESP.getFreeHeap());
    Serial.println(" bytes");
    Serial.println("=====================================\n");
  }

  /**
   * Mostrar información de sensores
   */
  void printSensorInfo(const SensorReading& reading) {
    Serial.println("\n==== LECTURAS DE SENSORES ====");
    Serial.print("pH: ");
    Serial.print(reading.ph, 2);
    Serial.println(" unidades");
    
    Serial.print("TDS: ");
    Serial.print(reading.tds, 2);
    Serial.println(" ppm");
    
    Serial.print("Turbidez: ");
    Serial.print(reading.turbidity, 2);
    Serial.println(" NTU");
    
    Serial.print("Temperatura: ");
    Serial.print(reading.temperature, 2);
    Serial.println(" °C");
    
    Serial.print("Nivel: ");
    Serial.print(reading.level, 2);
    Serial.println(" metros");
    
    Serial.println("==============================\n");
  }
};

// Instancia global
extern Logger logger;

#endif // LOGGER_H
