/**
 * @file Ultrasonic_Sensor.h
 * @brief Controlador para sensor ultrasónico HC-SR04
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Mide la distancia del agua usando ondas ultrasónicas
 * Rango: 2cm a 400cm
 * Precisión: ±3mm
 * 
 * CONEXIÓN:
 * - VCC → 5V
 * - GND → GND
 * - TRIG → GPIO4
 * - ECHO → GPIO5
 */

#ifndef ULTRASONIC_SENSOR_H
#define ULTRASONIC_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class Ultrasonic_Sensor {
private:
  uint8_t trigPin;
  uint8_t echoPin;
  float calibrationOffset;
  float calibrationFactor;
  float maxDistance;
  float minDistance;
  
  /**
   * Medir la distancia usando pulso ultrasónico
   * @return Distancia en centímetros
   */
  float measureDistance() {
    // Enviar pulso trigger de 10 microsegundos
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    
    // Medir la duración del pulso echo
    unsigned long duration = pulseIn(echoPin, HIGH, ULTRASONIC_TIMEOUT_US);
    
    if (duration == 0) {
      return -1.0;  // Error, timeout
    }
    
    // Cálculo: distancia = (tiempo * velocidad del sonido) / 2
    // velocidad del sonido ≈ 343 m/s = 0.0343 cm/µs
    // distancia (cm) = (duración en µs * 0.0343) / 2
    float distance = (duration * 0.0343) / 2.0;
    
    return distance;
  }

public:
  /**
   * Constructor
   * @param _trigPin Pin de trigger (GPIO4)
   * @param _echoPin Pin de echo (GPIO5)
   * @param _maxDist Distancia máxima esperada en cm
   */
  Ultrasonic_Sensor(uint8_t _trigPin, uint8_t _echoPin, float _maxDist = 400.0) 
    : trigPin(_trigPin),
      echoPin(_echoPin),
      calibrationOffset(0),
      calibrationFactor(1.0),
      maxDistance(_maxDist),
      minDistance(2.0) {
  }

  /**
   * Inicializar sensor
   * @return true si se inicializó correctamente
   */
  bool begin() {
    // Configurar pines
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
    
    // Estado inicial
    digitalWrite(trigPin, LOW);
    
    // Estabilizar
    delay(1000);
    
    Serial.print("[ULTRASONIC_SENSOR] Sensor inicializado");
    Serial.print(" - TRIG: GPIO");
    Serial.print(trigPin);
    Serial.print(" - ECHO: GPIO");
    Serial.println(echoPin);
    
    return true;
  }

  /**
   * Leer distancia del agua
   * 
   * Rango: 2cm a 400cm
   * La distancia se convierte a nivel de agua considerando:
   * - Distancia 0 = tanque lleno (sin aire)
   * - Distancia máxima = tanque vacío
   * 
   * @return Distancia en centímetros (-1 si hay error)
   */
  float readDistance() {
    float distance = 0;
    
    // Tomar múltiples muestras y promediar
    for (int i = 0; i < ULTRASONIC_SAMPLES; i++) {
      float sample = measureDistance();
      
      if (sample < 0) {
        Serial.println("[ULTRASONIC_SENSOR] Error en medición");
        return -1.0;
      }
      
      distance += sample;
      delay(10);
    }
    
    distance /= ULTRASONIC_SAMPLES;
    
    // Aplicar factor de calibración y offset
    distance = (distance * calibrationFactor) + calibrationOffset;
    
    // Limitar a rango válido
    if (distance < minDistance) distance = minDistance;
    if (distance > maxDistance) distance = maxDistance;
    
    return distance;
  }

  /**
   * Convertir distancia a nivel de agua en centímetros
   * Asumiendo que el sensor está montado en la parte superior del contenedor
   * Nivel = maxDistance - distancia
   * 
   * @return Nivel de agua en centímetros
   */
  float readLevel() {
    float distance = readDistance();
    
    if (distance < 0) return -1.0;
    
    // Nivel = profundidad máxima - distancia medida
    float level = maxDistance - distance;
    
    // Asegurar que no sea negativo
    if (level < 0) level = 0;
    
    return level;
  }

  /**
   * Convertir nivel de agua a metros
   * @return Nivel de agua en metros
   */
  float readLevelMeters() {
    float levelCm = readLevel();
    if (levelCm < 0) return -1.0;
    return levelCm / 100.0;
  }

  /**
   * Calibrar sensor usando distancia conocida
   * @param knownDistance Distancia conocida en cm
   */
  void calibrate(float knownDistance) {
    float measuredDistance = measureDistance();
    
    if (measuredDistance < 0) {
      Serial.println("[ULTRASONIC_SENSOR] Error al calibrar - no se pudo medir");
      return;
    }
    
    // Calcular factor de calibración
    calibrationFactor = knownDistance / measuredDistance;
    
    Serial.print("[ULTRASONIC_SENSOR] Calibración completada. Factor: ");
    Serial.println(calibrationFactor, 4);
  }

  /**
   * Establecer factor de calibración manualmente
   * @param factor Nuevo factor de calibración
   */
  void setCalibrationFactor(float factor) {
    calibrationFactor = factor;
  }

  /**
   * Obtener factor de calibración
   * @return Factor actual
   */
  float getCalibrationFactor() {
    return calibrationFactor;
  }

  /**
   * Establecer offset de calibración
   * @param offset Offset en cm
   */
  void setCalibrationOffset(float offset) {
    calibrationOffset = offset;
  }

  /**
   * Establecer profundidad máxima del tanque
   * @param depth Profundidad máxima en cm
   */
  void setMaxDepth(float depth) {
    maxDistance = depth;
  }

  /**
   * Obtener profundidad máxima configurada
   * @return Profundidad máxima en cm
   */
  float getMaxDepth() {
    return maxDistance;
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor está funcionando correctamente
   */
  bool selfTest() {
    float distance = readDistance();
    
    Serial.print("[ULTRASONIC_SENSOR] Distancia: ");
    Serial.print(distance, 2);
    Serial.print(" cm, Nivel: ");
    Serial.print(readLevel(), 2);
    Serial.println(" cm");
    
    // Aceptable si la distancia está en rango válido
    return (distance > minDistance && distance < maxDistance);
  }

  /**
   * Obtener la última distancia medida
   * @return Distancia en cm
   */
  float getLastDistance() {
    return readDistance();
  }

  /**
   * Interpretar nivel de agua
   * @return Descripción del nivel
   */
  String getWaterLevelDescription() {
    float level = readLevel();
    float percentage = (level / maxDistance) * 100.0;
    
    if (percentage < 20) return "MUY BAJO";
    if (percentage < 40) return "BAJO";
    if (percentage < 60) return "NORMAL";
    if (percentage < 80) return "ALTO";
    return "MUY ALTO";
  }

  /**
   * Obtener porcentaje de llenado
   * @return Porcentaje (0-100%)
   */
  float getLevelPercentage() {
    float level = readLevel();
    if (level < 0) return 0;
    float percentage = (level / maxDistance) * 100.0;
    if (percentage > 100) percentage = 100;
    return percentage;
  }
};

#endif // ULTRASONIC_SENSOR_H
