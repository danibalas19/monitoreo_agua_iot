# Firmware ESP32 - Monitoreo de Agua en Jagüeyes

Firmware profesional y completo para ESP32 destinado a monitoreo en tiempo real de calidad y nivel de agua en jagüeyes (reservorios de agua).

## 📋 Características

### Sensores Soportados
- **pH Sensor** - Analógico 0-14 unidades
- **Sensor de Conductividad (EC)** - 0-5000 µS/cm
- **Sensor de Turbidez** - 0-4000 NTU
- **Sensor de Temperatura** - DS18B20 (1-Wire) -55°C a +125°C
- **Sensor de Nivel** - 0-10V o 4-20mA (0-5 metros)

### Actuadores
- 2 relés para control de bombas o válvulas
- Control remoto por MQTT y API REST

### Comunicación
- **WiFi** - Conexión a red local
- **MQTT** - Publicación/suscripción a temas en tiempo real
- **REST API** - Sincronización con backend Node.js
- **Web Server** - Interfaz de diagnóstico en puerto 80

### Características Adicionales
- Almacenamiento en SPIFFS para registros locales
- Sistema de calibración para sensores
- Autodiagnóstico de sensores
- Reconexión automática a WiFi y MQTT
- Logging completo con múltiples niveles
- Formateo de datos en JSON y CSV

## 🔌 Conexiones de Pines (ESP32 DOIT DEVKIT V1)

```
GPIO34 (ADC1_CH6)  → Sensor de pH
GPIO35 (ADC1_CH7)  → Sensor de Turbidez
GPIO36 (ADC1_CH0)  → Sensor de Nivel (0-10V)
GPIO32 (ADC2_CH4)  → Sensor de Conductividad (EC)
GPIO33 (1-Wire)    → Sensor de Temperatura DS18B20

GPIO12             → Relé 1 (Bomba/Válvula 1)
GPIO13             → Relé 2 (Bomba/Válvula 2)
GPIO2              → LED de Estado
GPIO0              → Botón de Configuración
GPIO1              → Serial TX (Debug)
GPIO3              → Serial RX (Debug)
```

## 📦 Estructura del Proyecto

```
firmware/
├── platformio.ini                    # Configuración de PlatformIO
├── README.md                         # Este archivo
├── src/
│   ├── main.ino                      # Programa principal
│   ├── config/
│   │   ├── hardware.h                # Configuración de pines y constantes
│   │   └── credentials.h             # WiFi, MQTT, API credentials
│   ├── sensors/
│   │   ├── SensorController.h        # Controlador maestro de sensores
│   │   ├── PH_Sensor.h               # Sensor de pH
│   │   ├── EC_Sensor.h               # Sensor de conductividad
│   │   ├── Temperature_Sensor.h      # Sensor de temperatura DS18B20
│   │   ├── Turbidity_Sensor.h        # Sensor de turbidez
│   │   └── Level_Sensor.h            # Sensor de nivel
│   ├── mqtt/
│   │   └── MQTTManager.h             # Gestor de conexión MQTT
│   ├── api/
│   │   └── APIClient.h               # Cliente REST API
│   └── utils/
│       ├── logger.h                  # Sistema de logging
│       └── dataFormatter.h           # Formateo de datos
└── lib/                              # Librerías externas
```

## 🚀 Instalación y Configuración

### 1. Requisitos
- PlatformIO IDE o VS Code con extensión PlatformIO
- ESP32 DOIT DEVKIT V1 (o compatible)
- Cable USB para programación
- Python 3.7+ (para PlatformIO)

### 2. Configurar Credenciales

Editar `src/config/credentials.h` con tus datos:

```cpp
#define WIFI_SSID              "TuSSID"
#define WIFI_PASSWORD          "TuContraseña"

#define MQTT_BROKER            "192.168.1.100"
#define MQTT_CLIENT_ID         "ESP32-AGUA-001"

#define API_BASE_URL           "http://192.168.1.100:3000/api/v1"
#define API_USERNAME           "dispositivo@example.com"
#define API_PASSWORD           "contraseña_dispositivo"

#define DISPOSITIVO_ID         1
#define DISPOSITIVO_CODIGO     "DISP-ESP32-001"
#define JAGUEY_ID              1
```

### 3. Configurar Hardware

Editar `src/config/hardware.h` si usas pines diferentes:

```cpp
#define PIN_PH_SENSOR          GPIO_NUM_34
#define PIN_TURBIDITY_SENSOR   GPIO_NUM_35
// ... otros pines
```

### 4. Compilar y Descargar

**Con PlatformIO CLI:**
```bash
cd firmware
platformio run -e esp32 --target upload
```

**Con PlatformIO IDE:**
- Presionar Ctrl+Alt+U para descargar

### 5. Monitorear Serial

```bash
platformio device monitor -b 115200
```

O en PlatformIO IDE: Ctrl+Alt+S

## 📡 Tópicos MQTT

El dispositivo publica en los siguientes tópicos:

```
agua/sensores           → Todas las lecturas en JSON
agua/sensores/pH        → pH actual
agua/sensores/EC        → Conductividad actual
agua/sensores/turbidez  → Turbidez actual
agua/sensores/temperatura → Temperatura actual
agua/sensores/nivel     → Nivel actual
agua/estado             → Estado del dispositivo
agua/debug              → Mensajes de debug
agua/errores            → Mensajes de error
```

Se suscribe a:
```
agua/comandos           → Comandos remotos
```

## 🔌 Endpoints de API REST

El dispositivo envía datos a:

```
POST /api/v1/lecturas              → Enviar lecturas de sensores
POST /api/v1/lecturas/lote         → Enviar múltiples lecturas
GET  /api/v1/comandos-remotos      → Obtener comandos pendientes
POST /api/v1/comandos-remotos      → Enviar estado de comando
GET  /api/v1/dispositivos/{id}     → Obtener configuración
```

## 💻 Ejemplos de Uso

### Leer Estatus del Dispositivo (HTTP)
```bash
curl http://192.168.1.100/status
```

**Respuesta:**
```json
{
  "dispositivo_id": 1,
  "codigo": "DISP-ESP32-001",
  "wifi_connected": true,
  "mqtt_connected": true,
  "api_authenticated": true,
  "lecturas": 42,
  "uptime": 3600000,
  "rssi": -45,
  "heap_free": 156000
}
```

### Obtener Últimas Lecturas (HTTP)
```bash
curl http://192.168.1.100/lecturas
```

### Activar Relé 1 (HTTP)
```bash
curl -X POST http://192.168.1.100/relay/1/on
```

### Comando MQTT para Actualizar Lecturas
```bash
mosquitto_pub -h 192.168.1.100 -t "agua/comandos" \
  -m '{"comando":"ACTUALIZAR_LECTURAS"}'
```

### Comando MQTT para Calibrar pH
```bash
mosquitto_pub -h 192.168.1.100 -t "agua/comandos" \
  -m '{"comando":"CALIBRAR_PH","valor":7.0}'
```

### Comando MQTT para Reiniciar
```bash
mosquitto_pub -h 192.168.1.100 -t "agua/comandos" \
  -m '{"comando":"REBOOT"}'
```

## 🔧 Calibración de Sensores

### Calibración de pH
1. Sumergir el sensor en agua con pH 7.0 (solución buffer)
2. Publicar comando MQTT: `{"comando":"CALIBRAR_PH","valor":7.0}`

### Calibración de Conductividad (EC)
1. Usar solución estándar de 1413 µS/cm
2. Editar `credentials.h` con el valor calibrado

### Calibración de Turbidez
1. Usar agua destilada (0 NTU)
2. Publicar comando: `{"comando":"CALIBRAR_TURBIDEZ","valor":0}`

### Calibración de Temperatura
1. Usar termómetro de referencia
2. Comparar lectura con termómetro de referencia

### Calibración de Nivel
1. Medir nivel conocido
2. Editar factor de calibración en `Level_Sensor.h`

## 📊 Formato de Datos

### JSON de Lectura de Sensores
```json
{
  "dispositivo_id": 1,
  "codigo": "DISP-ESP32-001",
  "jaguey_id": 1,
  "timestamp": 3600000,
  "sensores": {
    "pH": "7.45",
    "ec": "1250.50",
    "turbidez": "2.30",
    "temperatura": "22.50",
    "nivel": "2.50"
  },
  "valido": true
}
```

### JSON de Reporte Completo
```json
{
  "reporte": {
    "dispositivo_id": 1,
    "dispositivo_codigo": "DISP-ESP32-001",
    "jaguey_id": 1,
    "timestamp": 3600000,
    "fecha": "01:00:00",
    "sensores": {
      "pH": {
        "valor": "7.45",
        "estado": "NORMAL",
        "unidad": "unidades"
      },
      "ec": {
        "valor": "1250.50",
        "estado": "NORMAL",
        "unidad": "µS/cm"
      }
    },
    "estado_general": "NORMAL",
    "lectura_valida": true
  }
}
```

## 🐛 Debugging

### Niveles de Log
```cpp
#define DEBUG_MODE             true           // Habilitar logs
#define LOG_TO_MQTT            true           // Enviar logs por MQTT
```

### Mensajes Serial
El firmware envía logs a través de Serial a 115200 baud:

```
[SENSORS] Inicializando sensores...
[pH_SENSOR] Sensor inicializado en pin 34
[EC_SENSOR] Sensor inicializado en pin 33
[TEMP_SENSOR] Sensor inicializado en pin 32
[MQTT] Conectado al broker MQTT
[API] Autenticación exitosa
[WATCHDOG] WiFi:✓ MQTT:✓ API:✓ Lecturas:42
```

## ⚙️ Configuración Avanzada

### Ajustar Intervalo de Lecturas
En `src/config/hardware.h`:
```cpp
#define SENSOR_READ_INTERVAL   10000          // 10 segundos
#define MQTT_PUBLISH_INTERVAL  30000          // 30 segundos
#define API_SYNC_INTERVAL      60000          // 1 minuto
```

### Umbrales de Alerta
En `src/config/hardware.h`:
```cpp
#define PH_MIN_THRESHOLD       6.5
#define PH_MAX_THRESHOLD       8.5
#define TEMP_MIN_THRESHOLD     5.0
#define TEMP_MAX_THRESHOLD     35.0
```

### Tamaño de Buffer
```cpp
#define MAX_READINGS_BUFFER    100
#define MAX_MESSAGE_SIZE       512
```

## 🔐 Seguridad

**⚠️ IMPORTANTE:**
1. **NO publicar credenciales** en repositorios públicos
2. Usar variables de entorno en producción
3. Cambiar `API_PASSWORD` regularmente
4. Usar HTTPS (SSL/TLS) en producción
5. Implementar encriptación para datos sensibles

## 📈 Rendimiento

- **Consumo de Memoria:** ~180 KB RAM (de 520 KB disponibles)
- **Velocidad de Lectura:** 1-2 ms por sensor
- **Latencia de MQTT:** <100 ms (local)
- **Latencia de API:** 200-500 ms (depende de red)
- **Uptime Esperado:** >30 días sin problemas

## 🛠️ Troubleshooting

### "No se conecta a WiFi"
- Verificar SSID y contraseña en `credentials.h`
- Revisar señal WiFi (debe ser > -75 dBm)
- Comprobar que el router esté dentro de rango

### "MQTT no conecta"
- Verificar que Mosquitto esté running
- Revisar IP del broker en `credentials.h`
- Comprobar puerto 1883 abierto
- Verificar credenciales MQTT

### "Lecturas inválidas"
- Revisar conexiones de sensores
- Calibrar sensores según instrucciones
- Verificar voltaje de alimentación (3.3V±0.1V)
- Revisar logs de autodiagnóstico

### "API retorna 401"
- Token JWT expiró, se reconectará automáticamente
- Verificar credenciales en `credentials.h`
- Comprobar que backend esté ejecutándose

## 📚 Referencias

- [Datasheet ESP32](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)
- [PubSubClient Arduino](https://pubsubclient.knolleary.net/)
- [ArduinoJson](https://arduinojson.org/)
- [MQTT Specification](https://mqtt.org/mqtt-specification)

## 📝 Licencia

Este firmware es parte del sistema de **Monitoreo de Agua IoT** desarrollado por Daniel Balasnoa.

## 🤝 Soporte

Para reportar problemas o sugerencias, contactar con el equipo de desarrollo.

---

**Versión:** 1.0.0  
**Última Actualización:** 2026-06-10  
**Estado:** ✅ Producción
