/**
 * @file Level_Sensor.h
 * @brief Controlador para sensor de nivel de agua
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Sensor de presión sumergible 4-20mA a 0-10V
 * Mide la profundidad del agua y convierte a metros
 */

#ifndef LEVEL_SENSOR_H
#define LEVEL_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class Level_Sensor {
private:
  uint8_t pin;
  float maxDepth;              // Profundidad máxima en metros
  float calibrationOffset;
  float calibrationFactor;
  bool usesAnalogVoltage;      // true si usa 0-3.3V, false si usa 4-20mA
  
  /**
   * Leer voltaje analógico promediado
   * @return Voltaje en mV
   */
  float readVoltage() {
    float voltage = 0;
    for (int i = 0; i < ANALOG_READ_SAMPLES; i++) {
      voltage += analogRead(pin);
      delay(10);
    }
    voltage /= ANALOG_READ_SAMPLES;
    // Convertir de valor ADC (0-4095) a voltaje (0-3.3V)
    voltage = (voltage / ADC_MAX_VALUE) * ADC_REFERENCE_VOLTAGE * 1000; // en mV
    return voltage;
  }

public:
  /**
   * Constructor
   * @param _pin Pin analógico del sensor
   * @param _maxDepth Profundidad máxima que puede medir en metros
   * @param _is4_20mA true si usa salida 4-20mA, false si usa 0-3.3V
   */
  Level_Sensor(uint8_t _pin, float _maxDepth = 5.0, bool _is4_20mA = true) 
    : pin(_pin), 
      maxDepth(_maxDepth),
      calibrationOffset(0),
      calibrationFactor(1.0),
      usesAnalogVoltage(!_is4_20mA) {
  }

  /**
   * Inicializar sensor
   * @return true si se inicializó correctamente
   */
  bool begin() {
    pinMode(pin, INPUT);
    
    // Leer algunas muestras para estabilizar
    for (int i = 0; i < 10; i++) {
      readVoltage();
      delay(100);
    }
    
    Serial.print("[LEVEL_SENSOR] Sensor inicializado en pin ");
    Serial.print(pin);
    Serial.print(" - Profundidad máxima: ");
    Serial.print(maxDepth);
    Serial.println(" m");
    
    return true;
  }

  /**
   * Leer nivel de agua
   * 
   * Para sensor 4-20mA:
   * - 4mA = 0 metros (sin agua)
   * - 20mA = profundidad máxima
   * 
   * Para sensor 0-3.3V:
   * - 0V = 0 metros
   * - 3.3V = profundidad máxima
   * 
   * @return Nivel de agua en metros
   */
  float readLevel() {
    float voltage = readVoltage();
    float level = 0;
    
    if (usesAnalogVoltage) {
      // Sensor 0-3.3V
      // Rango: 0V a 3.3V (3300 mV) corresponde a 0 a maxDepth
      level = (voltage / (ADC_REFERENCE_VOLTAGE * 1000)) * maxDepth;
    } else {
      // Sensor 4-20mA (convertido a voltaje)
      // 4mA = 0.2V (si usa resistencia de 50Ω)
      // 20mA = 1.0V
      // Fórmula: mA = (Voltaje / 50) * 1000
      float mA = (voltage / 50.0);
      
      // Convertir corriente a nivel
      if (mA < 4.0) {
        level = 0;
      } else if (mA > 20.0) {
        level = maxDepth;
      } else {
        // Interpolación lineal entre 4mA (0m) y 20mA (maxDepth)
        level = ((mA - 4.0) / 16.0) * maxDepth;
      }
    }
    
    // Aplicar offset y factor de calibración
    level = level * calibrationFactor + calibrationOffset;
    
    // Limitar a rango válido
    if (level < 0) level = 0;
    if (level > maxDepth) level = maxDepth;
    
    return level;
  }

  /**
   * Calibrar sensor en punto cero (sin agua)
   */
  void calibrateZero() {
    float voltage = readVoltage();
    Serial.print("[LEVEL_SENSOR] Calibración en cero. Voltaje: ");
    Serial.print(voltage, 1);
    Serial.println(" mV");
  }

  /**
   * Calibrar sensor en profundidad conocida
   * @param knownDepth Profundidad conocida en metros
   */
  void calibrate(float knownDepth) {
    float voltage = readVoltage();
    float measuredDepth = readLevel();
    
    // Calcular factor de calibración
    calibrationFactor = knownDepth / measuredDepth;
    
    Serial.print("[LEVEL_SENSOR] Calibración completada. Factor: ");
    Serial.println(calibrationFactor, 4);
  }

  /**
   * Establecer máxima profundidad
   * @param depth Profundidad máxima en metros
   */
  void setMaxDepth(float depth) {
    maxDepth = depth;
  }

  /**
   * Obtener máxima profundidad configurada
   * @return Profundidad máxima en metros
   */
  float getMaxDepth() {
    return maxDepth;
  }

  /**
   * Obtener el factor de calibración actual
   * @return Valor del factor
   */
  float getCalibrationFactor() {
    return calibrationFactor;
  }

  /**
   * Establecer factor de calibración manualmente
   * @param factor Nuevo factor de calibración
   */
  void setCalibrationFactor(float factor) {
    calibrationFactor = factor;
  }

  /**
   * Obtener el offset de calibración
   * @return Valor del offset
   */
  float getCalibrationOffset() {
    return calibrationOffset;
  }

  /**
   * Establecer offset de calibración manualmente
   * @param offset Nuevo valor de offset
   */
  void setCalibrationOffset(float offset) {
    calibrationOffset = offset;
  }

  /**
   * Obtener el voltaje actual del sensor
   * @return Voltaje en mV
   */
  float getVoltage() {
    return readVoltage();
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor está funcionando correctamente
   */
  bool selfTest() {
    float voltage = readVoltage();
    float level = readLevel();
    
    Serial.print("[LEVEL_SENSOR] Voltaje: ");
    Serial.print(voltage, 1);
    Serial.print(" mV, Nivel: ");
    Serial.print(level, 2);
    Serial.println(" m");
    
    if (usesAnalogVoltage) {
      return (voltage > 100 && voltage < 3200);
    } else {
      // Para sensor 4-20mA, esperar entre 200-1000 mV (4-20mA con resistencia 50Ω)
      return (voltage > 150 && voltage < 1100);
    }
  }
};

#endif // LEVEL_SENSOR_H
