/**
 * @file EC_Sensor.h
 * @brief Controlador para sensor de conductividad eléctrica (EC)
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Mide la conductividad del agua en µS/cm (microSiemens por centímetro)
 */

#ifndef EC_SENSOR_H
#define EC_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class EC_Sensor {
private:
  uint8_t pin;
  float calibrationFactor;
  float temperatureCompensation;
  float referenceTemperature;
  
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
   */
  EC_Sensor(uint8_t _pin) 
    : pin(_pin), 
      calibrationFactor(1.0),
      temperatureCompensation(0.02),  // 2% por °C
      referenceTemperature(25.0) {
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
    
    Serial.print("[EC_SENSOR] Sensor inicializado en pin ");
    Serial.println(pin);
    return true;
  }

  /**
   * Leer valor de conductividad (EC)
   * Rango típico: 0-5000 µS/cm (depende del sensor)
   * Agua destilada: ~0 µS/cm
   * Agua de grifo: ~500-1000 µS/cm
   * Agua marina: ~50000 µS/cm
   * 
   * @param temperature Temperatura actual del agua para compensación (opcional)
   * @return Conductividad en µS/cm
   */
  float readEC(float temperature = 25.0) {
    float voltage = readVoltage();
    
    // Convertir voltaje a conductividad (depende de la constante del sensor)
    // Rango típico: 0-3.3V corresponde a 0-5000 µS/cm
    float ec = (voltage / ADC_REFERENCE_VOLTAGE / 1000) * 5000 * calibrationFactor;
    
    // Compensación de temperatura (0.02 por °C)
    // Fórmula: ECcompensada = EC25 / (1 + k(T - 25))
    // donde k = 0.02 y T es temperatura en °C
    if (temperature != referenceTemperature) {
      float tempFactor = 1.0 + temperatureCompensation * (temperature - referenceTemperature);
      ec = ec / tempFactor;
    }
    
    // Limitar a rango válido
    if (ec < 0) ec = 0;
    if (ec > 10000) ec = 10000;
    
    return ec;
  }

  /**
   * Calibrar sensor usando una solución estándar
   * @param measuredEC Conductividad de la solución estándar (ej: 1413 µS/cm para KCl 0.1M)
   */
  void calibrate(float measuredEC) {
    float voltage = readVoltage();
    
    // Calcular factor de calibración
    // EC_teórica / EC_medida = factor de calibración
    float theoreticalVoltage = (measuredEC / 5000) * ADC_REFERENCE_VOLTAGE * 1000;
    
    calibrationFactor = theoreticalVoltage / voltage;
    
    Serial.print("[EC_SENSOR] Calibración completada. Factor: ");
    Serial.println(calibrationFactor, 4);
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
   * Obtener el voltaje actual del sensor
   * @return Voltaje en mV
   */
  float getVoltage() {
    return readVoltage();
  }

  /**
   * Convertir conductividad a TDS (Total Dissolved Solids) en ppm
   * TDS (ppm) ≈ EC (µS/cm) × 0.64
   * @param ec Valor de conductividad
   * @return TDS en ppm
   */
  static float ecToTDS(float ec) {
    return ec * 0.64;
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor está funcionando correctamente
   */
  bool selfTest() {
    float voltage = readVoltage();
    float ec = readEC();
    
    Serial.print("[EC_SENSOR] Voltaje: ");
    Serial.print(voltage, 1);
    Serial.print(" mV, EC: ");
    Serial.print(ec, 2);
    Serial.println(" µS/cm");
    
    // Aceptable si el voltaje está entre 200-3000 mV
    return (voltage > 200 && voltage < 3000);
  }
};

#endif // EC_SENSOR_H
