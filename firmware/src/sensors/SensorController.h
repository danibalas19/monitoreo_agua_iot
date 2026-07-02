/**
 * @file SensorController.h
 * @brief Controlador principal para todos los sensores - BASADO EN ESQUEMA REAL
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Sensores reales del circuito:
 * 1. pH_EN      → GPIO34 (Analógico)
 * 2. TURBIDEZ2  → GPIO35 (Analógico)
 * 3. TDS        → GPIO33 (Analógico)
 * 4. TEMPERATURA → GPIO32 (1-Wire DS18B20)
 * 5. ULTRASONICO → GPIO4/5 (HC-SR04)
 */

#ifndef SENSOR_CONTROLLER_H
#define SENSOR_CONTROLLER_H

#include <Arduino.h>
#include "../config/hardware.h"
#include "PH_Sensor.h"
#include "Turbidity_Sensor.h"
#include "Temperature_Sensor.h"
#include "TDS_Sensor.h"
#include "Ultrasonic_Sensor.h"

/**
 * Estructura para almacenar una lectura completa
 */
struct SensorReading {
  float ph;
  float tds;              // TDS en ppm
  float turbidity;        // Turbidez en NTU
  float temperature;      // Temperatura en °C
  float level;            // Nivel en centímetros
  float levelPercentage;  // Porcentaje de llenado 0-100%
  unsigned long timestamp;
  bool valid;
};

/**
 * Clase controladora de sensores
 */
class SensorController {
private:
  PH_Sensor phSensor;
  TDS_Sensor tdsSensor;
  Turbidity_Sensor turbiditySensor;
  Temperature_Sensor temperatureSensor;
  Ultrasonic_Sensor ultrasonicSensor;
  
  SensorReading lastReading;
  unsigned long lastReadTime;
  int consecutiveErrors;

public:
  /**
   * Constructor
   */
  SensorController() 
    : phSensor(PIN_PH_SENSOR),
      tdsSensor(PIN_TDS_SENSOR),
      turbiditySensor(PIN_TURBIDITY_SENSOR),
      temperatureSensor(PIN_TEMPERATURE_SENSOR),
      ultrasonicSensor(PIN_ULTRASONIC_TRIG, PIN_ULTRASONIC_ECHO, LEVEL_MAX_THRESHOLD_CM),
      lastReadTime(0),
      consecutiveErrors(0) {
    memset(&lastReading, 0, sizeof(SensorReading));
  }

  /**
   * Inicializar todos los sensores
   * @return true si todos los sensores se inicializaron correctamente
   */
  bool begin() {
    bool success = true;
    
    Serial.println("[SENSORS] Inicializando sensores del esquema real...");
    
    if (!phSensor.begin()) {
      Serial.println("[ERROR] Fallo al inicializar sensor de pH (PH_EN)");
      success = false;
    }
    
    if (!tdsSensor.begin()) {
      Serial.println("[ERROR] Fallo al inicializar sensor TDS");
      success = false;
    }
    
    if (!turbiditySensor.begin()) {
      Serial.println("[ERROR] Fallo al inicializar sensor de turbidez (TURBIDEZ2)");
      success = false;
    }
    
    if (!temperatureSensor.begin()) {
      Serial.println("[ERROR] Fallo al inicializar sensor de temperatura");
      success = false;
    }
    
    if (!ultrasonicSensor.begin()) {
      Serial.println("[ERROR] Fallo al inicializar sensor ultrasónico (ULTRASONICO)");
      success = false;
    }
    
    if (success) {
      Serial.println("[SENSORS] ✓ Todos los sensores (5) inicializados correctamente");
      Serial.println("[SENSORS] Sensores: pH, TDS, Turbidez, Temperatura, Ultrasónico");
    }
    
    return success;
  }

  /**
   * Leer todos los sensores
   * @return Estructura con todas las lecturas
   */
  SensorReading readAllSensors() {
    SensorReading reading;
    reading.timestamp = millis();
    reading.valid = true;

    // Leer cada sensor
    reading.temperature = temperatureSensor.readTemperature();  // Leer temperatura PRIMERO
    
    // Salvaguarda: Si la temperatura falla (-127), usamos 25°C para que el TDS no marque 0.00
    float tempForTDS = (reading.temperature <= -100.0) ? 25.0 : reading.temperature;
    
    reading.tds = tdsSensor.readTDS(tempForTDS);                // <-- Sensor TDS reactivado con compensación térmica
    reading.turbidity = turbiditySensor.readTurbidity();        // <-- Sensor de turbidez reactivado
    reading.ph = phSensor.readPH();                             // <-- Sensor de pH reactivado
    reading.level = ultrasonicSensor.readLevel();               // <-- Sensor de nivel reactivado
    reading.levelPercentage = ultrasonicSensor.getLevelPercentage();
    

    // Validar lecturas
    if (!validateReading(reading)) {
      consecutiveErrors++;
      reading.valid = false; // Bloquea el envío si la lectura es basura
      if (consecutiveErrors > 5) {
        Serial.println("[WARNING] Demasiados errores en sensores");
      }
    } else {
      consecutiveErrors = 0;
    }

    lastReading = reading;
    lastReadTime = millis();
    
    return reading;
  }

  /**
   * Validar que las lecturas estén dentro de rangos válidos
   * @param reading Lectura a validar
   * @return true si es válida
   */
  bool validateReading(const SensorReading& reading) {
    // Verificar rangos válidos
    if (reading.ph < 0 || reading.ph > 14) return false;
    if (reading.tds < 0 || reading.tds > 5000) return false;
    if (reading.turbidity < 0 || reading.turbidity > 4000) return false;
    if (reading.temperature < -10 || reading.temperature > 60) return false;
    if (reading.level < 0 || reading.level > LEVEL_MAX_THRESHOLD_CM) return false;
    
    return true;
  }

  /**
   * Obtener la última lectura
   * @return Última lectura realizada
   */
  SensorReading getLastReading() {
    return lastReading;
  }

  /**
   * Calibrar sensor de pH
   * @param calibrationValue Valor de calibración
   */
  void calibratePH(float calibrationValue) {
    phSensor.calibrate(calibrationValue);
  }

  /**
   * Calibrar sensor de TDS
   * @param calibrationValue Valor de calibración en ppm
   */
  void calibrateTDS(float calibrationValue) {
    tdsSensor.calibrate(calibrationValue);
  }

  /**
   * Calibrar sensor de turbidez
   * @param calibrationValue Valor de calibración en NTU
   */
  void calibrateTurbidity(float calibrationValue) {
    turbiditySensor.calibrate(calibrationValue);
  }

  /**
   * Calibrar sensor ultrasónico
   * @param knownDistance Distancia conocida en cm
   */
  void calibrateUltrasonic(float knownDistance) {
    ultrasonicSensor.calibrate(knownDistance);
  }

  /**
   * Obtener estado de los sensores
   * @return JSON string con el estado
   */
  String getStatusJSON() {
    String json = "{";
    json += "\"pH\":" + String(lastReading.ph, 2) + ",";
    json += "\"tds\":" + String(lastReading.tds, 2) + ",";
    json += "\"turbidity\":" + String(lastReading.turbidity, 2) + ",";
    json += "\"temperature\":" + String(lastReading.temperature, 2) + ",";
    json += "\"level_cm\":" + String(lastReading.level, 2) + ",";
    json += "\"level_percent\":" + String(lastReading.levelPercentage, 1) + ",";
    json += "\"timestamp\":" + String(lastReading.timestamp) + ",";
    json += "\"valid\":" + String(lastReading.valid ? "true" : "false");
    json += "}";
    return json;
  }

  /**
   * Resetear contador de errores
   */
  void resetErrorCounter() {
    consecutiveErrors = 0;
  }

  /**
   * Obtener contador de errores consecutivos
   * @return Número de errores
   */
  int getErrorCount() {
    return consecutiveErrors;
  }

  /**
   * Realizar diagnóstico de todos los sensores
   */
  void runSelfTest() {
    Serial.println("\n[SENSORS] === AUTODIAGNÓSTICO ===");
    phSensor.selfTest();
    tdsSensor.selfTest();
    turbiditySensor.selfTest();
    temperatureSensor.selfTest();
    ultrasonicSensor.selfTest();
    Serial.println("[SENSORS] === FIN AUTODIAGNÓSTICO ===\n");
  }

  /**
   * Obtener descripción detallada del estado
   */
  void printDetailedStatus() {
    Serial.println("\n==== ESTADO DETALLADO DE SENSORES ====");
    Serial.print("pH (PH_EN): ");
    Serial.print(lastReading.ph, 2);
    Serial.println(" unidades");
    
    Serial.print("TDS: ");
    Serial.print(lastReading.tds, 2);
    Serial.println(" ppm");
    
    Serial.print("Turbidez (TURBIDEZ2): ");
    Serial.print(lastReading.turbidity, 2);
    Serial.println(" NTU");
    
    Serial.print("Temperatura: ");
    Serial.print(lastReading.temperature, 2);
    Serial.println(" °C");
    
    Serial.print("Nivel: ");
    Serial.print(lastReading.level, 2);
    Serial.print(" cm (");
    Serial.print(lastReading.levelPercentage, 1);
    Serial.println("%)");
    
    Serial.println("=====================================\n");
  }
};

#endif // SENSOR_CONTROLLER_H
