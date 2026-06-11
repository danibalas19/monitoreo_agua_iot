/**
 * @file dataFormatter.h
 * @brief Funciones para formatear datos para envío y almacenamiento
 * @author Daniel Balasnoa
 * @version 1.0.0
 */

#ifndef DATA_FORMATTER_H
#define DATA_FORMATTER_H

#include <Arduino.h>
#include <ArduinoJson.h>

class DataFormatter {
public:
  /**
   * Formatear estructura de lectura a JSON
   * @param reading Lectura de sensores
   * @return String con JSON formateado
   */
  static String formatSensorReadingJSON(const SensorReading& reading) {
    DynamicJsonDocument doc(512);
    
    doc["dispositivo_id"] = DISPOSITIVO_ID;
    doc["jaguey_id"] = JAGUEY_ID;
    doc["timestamp"] = reading.timestamp;
    doc["sensores"]["pH"] = serialized(String(reading.ph, 2));
    doc["sensores"]["tds"] = serialized(String(reading.tds, 2));
    doc["sensores"]["turbidez"] = serialized(String(reading.turbidity, 2));
    doc["sensores"]["temperatura"] = serialized(String(reading.temperature, 2));
    doc["sensores"]["nivel_cm"] = serialized(String(reading.level, 2));
    doc["sensores"]["nivel_porcento"] = serialized(String(reading.levelPercentage, 1));
    doc["valido"] = reading.valid;
    
    String json;
    serializeJson(doc, json);
    return json;
  }

  /**
   * Formatear para almacenamiento en SPIFFS
   * @param reading Lectura de sensores
   * @return String con datos formateados
   */
  static String formatForStorage(const SensorReading& reading) {
    DynamicJsonDocument doc(512);
    
    doc["ts"] = reading.timestamp;
    doc["ph"] = serialized(String(reading.ph, 2));
    doc["tds"] = serialized(String(reading.tds, 2));
    doc["turbidez"] = serialized(String(reading.turbidity, 2));
    doc["temp"] = serialized(String(reading.temperature, 2));
    doc["nivel_cm"] = serialized(String(reading.level, 2));
    doc["nivel_pct"] = serialized(String(reading.levelPercentage, 1));
    
    String json;
    serializeJson(doc, json);
    return json;
  }

  /**
   * Convertir timestamp a string legible
   * @param timestamp Millisegundos desde inicio
   * @return String con formato HH:MM:SS
   */
  static String formatTime(unsigned long timestamp) {
    unsigned long seconds = timestamp / 1000;
    unsigned int hours = (seconds / 3600) % 24;
    unsigned int minutes = (seconds / 60) % 60;
    unsigned int secs = seconds % 60;
    
    char buffer[9];
    sprintf(buffer, "%02d:%02d:%02d", hours, minutes, secs);
    return String(buffer);
  }

  /**
   * Validar rango de pH
   * @param ph Valor de pH a validar
   * @return String con estado
   */
  static String getpHStatus(float ph) {
    if (ph < PH_MIN_THRESHOLD) return "BAJO";
    if (ph > PH_MAX_THRESHOLD) return "ALTO";
    return "NORMAL";
  }

  /**
   * Validar rango de TDS
   * @param tds Valor de TDS a validar
   * @return String con estado
   */
  static String getTDSStatus(float tds) {
    if (tds < TDS_MIN_THRESHOLD) return "BAJO";
    if (tds > TDS_MAX_THRESHOLD) return "ALTO";
    return "NORMAL";
  }

  /**
   * Validar rango de turbidez
   * @param turbidity Valor de turbidez a validar
   * @return String con estado
   */
  static String getTurbidityStatus(float turbidity) {
    if (turbidity > TURBIDITY_MAX_THRESHOLD) return "ALTO";
    return "NORMAL";
  }

  /**
   * Validar rango de temperatura
   * @param temp Valor de temperatura a validar
   * @return String con estado
   */
  static String getTemperatureStatus(float temp) {
    if (temp < TEMP_MIN_THRESHOLD) return "BAJO";
    if (temp > TEMP_MAX_THRESHOLD) return "ALTO";
    return "NORMAL";
  }

  /**
   * Validar rango de nivel (en cm)
   * @param level Valor de nivel en centímetros
   * @return String con estado
   */
  static String getLevelStatus(float level) {
    if (level < LEVEL_MIN_THRESHOLD_CM) return "BAJO";
    if (level > LEVEL_MAX_THRESHOLD_CM) return "ALTO";
    return "NORMAL";
  }

  /**
   * Interpretación de nivel por porcentaje
   * @param percentage Porcentaje de llenado (0-100%)
   * @return Descripción del nivel
   */
  static String getLevelPercentageDescription(float percentage) {
    if (percentage < 20) return "MUY BAJO";
    if (percentage < 40) return "BAJO";
    if (percentage < 60) return "NORMAL";
    if (percentage < 80) return "ALTO";
    return "MUY ALTO";
  }

  /**
   * Generar reporte en formato CSV
   * @param reading Lectura de sensores
   * @return String en formato CSV
   */
  static String formatAsCSV(const SensorReading& reading) {
    String csv = "";
    csv += String(reading.timestamp) + ",";
    csv += String(reading.ph, 2) + ",";
    csv += String(reading.tds, 2) + ",";
    csv += String(reading.turbidity, 2) + ",";
    csv += String(reading.temperature, 2) + ",";
    csv += String(reading.level, 2) + ",";
    csv += String(reading.levelPercentage, 1);
    return csv;
  }

  /**
   * Obtener encabezados CSV
   * @return String con encabezados
   */
  static String getCSVHeaders() {
    return "timestamp,pH,TDS(ppm),Turbidez(NTU),Temperatura(°C),Nivel(cm),Nivel(%)";
  }

  /**
   * Calcular promedio de múltiples lecturas
   * @param readings Array de lecturas
   * @param count Número de lecturas
   * @return Lectura promediada
   */
  static SensorReading calculateAverage(const SensorReading* readings, int count) {
    SensorReading average;
    memset(&average, 0, sizeof(SensorReading));

    if (count <= 0) return average;

    for (int i = 0; i < count; i++) {
      average.ph += readings[i].ph;
      average.ec += readings[i].ec;
      average.turbidity += readings[i].turbidity;
      average.temperature += readings[i].temperature;
      average.level += readings[i].level;
    }

    average.ph /= count;
    average.ec /= count;
    average.turbidity /= count;
    average.temperature /= count;
    average.level /= count;
    average.timestamp = millis();
    average.valid = true;

    return average;
  }

  /**
   * Crear reporte completo en JSON
   */
  static String createFullReport(const SensorReading& reading, const String& status) {
    DynamicJsonDocument doc(768);
    
    doc["reporte"]["dispositivo_id"] = DISPOSITIVO_ID;
    doc["reporte"]["dispositivo_codigo"] = DISPOSITIVO_CODIGO;
    doc["reporte"]["jaguey_id"] = JAGUEY_ID;
    doc["reporte"]["timestamp"] = reading.timestamp;
    doc["reporte"]["fecha"] = formatTime(reading.timestamp);
    
    doc["reporte"]["sensores"]["pH"]["valor"] = serialized(String(reading.ph, 2));
    doc["reporte"]["sensores"]["pH"]["estado"] = getpHStatus(reading.ph);
    doc["reporte"]["sensores"]["pH"]["unidad"] = "unidades";
    
    doc["reporte"]["sensores"]["tds"]["valor"] = serialized(String(reading.tds, 2));
    doc["reporte"]["sensores"]["tds"]["estado"] = getTDSStatus(reading.tds);
    doc["reporte"]["sensores"]["tds"]["unidad"] = "ppm";
    
    doc["reporte"]["sensores"]["turbidez"]["valor"] = serialized(String(reading.turbidity, 2));
    doc["reporte"]["sensores"]["turbidez"]["estado"] = getTurbidityStatus(reading.turbidity);
    doc["reporte"]["sensores"]["turbidez"]["unidad"] = "NTU";
    
    doc["reporte"]["sensores"]["temperatura"]["valor"] = serialized(String(reading.temperature, 2));
    doc["reporte"]["sensores"]["temperatura"]["estado"] = getTemperatureStatus(reading.temperature);
    doc["reporte"]["sensores"]["temperatura"]["unidad"] = "°C";
    
    doc["reporte"]["sensores"]["nivel"]["valor"] = serialized(String(reading.level, 2));
    doc["reporte"]["sensores"]["nivel"]["estado"] = getLevelStatus(reading.level);
    doc["reporte"]["sensores"]["nivel"]["porcentaje"] = serialized(String(reading.levelPercentage, 1));
    doc["reporte"]["sensores"]["nivel"]["unidad"] = "centímetros";
    doc["reporte"]["sensores"]["nivel"]["interpretacion"] = getLevelPercentageDescription(reading.levelPercentage);
    
    doc["reporte"]["estado_general"] = status;
    doc["reporte"]["lectura_valida"] = reading.valid;
    
    String json;
    serializeJson(doc, json);
    return json;
  }
};

#endif // DATA_FORMATTER_H
