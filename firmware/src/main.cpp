#include <Arduino.h>


#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Headers del firmware
#include "config/hardware.h"
#include "config/credentials.h"
#include "sensors/SensorController.h"
#include "mqtt/MQTTManager.h"
#include "api/APIClient.h"
#include "utils/logger.h"
#include "utils/dataFormatter.h"

// ============================================
// VARIABLES GLOBALES
// ============================================
Logger logger;
SensorController sensorController;
MQTTManager mqttManager;
APIClient apiClient;
WebServer webServer(80);
LiquidCrystal_I2C lcd(LCD_ADDRESS, LCD_COLUMNS, LCD_ROWS);

// Timers
unsigned long lastSensorReadTime = 0;
unsigned long lastMQTTPublishTime = 0;
unsigned long lastAPISyncTime = 0;
unsigned long lastWatchdogTime = 0;

// Buffer de lecturas para almacenamiento
SensorReading lastReading;
int readingCount = 0;

// Estados
bool wifiConnected = false;
bool mqttConnected = false;
bool apiAuthenticated = false;
bool systemHealthy = true;

// ============================================
// PROTOTIPOS DE FUNCIONES (Requerido en C++)
// ============================================
void processMQTTCommand(String command);
void readAndPublishSensors();
void activateRelay(int relayNum);
void deactivateRelay(int relayNum);

// ============================================
// FUNCIONES DE WIFI
// ============================================
void setupWiFi() {
  logger.info("Inicializando WiFi...");
  Serial.print("[WiFi] Conectando a SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < WIFI_MAX_ATTEMPTS) {
    delay(WIFI_RETRY_DELAY / WIFI_MAX_ATTEMPTS);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    logger.info("✓ Conectado a WiFi");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Señal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    wifiConnected = true;
  } else {
    logger.error("✗ No se pudo conectar a WiFi");
    wifiConnected = false;
  }
}

// ============================================
// FUNCIONES DE SENSOR
// ============================================
void setupSensors() {
  logger.info("Inicializando sensores...");
  
  if (sensorController.begin()) {
    logger.info("✓ Sensores inicializados");
    
    // Realizar prueba de autodiagnóstico
    delay(1000);
    Serial.println("[SENSORS] Iniciando autodiagnóstico...");
  } else {
    logger.error("✗ Error al inicializar sensores");
    systemHealthy = false;
  }
}

// ============================================
// FUNCIONES DE MQTT
// ============================================
void onMQTTMessage(char* topic, byte* payload, unsigned int length) {
  Serial.print("[MQTT] Mensaje recibido en: ");
  Serial.println(topic);
  
  // Convertir payload a string
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("[MQTT] Contenido: ");
  Serial.println(message);

  // Procesar comandos
  if (String(topic) == MQTT_TOPIC_COMMANDS) {
    processMQTTCommand(message);
  }
}

void processMQTTCommand(String command) {
  DynamicJsonDocument doc(256);
  DeserializationError error = deserializeJson(doc, command);

  if (error) {
    logger.error("Error al parsear comando MQTT");
    return;
  }

  // Ejemplos de comandos:
  // {"comando":"ACTUALIZAR_LECTURAS"}
  // {"comando":"ACTIVAR_RELÉ","relé":1}
  // {"comando":"CALIBRAR_PH","valor":7.0}
  // {"comando":"REBOOT"}

  if (doc.containsKey("comando")) {
    String cmd = doc["comando"];
    
    if (cmd == "ACTUALIZAR_LECTURAS") {
      readAndPublishSensors();
    } 
    else if (cmd == "ACTIVAR_RELÉ") {
      int relayNum = doc["relé"] | 1;
      activateRelay(relayNum);
    } 
    else if (cmd == "DESACTIVAR_RELÉ") {
      int relayNum = doc["relé"] | 1;
      deactivateRelay(relayNum);
    } 
    else if (cmd == "CALIBRAR_PH") {
      float value = doc["valor"] | 7.0;
      sensorController.calibratePH(value);
    } 
    else if (cmd == "CALIBRAR_TURBIDEZ") {
      float value = doc["valor"] | 0.0;
      sensorController.calibrateTurbidity(value);
    }
    else if (cmd == "CALIBRAR_TDS") {
      float value = doc["valor"] | 500.0;
      sensorController.calibrateTDS(value);
    }
    else if (cmd == "REBOOT") {
      logger.warning("Reboot solicitado");
      delay(1000);
      ESP.restart();
    }
  }
}

void setupMQTT() {
  logger.info("Inicializando MQTT...");
  
  if (wifiConnected) {
    mqttManager.onMessage(onMQTTMessage);
    if (mqttManager.begin()) {
      logger.info("✓ MQTT inicializado");
      mqttConnected = true;
    } else {
      logger.warning("⚠ No se pudo conectar a MQTT");
      mqttConnected = false;
    }
  }
}

// ============================================
// FUNCIONES DE PANTALLA LCD
// ============================================
void updateDisplay(const SensorReading& reading) {
  lcd.clear();
  
  // Fila 1: pH y TDS
  lcd.setCursor(0, 0);
  lcd.print("pH:"); lcd.print(reading.ph, 1);
  lcd.print(" TDS:"); lcd.print(reading.tds, 0);
  
  // Fila 2: Temp y Nivel
  lcd.setCursor(0, 1);
  lcd.print("T:"); lcd.print(reading.temperature, 1);
  lcd.print("C Nvl:"); lcd.print(reading.levelPercentage, 0); lcd.print("%");
  
  #if LCD_ROWS > 2
  // Fila 3 y 4 (Solo se mostrará si configuras la pantalla como 20x4)
  lcd.setCursor(0, 2);
  lcd.print("Turbidez: "); lcd.print(reading.turbidity, 1);
  
  lcd.setCursor(0, 3);
  lcd.print(wifiConnected ? "WIFI:OK " : "WIFI:-- ");
  lcd.print(mqttConnected ? "MQTT:OK" : "MQTT:--");
  #endif
}

// ============================================
// FUNCIONES DE API
// ============================================
void setupAPI() {
  logger.info("Inicializando cliente API...");
  
  if (wifiConnected) {
    if (apiClient.begin()) {
      logger.info("✓ Cliente API autenticado");
      apiAuthenticated = true;
    } else {
      logger.warning("⚠ No se pudo autenticar con API");
      apiAuthenticated = false;
    }
  }
}

// ============================================
// FUNCIONES DE LECTURA Y PUBLICACIÓN
// ============================================
void readAndPublishSensors() {
  // Leer sensores
  lastReading = sensorController.readAllSensors();
  readingCount++;
  
  if (!lastReading.valid) {
    logger.warning("⚠ Lectura inválida");
    return;
  }

  logger.info("✓ Lectura de sensores completada");
  logger.printSensorInfo(lastReading);
  
  // Actualizar la pantalla con los nuevos datos
  updateDisplay(lastReading);

  // Publicar en MQTT
  if (mqttConnected) {
    String json = DataFormatter::formatSensorReadingJSON(lastReading);
    mqttManager.publishJSON(MQTT_TOPIC_SENSORS, json);
    
    // Publicar sensores individuales
    mqttManager.publishNumeric(MQTT_TOPIC_PH, lastReading.ph, 2);
    mqttManager.publishNumeric(MQTT_TOPIC_TDS, lastReading.tds, 2);
    mqttManager.publishNumeric(MQTT_TOPIC_TURBIDITY, lastReading.turbidity, 2);
    mqttManager.publishNumeric(MQTT_TOPIC_TEMP, lastReading.temperature, 2);
    mqttManager.publishNumeric(MQTT_TOPIC_LEVEL, lastReading.level, 2);
    mqttManager.publishNumeric(MQTT_TOPIC_LEVEL_PERCENT, lastReading.levelPercentage, 1);
  }

  // Enviar a API
  if (apiAuthenticated) {
    if (apiClient.sendSensorReading(lastReading)) {
      logger.info("✓ Lectura enviada a API");
    } else {
      logger.warning("⚠ Error al enviar a API");
      apiAuthenticated = false;
    }
  }
}

// ============================================
// FUNCIONES DE ACTUADORES
// ============================================
void activateRelay(int relayNum) {
  int pin = (relayNum == 1) ? PIN_RELAY_1 : PIN_RELAY_2;
  digitalWrite(pin, HIGH);
  Serial.print("[RELAY] Relé ");
  Serial.print(relayNum);
  Serial.println(" ACTIVADO");
}

void deactivateRelay(int relayNum) {
  int pin = (relayNum == 1) ? PIN_RELAY_1 : PIN_RELAY_2;
  digitalWrite(pin, LOW);
  Serial.print("[RELAY] Relé ");
  Serial.print(relayNum);
  Serial.println(" DESACTIVADO");
}

// ============================================
// FUNCIONES DE WEB SERVER (DIAGNOSTICO)
// ============================================
void setupWebServer() {
  // Endpoint de status
  webServer.on("/status", HTTP_GET, []() {
    String json = "{";
    json += "\"dispositivo_id\":" + String(DISPOSITIVO_ID) + ",";
    json += "\"codigo\":\"" + String(DISPOSITIVO_CODIGO) + "\",";
    json += "\"wifi_connected\":" + String(wifiConnected ? "true" : "false") + ",";
    json += "\"mqtt_connected\":" + String(mqttConnected ? "true" : "false") + ",";
    json += "\"api_authenticated\":" + String(apiAuthenticated ? "true" : "false") + ",";
    json += "\"lecturas\":" + String(readingCount) + ",";
    json += "\"uptime\":" + String(millis()) + ",";
    json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
    json += "\"heap_free\":" + String(ESP.getFreeHeap());
    json += "}";
    
    webServer.send(200, "application/json", json);
  });

  // Endpoint de lecturas
  webServer.on("/lecturas", HTTP_GET, []() {
    String json = DataFormatter::formatSensorReadingJSON(lastReading);
    webServer.send(200, "application/json", json);
  });

  // Endpoint para reportes
  webServer.on("/reporte", HTTP_GET, []() {
    String json = DataFormatter::createFullReport(lastReading, 
                   systemHealthy ? "NORMAL" : "ALERTA");
    webServer.send(200, "application/json", json);
  });

  // Endpoint de control de relés
  webServer.on("/relay/1/on", HTTP_POST, []() {
    activateRelay(1);
    webServer.send(200, "text/plain", "Relé 1 activado");
  });

  webServer.on("/relay/1/off", HTTP_POST, []() {
    deactivateRelay(1);
    webServer.send(200, "text/plain", "Relé 1 desactivado");
  });

  webServer.on("/relay/2/on", HTTP_POST, []() {
    activateRelay(2);
    webServer.send(200, "text/plain", "Relé 2 activado");
  });

  webServer.on("/relay/2/off", HTTP_POST, []() {
    deactivateRelay(2);
    webServer.send(200, "text/plain", "Relé 2 desactivado");
  });

  webServer.onNotFound([]() {
    webServer.send(404, "text/plain", "404 Not Found");
  });

  webServer.begin();
  logger.info("✓ Web server iniciado en puerto 80");
}

// ============================================
// FUNCIONES DE SISTEMA
// ============================================
void setupGPIO() {
  // Configurar salidas
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);
  pinMode(PIN_LED_STATUS, OUTPUT);
  
  // Configurar entradas
  pinMode(PIN_BUTTON_CONFIG, INPUT_PULLUP);

  // Estado inicial
  digitalWrite(PIN_RELAY_1, LOW);
  digitalWrite(PIN_RELAY_2, LOW);
  digitalWrite(PIN_LED_STATUS, LOW);
}

void blinkLED(int times = 1, int delayMs = 100) {
  for (int i = 0; i < times; i++) {
    digitalWrite(PIN_LED_STATUS, HIGH);
    delay(delayMs);
    digitalWrite(PIN_LED_STATUS, LOW);
    delay(delayMs);
  }
}

void watchdog() {
  // Verificar salud del sistema
  if (!wifiConnected) {
    logger.warning("⚠ WiFi desconectado");
    systemHealthy = false;
    blinkLED(1, 500);
  } else {
    systemHealthy = true;
  }

  // Mostrar información
  Serial.print("[WATCHDOG] WiFi:");
  Serial.print(wifiConnected ? "✓" : "✗");
  Serial.print(" MQTT:");
  Serial.print(mqttConnected ? "✓" : "✗");
  Serial.print(" API:");
  Serial.print(apiAuthenticated ? "✓" : "✗");
  Serial.print(" Lecturas:");
  Serial.println(readingCount);
}

// ============================================
// SETUP - INICIALIZACIÓN
// ============================================
void setup() {
  // Inicializar serial para debug
  Serial.begin(DEBUG_SERIAL_SPEED);
  delay(2000);

  // Inicializar logger
  logger.begin(LOG_DEBUG);
  logger.printDeviceInfo();

  // Inicializar I2C y Pantalla OLED
  // Inicializar I2C y Pantalla LCD
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(50000); // Bajar la velocidad I2C (50kHz) para evitar caracteres basura
  delay(200);           // Darle tiempo a la pantalla para encender correctamente eléctricamente
  
  // --- INICIO ESCÁNER I2C (DEBUG) ---
  Serial.println("\n[I2C] Escaneando dispositivos I2C...");
  byte error, address;
  int nDevices = 0;
  for(address = 1; address < 127; address++ ) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    if (error == 0) {
      Serial.print("[I2C] ✓ Dispositivo encontrado en direccion 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      nDevices++;
    }
  }
  if (nDevices == 0) {
    Serial.println("[I2C] ✗ No se encontraron dispositivos I2C. ¡Hardware invisible!");
  }
  Serial.println("[I2C] Escaneo completado.\n");
  // --- FIN ESCÁNER I2C ---

  // Inicializar LCD
  lcd.init(); // En pantallas rebeldes o lentas, iniciar dos veces limpia el chip traductor PCF8574
  lcd.init();
  lcd.backlight();
  lcd.clear(); // Limpiar explícitamente cualquier garabato que haya quedado en memoria
  lcd.setCursor(0, 0);
  lcd.print(" INICIANDO SISTEMA..");
  logger.info("✓ Pantalla LCD inicializada");

  // Inicializar SPIFFS
  if (!SPIFFS.begin(true)) {
    logger.error("Error al inicializar SPIFFS");
  } else {
    logger.info("✓ SPIFFS inicializado");
  }

  // Inicializar GPIO
  setupGPIO();
  
  // Inicializar WiFi
  setupWiFi();
  
  // Inicializar sensores
  setupSensors();
  
  // Inicializar MQTT
  setupMQTT();
  
  // Inicializar API
  setupAPI();
  
  // Inicializar Web Server (para diagnóstico)
  setupWebServer();

  logger.info("✓ Sistema inicializado completamente");
  blinkLED(3, 200);
}

// ============================================
// LOOP - BUCLE PRINCIPAL
// ============================================
void loop() {
  unsigned long now = millis();

  // Manejar Web Server
  webServer.handleClient();

  // Reconectar WiFi si es necesario
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    static unsigned long lastWifiRetry = 0;
    if (now - lastWifiRetry >= 10000) { // Intentar reconectar cada 10 segundos
      lastWifiRetry = now;
      setupWiFi();
    }
  } else {
    wifiConnected = true;
  }

  // Manejar MQTT
  if (wifiConnected) {
    mqttManager.handle();
    mqttConnected = mqttManager.isConnectedToBroker();
  }

  // Manejar API
  if (wifiConnected) {
    apiClient.handle();
    apiAuthenticated = apiClient.isAuthenticated();
  }

  // Leer sensores a intervalo regular
  if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL) {
    lastSensorReadTime = now;
    readAndPublishSensors();
  }

  // Watchdog
  if (now - lastWatchdogTime >= WATCHDOG_INTERVAL) {
    lastWatchdogTime = now;
    watchdog();
  }

  // Parpadear LED de estado
  if (systemHealthy) {
    static unsigned long lastBlink = 0;
    if (now - lastBlink >= 5000) {
      lastBlink = now;
      digitalWrite(PIN_LED_STATUS, !digitalRead(PIN_LED_STATUS));
    }
  }

  // Pequeño delay para evitar watchdog del ESP32
  yield();
}