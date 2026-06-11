/**
 * @file TDS_Sensor.h
 * @brief Controlador para sensor de TDS (Total Dissolved Solids)
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Mide la concentración de sólidos disueltos en el agua
 * Rango: 0-5000 ppm (partes por millón)
 * Precisión: ±2%
 * 
 * CONEXIÓN:
 * - Signal → GPIO33 (ADC2_CH4)
 * - VCC    → 5V
 * - GND    → GND
 */

#ifndef TDS_SENSOR_H
#define TDS_SENSOR_H

#include <Arduino.h>
#include "../config/hardware.h"

class TDS_Sensor {
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
   * @param _pin Pin analógico del sensor (GPIO33)
   */
  TDS_Sensor(uint8_t _pin) 
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
    
    Serial.print("[TDS_SENSOR] Sensor inicializado en pin ");
    Serial.println(pin);
    return true;
  }

  /**
   * Leer valor de TDS (Total Dissolved Solids)
   * 
   * Rango típico: 0-5000 ppm
   * Agua destilada: ~0 ppm
   * Agua de grifo: ~50-500 ppm
   * Agua marina: ~35000 ppm
   * 
   * Fórmula de conversión:
   * TDS (ppm) = Voltaje (V) / 4.3 * 1000
   * 
   * @param temperature Temperatura actual del agua para compensación (opcional)
   * @return TDS en ppm
   */
  float readTDS(float temperature = 25.0) {
    float voltage = readVoltage();
    
    // Convertir voltaje a TDS
    // Rango típico: 0-3.3V corresponde a 0-5000 ppm
    float tds = (voltage / ADC_REFERENCE_VOLTAGE / 1000) * 5000 * calibrationFactor;
    
    // Compensación de temperatura (0.02 por °C)
    // Fórmula: TDScompensada = TDS25 / (1 + k(T - 25))
    if (temperature != referenceTemperature) {
      float tempFactor = 1.0 + temperatureCompensation * (temperature - referenceTemperature);
      tds = tds / tempFactor;
    }
    
    // Limitar a rango válido
    if (tds < 0) tds = 0;
    if (tds > 5000) tds = 5000;
    
    return tds;
  }

  /**
   * Calibrar sensor usando una solución estándar
   * @param measuredTDS TDS de la solución estándar (ej: 500 ppm)
   */
  void calibrate(float measuredTDS) {
    float voltage = readVoltage();
    
    // Calcular factor de calibración
    float theoreticalVoltage = (measuredTDS / 5000) * ADC_REFERENCE_VOLTAGE * 1000;
    
    calibrationFactor = theoreticalVoltage / voltage;
    
    Serial.print("[TDS_SENSOR] Calibración completada. Factor: ");
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
   * Interpretar calidad del agua según TDS
   * @return String con descripción
   */
  String getWaterQuality() {
    float tds = readTDS();
    
    if (tds < 50) return "Excelente (destilada)";
    if (tds < 100) return "Muy buena";
    if (tds < 300) return "Buena";
    if (tds < 500) return "Aceptable";
    if (tds < 1000) return "Pobre";
    return "Muy pobre";
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor está funcionando correctamente
   */
  bool selfTest() {
    float voltage = readVoltage();
    float tds = readTDS();
    
    Serial.print("[TDS_SENSOR] Voltaje: ");
    Serial.print(voltage, 1);
    Serial.print(" mV, TDS: ");
    Serial.print(tds, 2);
    Serial.println(" ppm");
    
    // Aceptable si el voltaje está entre 200-3000 mV
    return (voltage > 200 && voltage < 3000);
  }

  /**
   * Convertir TDS a conductividad aproximada (µS/cm)
   * Relación aproximada: EC (µS/cm) ≈ TDS (ppm) × 1.56
   * @param tds Valor de TDS en ppm
   * @return Conductividad aproximada en µS/cm
   */
  static float tdsToEC(float tds) {
    return tds * 1.56;
  }

  /**
   * Obtener la concentración mínima de impurezas según TDS
   * @return Calidad interpretada del agua
   */
  String getQualityStatus() {
    float tds = readTDS();
    
    if (tds < TDS_MIN_THRESHOLD) return "BAJO";
    if (tds > TDS_MAX_THRESHOLD) return "ALTO";
    return "NORMAL";
  }
};

#endif // TDS_SENSOR_H
