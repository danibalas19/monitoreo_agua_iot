/**
 * @file MQTTManager.h
 * @brief Gestor de conexión y comunicación MQTT
 * @author Daniel Balasnoa
 * @version 1.0.0
 * 
 * Se conecta a un broker MQTT (Mosquitto) y publica/suscribe a tópicos
 * para comunicación en tiempo real con el backend
 */

#ifndef MQTT_MANAGER_H
#define MQTT_MANAGER_H

#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include "../config/credentials.h"
#include "../config/hardware.h"

// Callback function types
typedef void (*OnMessageCallback)(char* topic, byte* payload, unsigned int length);

class MQTTManager {
private:
  WiFiClient wifiClient;
  PubSubClient client;
  
  String clientId;
  unsigned long lastReconnectAttempt;
  int reconnectAttempts;
  bool isConnected;
  OnMessageCallback messageCallback;

  /**
   * Reconectar al broker MQTT
   * @return true si se conectó exitosamente
   */
  bool reconnect() {
    Serial.print("[MQTT] Intentando conectar al broker MQTT (");
    Serial.print(reconnectAttempts + 1);
    Serial.println(")...");

    // Crear ClientID único
    String id = String(MQTT_CLIENT_ID) + "-" + String(ESP.getEfuseMac(), HEX);

    if (client.connect(id.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("[MQTT] ✓ Conectado al broker MQTT");
      
      // Suscribirse a tópicos de comando
      subscribe(MQTT_TOPIC_COMMANDS);
      
      // Publicar estado de conexión
      publishStatus("conectado");
      
      isConnected = true;
      reconnectAttempts = 0;
      return true;
    }

    int state = client.state();
    Serial.print("[MQTT] Error al conectar. Código: ");
    Serial.print(state);
    Serial.print(" - ");
    printConnectionError(state);
    Serial.println();

    reconnectAttempts++;
    return false;
  }

  /**
   * Decodificar y mostrar código de error MQTT
   */
  void printConnectionError(int state) {
    switch (state) {
      case -4: Serial.print("Fallo CONNECT_TIMEOUT"); break;
      case -3: Serial.print("Fallo CONNECT_LOST"); break;
      case -2: Serial.print("Fallo CONNECT_FAILED"); break;
      case -1: Serial.print("Desconectado"); break;
      case 0: Serial.print("Conectado"); break;
      case 1: Serial.print("Protocolo incorrecto"); break;
      case 2: Serial.print("ID cliente rechazado"); break;
      case 3: Serial.print("Servidor no disponible"); break;
      case 4: Serial.print("Usuario/contraseña incorrecto"); break;
      case 5: Serial.print("No autorizado"); break;
      default: Serial.print("Error desconocido");
    }
  }

public:
  /**
   * Constructor
   * @param _ssid SSID de WiFi
   * @param _password Contraseña de WiFi
   */
  MQTTManager()
    : client(wifiClient),
      clientId(MQTT_CLIENT_ID),
      lastReconnectAttempt(0),
      reconnectAttempts(0),
      isConnected(false),
      messageCallback(nullptr) {
    
    // Configurar servidor MQTT
    client.setServer(MQTT_BROKER, MQTT_PORT);
    client.setCallback([this](char* topic, byte* payload, unsigned int length) {
      if (messageCallback) {
        messageCallback(topic, payload, length);
      }
    });
  }

  /**
   * Inicializar y conectar a MQTT
   * @return true si se conectó exitosamente
   */
  bool begin() {
    Serial.println("[MQTT] Inicializando MQTT Manager...");
    
    // Esperar a que WiFi esté conectado
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[MQTT] WiFi no conectado. Esperando...");
      return false;
    }

    // Intentar conectar
    lastReconnectAttempt = millis();
    return reconnect();
  }

  /**
   * Manejar conexión (debe llamarse en el loop)
   * Reconecta automáticamente si se desconecta
   */
  void handle() {
    if (!client.connected()) {
      unsigned long now = millis();
      
      // Reintentar conexión cada MQTT_CONNECT_TIMEOUT ms
      if (now - lastReconnectAttempt > MQTT_CONNECT_TIMEOUT) {
        lastReconnectAttempt = now;
        if (reconnect()) {
          isConnected = true;
        }
      }
    } else {
      isConnected = true;
      // Mantener conexión activa
      client.loop();
    }
  }

  /**
   * Publicar un mensaje en un tópico
   * @param topic Tópico MQTT
   * @param payload Datos a enviar
   * @param retain true para retener mensaje en broker
   * @return true si se publicó exitosamente
   */
  bool publish(const char* topic, const char* payload, boolean retain = false) {
    if (!isConnected) {
      Serial.print("[MQTT] No conectado. No se puede publicar en ");
      Serial.println(topic);
      return false;
    }

    if (client.publish(topic, payload, retain)) {
      Serial.print("[MQTT] Publicado en ");
      Serial.print(topic);
      Serial.print(": ");
      Serial.println(payload);
      return true;
    } else {
      Serial.print("[MQTT] Error al publicar en ");
      Serial.println(topic);
      return false;
    }
  }

  /**
   * Publicar un mensaje numérico
   * @param topic Tópico MQTT
   * @param value Valor numérico
   * @param decimals Decimales a mostrar
   * @param retain true para retener mensaje
   * @return true si se publicó exitosamente
   */
  bool publishNumeric(const char* topic, float value, uint8_t decimals = 2, boolean retain = false) {
    String payload = String(value, (unsigned int)decimals);
    return publish(topic, payload.c_str(), retain);
  }

  /**
   * Publicar un JSON
   * @param topic Tópico MQTT
   * @param jsonPayload JSON como string
   * @param retain true para retener mensaje
   * @return true si se publicó exitosamente
   */
  bool publishJSON(const char* topic, const String& jsonPayload, boolean retain = false) {
    return publish(topic, jsonPayload.c_str(), retain);
  }

  /**
   * Suscribirse a un tópico
   * @param topic Tópico MQTT
   * @return true si se suscribió exitosamente
   */
  bool subscribe(const char* topic) {
    if (!isConnected) {
      Serial.print("[MQTT] No conectado. No se puede suscribir a ");
      Serial.println(topic);
      return false;
    }

    if (client.subscribe(topic)) {
      Serial.print("[MQTT] Suscrito a ");
      Serial.println(topic);
      return true;
    } else {
      Serial.print("[MQTT] Error al suscribirse a ");
      Serial.println(topic);
      return false;
    }
  }

  /**
   * Desuscribirse de un tópico
   * @param topic Tópico MQTT
   * @return true si se desinscribió exitosamente
   */
  bool unsubscribe(const char* topic) {
    if (client.unsubscribe(topic)) {
      Serial.print("[MQTT] Desuscrito de ");
      Serial.println(topic);
      return true;
    }
    return false;
  }

  /**
   * Registrar callback para mensajes MQTT
   * @param callback Función callback
   */
  void onMessage(OnMessageCallback callback) {
    messageCallback = callback;
  }

  /**
   * Publicar estado del dispositivo
   * @param status Estado (conectado, desconectado, error, etc.)
   */
  void publishStatus(const String& status) {
    String json = "{";
    json += "\"dispositivo_id\":" + String(DISPOSITIVO_ID) + ",";
    json += "\"codigo\":\"" + String(DISPOSITIVO_CODIGO) + "\",";
    json += "\"status\":\"" + status + "\",";
    json += "\"timestamp\":" + String(millis());
    json += "}";
    
    publish(MQTT_TOPIC_STATUS, json.c_str(), true);
  }

  /**
   * Obtener estado de conexión
   * @return true si está conectado
   */
  bool isConnectedToBroker() {
    return isConnected && client.connected();
  }

  /**
   * Obtener número de intentos de reconexión fallidos
   * @return Número de intentos
   */
  int getReconnectAttempts() {
    return reconnectAttempts;
  }

  /**
   * Desconectar del broker
   */
  void disconnect() {
    if (isConnected) {
      client.disconnect();
      isConnected = false;
      Serial.println("[MQTT] Desconectado del broker MQTT");
    }
  }
};

#endif // MQTT_MANAGER_H
