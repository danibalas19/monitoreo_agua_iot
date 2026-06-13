/**
 * @file APIClient.h
 * @brief Cliente REST para comunicarse con el API del backend
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Se comunica con el backend mediante HTTP/REST
 * Envía lecturas de sensores y recibe comandos remotos
 */

#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "../config/credentials.h"
#include "../config/hardware.h"
#include "../sensors/SensorController.h"

class APIClient {
private:
  String jwtToken;
  unsigned long lastSyncTime;
  bool _isAuthenticated;

  /**
   * Realizar petición POST para autenticación
   * @return true si se obtuvo el token
   */
  bool authenticate() {
    HTTPClient http;
    http.setReuse(false);
    String url = String(API_BASE_URL) + "/usuarios/auth/login";
    
    DynamicJsonDocument doc(256);
    doc["email"] = API_USERNAME;
    doc["password"] = API_PASSWORD;
    
    String payload;
    serializeJson(doc, payload);
    
    Serial.println("[API] Autenticando con el backend...");
    
    if (!http.begin(url)) {
      Serial.println("[API] Error al inicializar HTTP");
      return false;
    }
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Connection", "close");
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode == 200) {
      String response = http.getString();
      
      DynamicJsonDocument responseDoc(1024); // Aumentado para soportar el JWT completo y objeto usuario
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (error) {
        Serial.print("[API] Error al parsear respuesta: ");
        Serial.println(error.c_str());
        http.end();
        return false;
      }
      
      if (responseDoc["success"] && responseDoc["data"]["token"]) {
        jwtToken = responseDoc["data"]["token"].as<String>();
        _isAuthenticated = true;
        Serial.println("[API] ✓ Autenticación exitosa");
        http.end();
        return true;
      }
    } else {
      Serial.print("[API] Error de autenticación. Código: ");
      Serial.println(httpResponseCode);
      String authError = http.getString();
      Serial.println("[API] Detalle del error de auth: " + authError);
    }
    
    http.end();
    return false;
  }

public:
  APIClient()
    : lastSyncTime(0),
      _isAuthenticated(false) {
  }

  /**
   * Inicializar cliente API
   * @return true si se autenticó exitosamente
   */
  bool begin() {
    Serial.println("[API] Inicializando cliente API...");
    return authenticate();
  }

  /**
   * Enviar lectura de sensores al backend
   * @param reading Estructura con todas las lecturas
   * @return true si se envió exitosamente
   */
  bool sendSensorReading(const SensorReading& reading) {
    if (!_isAuthenticated) {
      Serial.println("[API] No autenticado. Intentando autenticar...");
      if (!authenticate()) {
        return false;
      }
    }

    String url = String(API_BASE_URL) + API_ENDPOINT_LECTURAS;
    
    Serial.print("[API] URL de destino: ");
    Serial.println(url);
    
    DynamicJsonDocument doc(2048); // Aumentado a 2048 bytes para asegurar que no se corte el JSON
    doc["dispositivo_id"] = DISPOSITIVO_ID;
    doc["jaguey_id"] = JAGUEY_ID;
    
    // Crear array de lecturas (una por sensor)
    JsonArray lecturas = doc.createNestedArray("lecturas");
    
    // Lectura de pH (PH_EN)
    JsonObject phReading = lecturas.createNestedObject();
    phReading["dispositivo_id"] = DISPOSITIVO_ID;
    phReading["sensor_id"] = 10;
    phReading["tipo_variable_id"] = 3;  // pH
    phReading["valor"] = String(reading.ph, 2);
    phReading["unidad"] = "pH";
    phReading["estado"] = "normal";
    phReading["origen"] = "AUTOMATICA";
    
  

    // Lectura de TDS (sensor de conductividad/TDS)
    JsonObject tdsReading = lecturas.createNestedObject();
    tdsReading["dispositivo_id"] = DISPOSITIVO_ID;
    tdsReading["sensor_id"] = 8;         // ID 8 = TDS Meter v1.0 en BD
    tdsReading["tipo_variable_id"] = 4;  // VERIFICAR ESTE ID EN MYSQL (Tabla tipo_variable)
    tdsReading["valor"] = String(reading.tds, 2);
    tdsReading["unidad"] = "ppm";
    tdsReading["estado"] = "normal";
    tdsReading["origen"] = "AUTOMATICA";
    
    // Lectura de turbidez (TURBIDEZ2)
    JsonObject turbidityReading = lecturas.createNestedObject();
    turbidityReading["dispositivo_id"] = DISPOSITIVO_ID;
    turbidityReading["sensor_id"] = 9;         // ID 9 = Turbidez Module en BD
    turbidityReading["tipo_variable_id"] = 6;  // ID 6 = Turbidez en tu BD MySQL
    turbidityReading["valor"] = String(reading.turbidity, 2);
    turbidityReading["unidad"] = "NTU";
    turbidityReading["estado"] = "normal";
    turbidityReading["origen"] = "AUTOMATICA";
    
    // Lectura de temperatura (TEMPERATURA DS18B20)
    JsonObject tempReading = lecturas.createNestedObject();
    tempReading["dispositivo_id"] = DISPOSITIVO_ID;
    tempReading["sensor_id"] = 7;         // ID 7 = SEN0161 (Temperatura) en BD
    tempReading["tipo_variable_id"] = 2;  // VERIFICAR ESTE ID EN MYSQL (Tabla tipo_variable)
    tempReading["valor"] = String(reading.temperature, 2);
    tempReading["unidad"] = "°C";
    tempReading["estado"] = "normal";
    tempReading["origen"] = "AUTOMATICA";
    
    /* === SENSORES DESCONECTADOS TEMPORALMENTE ===
    // Lectura de nivel/distancia (ULTRASONICO HC-SR04)
    JsonObject levelReading = lecturas.createNestedObject();
    levelReading["dispositivo_id"] = DISPOSITIVO_ID;
    levelReading["sensor_id"] = 5;
    levelReading["tipo_variable_id"] = 1;  // Nivel
    levelReading["valor"] = String(reading.levelPercentage, 1);
    levelReading["unidad"] = "%";
    levelReading["estado"] = "normal";
    levelReading["origen"] = "AUTOMATICA";
    */
    
    String payload;
    serializeJson(doc, payload);
    
    Serial.println("[API] JSON generado a enviar:");
    Serial.println(payload);
    
    HTTPClient http;
    http.setReuse(false);
    
    if (!http.begin(url)) {
      Serial.println("[API] Error al inicializar HTTP");
      return false;
    }
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + jwtToken);
    http.addHeader("Connection", "close");
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.print("[API] ✓ Lectura enviada exitosamente (");
      Serial.print(payload.length());
      Serial.println(" bytes)");
      http.end();
      lastSyncTime = millis();
      return true;
    } else {
      Serial.print("[API] Error al enviar lectura. Código: ");
      Serial.println(httpResponseCode);
      String errorResponse = http.getString();
      Serial.println("[API] Motivo del rechazo: " + errorResponse);
      if (httpResponseCode == 401) {
        _isAuthenticated = false;  // Token expiró
      }
    }
    
    http.end();
    return false;
  }

  /**
   * Enviar comando de actuador al backend
   * @param actuadorId ID del actuador
   * @param estado Estado del actuador (1=ON, 0=OFF)
   * @return true si se envió exitosamente
   */
  bool sendActuatorCommand(int actuadorId, int estado) {
    if (!_isAuthenticated) {
      return false;
    }

    String url = String(API_BASE_URL) + API_ENDPOINT_COMANDOS;
    
    DynamicJsonDocument doc(256);
    doc["dispositivo_id"] = DISPOSITIVO_ID;
    doc["actuador_id"] = actuadorId;
    doc["comando"] = estado ? "ACTIVAR" : "DESACTIVAR";
    doc["descripcion"] = "Comando enviado desde dispositivo IoT";
    
    String payload;
    serializeJson(doc, payload);
    
    HTTPClient http;
    http.setReuse(false);
    
    if (!http.begin(url)) {
      return false;
    }
    
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + jwtToken);
    http.addHeader("Connection", "close");
    
    int httpResponseCode = http.POST(payload);
    
    bool success = (httpResponseCode == 201 || httpResponseCode == 200);
    
    if (success) {
      Serial.print("[API] ✓ Comando de actuador enviado");
    } else {
      Serial.print("[API] Error al enviar comando. Código: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == 401) {
        _isAuthenticated = false;
      }
    }
    
    http.end();
    return success;
  }

  /**
   * Obtener comandos pendientes del backend
   * @param jsonResponse Referencia a string para almacenar respuesta
   * @return true si se obtuvieron comandos
   */
  bool getRemoteCommands(String& jsonResponse) {
    if (!_isAuthenticated) {
      return false;
    }

    String url = String(API_BASE_URL) + API_ENDPOINT_COMANDOS + 
                 "?dispositivo_id=" + String(DISPOSITIVO_ID);
    
    HTTPClient http;
    http.setReuse(false);
    
    if (!http.begin(url)) {
      return false;
    }
    
    http.addHeader("Authorization", "Bearer " + jwtToken);
    http.addHeader("Connection", "close");
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      jsonResponse = http.getString();
      Serial.println("[API] ✓ Comandos obtenidos del backend");
      http.end();
      return true;
    } else {
      Serial.print("[API] Error al obtener comandos. Código: ");
      Serial.println(httpResponseCode);
      if (httpResponseCode == 401) {
        _isAuthenticated = false;
      }
    }
    
    http.end();
    return false;
  }

  /**
   * Obtener configuración del dispositivo
   * @param jsonResponse Referencia a string para almacenar respuesta
   * @return true si se obtuvo la configuración
   */
  bool getDeviceConfig(String& jsonResponse) {
    if (!_isAuthenticated) {
      return false;
    }

    String url = String(API_BASE_URL) + "/dispositivos/" + String(DISPOSITIVO_ID);
    
    HTTPClient http;
    http.setReuse(false);
    
    if (!http.begin(url)) {
      return false;
    }
    
    http.addHeader("Authorization", "Bearer " + jwtToken);
    http.addHeader("Connection", "close");
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      jsonResponse = http.getString();
      Serial.println("[API] ✓ Configuración obtenida");
      http.end();
      return true;
    } else {
      Serial.print("[API] Error al obtener configuración. Código: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
    return false;
  }

  /**
   * Obtener estado de autenticación
   * @return true si está autenticado
   */
  bool isAuthenticated() {
    return _isAuthenticated;
  }

  /**
   * Obtener token JWT actual
   * @return Token JWT
   */
  String getToken() {
    return jwtToken;
  }

  /**
   * Manejar reconexión automática (llamar en el loop)
   */
  void handle() {
    // Si ha pasado mucho tiempo sin sincronizar y no está autenticado
    if (!_isAuthenticated && (millis() - lastSyncTime > 60000)) {
      authenticate();
    }
  }
};

#endif // API_CLIENT_H
