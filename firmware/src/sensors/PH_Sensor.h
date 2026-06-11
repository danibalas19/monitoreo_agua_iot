/**
 * @file PH_Sensor.h
 * @brief Controlador para sensor de pH
 * @author Daniel Balasnoa
 * @version 1.0.0
 */

#ifndef PH_SENSOR_H
#define PH_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class PH_Sensor {
private:
  uint8_t pin;
  float calibrationOffset;
  float slopeVoltagePH;  // mV por unidad de pH
  
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
  PH_Sensor(uint8_t _pin) 
    : pin(_pin), 
      calibrationOffset(0),
      slopeVoltagePH(59.16) {  // Típicamente 59.16 mV/pH a 25°C
  }

  /**
   * Inicializar sensor
   * @return true si se inicializó correctamente
   */
  bool begin() {
    // Configurar pin como entrada analógica
    pinMode(pin, INPUT);
    
    // Leer algunas muestras para estabilizar
    for (int i = 0; i < 10; i++) {
      readVoltage();
      delay(100);
    }
    
    Serial.print("[pH_SENSOR] Sensor inicializado en pin ");
    Serial.println(pin);
    return true;
  }

  /**
   * Leer valor de pH
   * Rango esperado: 0-14 (típicamente 6.5-8.5 para agua)
   * 
   * Fórmula: pH = pHNeutral + (VoltajeLeído - VoltajeNeutral) / slopeVoltagePH
   * 
   * @return Valor de pH
   */
  float readPH() {
    float voltage = readVoltage();
    
    // Voltaje de referencia a pH 7 (típicamente ~1650mV para sensor analógico)
    float voltageAtPH7 = 1650.0;
    
    // Calcular pH basado en voltaje
    float ph = 7.0 + (voltage - voltageAtPH7) / slopeVoltagePH + calibrationOffset;
    
    // Limitar a rango válido
    if (ph < 0) ph = 0;
    if (ph > 14) ph = 14;
    
    return ph;
  }

  /**
   * Calibrar sensor usando una solución estándar
   * @param calibrationValue Valor esperado de pH (ej: 7.0, 4.0, 10.0)
   */
  void calibrate(float calibrationValue) {
    float measuredVoltage = readVoltage();
    
    // Calcular el offset de calibración
    float voltageAtPH7 = 1650.0;
    float expectedVoltage = 1650.0 + (calibrationValue - 7.0) * slopeVoltagePH;
    
    calibrationOffset = (calibrationValue - 7.0) - 
                       (measuredVoltage - voltageAtPH7) / slopeVoltagePH;
    
    Serial.print("[pH_SENSOR] Calibración completada. Offset: ");
    Serial.println(calibrationOffset, 3);
  }

  /**
   * Obtener el offset de calibración actual
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
   * @return true si el sensor está dentro de rangos aceptables
   */
  bool selfTest() {
    float voltage = readVoltage();
    float ph = readPH();
    
    Serial.print("[pH_SENSOR] Voltaje: ");
    Serial.print(voltage, 1);
    Serial.print(" mV, pH: ");
    Serial.println(ph, 2);
    
    // Aceptable si el voltaje está entre 400-2500 mV
    return (voltage > 400 && voltage < 2500);
  }
};

#endif // PH_SENSOR_H
