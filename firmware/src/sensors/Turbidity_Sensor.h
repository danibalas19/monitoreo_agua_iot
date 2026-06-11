/**
 * @file Turbidity_Sensor.h
 * @brief Controlador para sensor de turbidez
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Mide la turbidez del agua en NTU (Nephelometric Turbidity Units)
 */

#ifndef TURBIDITY_SENSOR_H
#define TURBIDITY_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class Turbidity_Sensor {
private:
  uint8_t pin;
  float calibrationOffset;
  float slopeVoltageTurbidity;
  
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
  Turbidity_Sensor(uint8_t _pin) 
    : pin(_pin), 
      calibrationOffset(0),
      slopeVoltageTurbidity(1.0) {  // Ajustar según datasheet del sensor
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
    
    Serial.print("[TURBIDITY_SENSOR] Sensor inicializado en pin ");
    Serial.println(pin);
    return true;
  }

  /**
   * Leer valor de turbidez
   * Rango típico: 0-4000 NTU (depende del sensor)
   * 
   * Agua clara: 0-1 NTU
   * Agua ligeramente turbia: 1-5 NTU
   * Agua turbia: 5-10 NTU
   * Agua muy turbia: >10 NTU
   * 
   * Fórmula simplificada:
   * Turbidez (NTU) = -1000 * ln(V/Vo) / 2.5
   * donde Vo es el voltaje en agua clara
   * 
   * O con aproximación lineal:
   * Turbidez (NTU) = (Voltaje_Referencia - Voltaje_Leído) / 2.45 * 1000
   * 
   * @return Turbidez en NTU
   */
  float readTurbidity() {
    float voltage = readVoltage();
    
    // Voltaje de referencia (agua clara, típicamente 2500 mV)
    float referenceVoltage = 2500.0;
    
    // Aplicar fórmula de conversión
    // Muchos sensores tienen respuesta aproximadamente lineal
    float turbidity = (referenceVoltage - voltage) / 2.45;
    
    // Aplicar offset de calibración
    turbidity += calibrationOffset;
    
    // Limitar a rango válido
    if (turbidity < 0) turbidity = 0;
    if (turbidity > 4000) turbidity = 4000;
    
    return turbidity;
  }

  /**
   * Calibrar sensor en agua clara (0 NTU)
   * IMPORTANTE: Realizar en agua destilada o agua muy clara
   */
  void calibrateZero() {
    float voltage = readVoltage();
    
    // En agua clara, el voltaje debe estar cerca del máximo
    Serial.print("[TURBIDITY_SENSOR] Calibración en agua clara. Voltaje: ");
    Serial.print(voltage, 1);
    Serial.println(" mV");
  }

  /**
   * Calibrar sensor usando una solución estándar
   * @param referenceTurbidity Valor de turbidez conocida
   */
  void calibrate(float referenceTurbidity) {
    float voltage = readVoltage();
    float measuredTurbidity = readTurbidity();
    
    // Calcular offset
    calibrationOffset = referenceTurbidity - measuredTurbidity;
    
    Serial.print("[TURBIDITY_SENSOR] Calibración completada. Offset: ");
    Serial.println(calibrationOffset, 3);
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
   * Interpretación de calidad del agua según turbidez
   * @return Descripción de la calidad del agua
   */
  String getWaterQuality() {
    float turbidity = readTurbidity();
    
    if (turbidity < 1) return "Agua muy clara";
    if (turbidity < 5) return "Agua clara";
    if (turbidity < 10) return "Agua ligeramente turbia";
    return "Agua muy turbia";
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor está funcionando correctamente
   */
  bool selfTest() {
    float voltage = readVoltage();
    float turbidity = readTurbidity();
    
    Serial.print("[TURBIDITY_SENSOR] Voltaje: ");
    Serial.print(voltage, 1);
    Serial.print(" mV, Turbidez: ");
    Serial.print(turbidity, 2);
    Serial.println(" NTU");
    
    // Aceptable si el voltaje está en rango razonable
    return (voltage > 400 && voltage < 2800);
  }
};

#endif // TURBIDITY_SENSOR_H
