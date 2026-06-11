/**
 * @file Temperature_Sensor.h
 * @brief Controlador para sensor de temperatura DS18B20 (1-Wire)
 * @author Daniel Balasnoa
 * @version 1.0.0
 */

#ifndef TEMPERATURE_SENSOR_H
#define TEMPERATURE_SENSOR_H

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "../config/hardware.h"

class Temperature_Sensor {
private:
  OneWire oneWire;
  DallasTemperature sensors;
  uint8_t pin;
  float calibrationOffset;
  DeviceAddress deviceAddress;
  
public:
  /**
   * Constructor
   * @param _pin Pin donde está conectado el sensor 1-Wire
   */
  Temperature_Sensor(uint8_t _pin) 
    : oneWire(_pin), 
      sensors(&oneWire),
      pin(_pin),
      calibrationOffset(0) {
  }

  /**
   * Inicializar sensor
   * @return true si se encontró el sensor
   */
  bool begin() {
    sensors.begin();
    
    // Buscar sensor de temperatura
    if (!sensors.getAddress(deviceAddress, 0)) {
      Serial.println("[ERROR] Sensor DS18B20 no encontrado");
      return false;
    }
    
    // Configurar resolución (9-12 bits, por defecto 12)
    sensors.setResolution(deviceAddress, 12);
    
    Serial.print("[TEMP_SENSOR] Sensor inicializado en pin ");
    Serial.print(pin);
    Serial.print(" - Dirección: ");
    printAddress(deviceAddress);
    Serial.println();
    
    return true;
  }

  /**
   * Leer valor de temperatura
   * Rango: -55°C a +125°C (resolución 0.0625°C con 12 bits)
   * 
   * @return Temperatura en °C
   */
  float readTemperature() {
    // Solicitar lectura de temperatura
    sensors.requestTemperatures();
    
    // Obtener temperatura del dispositivo
    float tempC = sensors.getTempC(deviceAddress);
    
    // Aplicar offset de calibración
    tempC += calibrationOffset;
    
    return tempC;
  }

  /**
   * Leer temperatura en Fahrenheit
   * @return Temperatura en °F
   */
  float readTemperatureF() {
    sensors.requestTemperatures();
    float tempF = sensors.getTempF(deviceAddress);
    tempF += (calibrationOffset * 9.0 / 5.0);
    return tempF;
  }

  /**
   * Calibrar sensor
   * @param calibrationValue Valor conocido de temperatura
   */
  void calibrate(float calibrationValue) {
    float measuredTemp = readTemperature();
    calibrationOffset = calibrationValue - measuredTemp;
    
    Serial.print("[TEMP_SENSOR] Calibración completada. Offset: ");
    Serial.println(calibrationOffset, 2);
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
   * Obtener resolución actual del sensor
   * @return Bits de resolución (9, 10, 11 o 12)
   */
  uint8_t getResolution() {
    return sensors.getResolution(deviceAddress);
  }

  /**
   * Cambiar resolución del sensor
   * Mayor resolución = mayor tiempo de conversión
   * 9 bits: 0.5°C, ~94 ms
   * 10 bits: 0.25°C, ~188 ms
   * 11 bits: 0.125°C, ~375 ms
   * 12 bits: 0.0625°C, ~750 ms
   * 
   * @param resolution Bits de resolución (9-12)
   */
  void setResolution(uint8_t resolution) {
    if (resolution >= 9 && resolution <= 12) {
      sensors.setResolution(deviceAddress, resolution);
    }
  }

  /**
   * Diagnóstico del sensor
   * @return true si el sensor responde correctamente
   */
  bool selfTest() {
    float temp = readTemperature();
    
    Serial.print("[TEMP_SENSOR] Temperatura: ");
    Serial.print(temp, 2);
    Serial.println(" °C");
    
    // Aceptable si está en rango de temperatura válido
    return (temp > -55.0 && temp < 125.0);
  }

private:
  /**
   * Mostrar dirección 1-Wire del sensor
   * @param deviceAddress Dirección del dispositivo
   */
  void printAddress(DeviceAddress deviceAddress) {
    for (uint8_t i = 0; i < 8; i++) {
      if (deviceAddress[i] < 16) Serial.print("0");
      Serial.print(deviceAddress[i], HEX);
    }
  }
};

#endif // TEMPERATURE_SENSOR_H
