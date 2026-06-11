# Guía de Instalación y Conexión - Firmware ESP32

## 📦 Requisitos

### Hardware Necesario
- **ESP32 DOIT DEVKIT V1** (o compatible)
- **Sensor de pH** - Módulo analógico 0-14
- **Sensor de Conductividad (EC)** - 0-5000 µS/cm
- **Sensor de Turbidez** - Analógico 0-4000 NTU
- **Sensor de Temperatura** - Dallas DS18B20
- **Sensor de Nivel** - 0-10V o 4-20mA
- **2x Relés de 5V** (para actuadores)
- **Resistencias y capacitores** (según especificaciones de sensores)
- **Cable USB** tipo A-B para programación
- **Fuente de alimentación** 5V 2A mínimo
- **Cables de conexión** (Dupont, etc.)

### Software Necesario
- **Visual Studio Code** o **PlatformIO IDE**
- **PlatformIO Extension**
- **Python 3.7+**
- **Git** (opcional)

## 🔧 Instalación de Dependencias

### 1. Instalar Visual Studio Code
- Descargar desde: https://code.visualstudio.com/
- Instalar versión compatible con tu sistema operativo

### 2. Instalar PlatformIO Extension
1. Abrir VS Code
2. Ir a Extensions (Ctrl+Shift+X)
3. Buscar "PlatformIO IDE"
4. Hacer clic en "Install"
5. Recargar VS Code

### 3. Instalar Drivers USB (si es necesario)
Para Windows:
- Descargar: https://github.com/espressif/esp-idf/releases
- O usar Windows Update que detectará automáticamente

Para Mac/Linux:
```bash
# En Mac
brew install libusb

# En Linux Ubuntu/Debian
sudo apt-get install libusb-1.0-0
```

## 🔌 Conexiones de Hardware

### Diagrama de Pines (ESP32 DOIT DEVKIT V1)

```
        ┌─────────────────────────────┐
        │   ESP32 DOIT DEVKIT V1      │
        │                             │
    +3V3├─────────┐                   │
    GND ├─────────┤                   │
        │                             │
Sensor  │ GPIO34  (ADC1_6)  ─ PH      │
análogo │ GPIO35  (ADC1_7)  ─ Turbidez│
        │ GPIO36  (ADC1_0)  ─ Nivel   │
        │ GPIO33  (ADC2_4)  ─ EC      │
        │ GPIO32 (1-Wire)   ─ Temp    │
        │                             │
Actuadores                            │
        │ GPIO12         ─ Relé 1     │
        │ GPIO13         ─ Relé 2     │
        │                             │
Debug   │ GPIO2          ─ LED Status │
        │ GPIO0          ─ Botón Cfg  │
        │ GPIO1  (TX)    ─ Serial TX  │
        │ GPIO3  (RX)    ─ Serial RX  │
        │                             │
Poder   │ 5V      ─ USB Power         │
        │ GND     ─ Ground            │
        └─────────────────────────────┘
```

### 🌡️ Conexión Sensor de pH

**Tipo:** Módulo analógico amplificado

```
Sensor de pH
├── Signal (SIG) → GPIO34 (ADC)
├── +5V (VCC)    → 5V
└── GND          → GND

Nota: Si el sensor es 4-20mA, usar resistencia de 100Ω entre Signal y GND
```

### 🌊 Conexión Sensor de Conductividad (EC)

**Tipo:** Sonda capacitiva analógica

```
Sensor de Conductividad
├── Signal       → GPIO33 (ADC)
├── +5V (VCC)    → 5V
└── GND          → GND

Alternativa 4-20mA:
├── Signal       → GPIO33 (ADC) con R=100Ω a GND
├── +5V (VCC)    → 5V
└── GND          → GND
```

### 💨 Conexión Sensor de Turbidez

**Tipo:** Analógico infrarrojo

```
Sensor de Turbidez
├── Signal       → GPIO35 (ADC)
├── +5V (VCC)    → 5V
└── GND          → GND
```

### 🌡️ Conexión Sensor de Temperatura

**Tipo:** Dallas DS18B20 (1-Wire)

```
Sensor DS18B20 (3-pin DIP):
├── Pin 1 (GND)  → GND
├── Pin 2 (DQ)   → GPIO32 + Resistencia 4.7kΩ a +3.3V (pull-up)
└── Pin 3 (+5V)  → 5V

O conectar directamente si viene en módulo:
├── GND          → GND
├── Data         → GPIO32
└── +5V          → 5V
```

### 📏 Conexión Sensor de Nivel

**Tipo A: 0-10V**
```
Sensor de Nivel (0-10V)
├── Output       → GPIO36 (ADC) con capacitor 0.1µF a GND
├── +5V (VCC)    → 5V
└── GND          → GND
```

**Tipo B: 4-20mA**
```
Sensor de Nivel (4-20mA)
├── Signal       → GPIO36 (ADC) con R=50Ω a GND
├── +5V (VCC)    → 5V
└── GND          → GND
```

### 🔌 Conexión Relés

```
Relé 1:
├── IN  (Signal)    → GPIO12
├── VCC             → 5V
├── GND             → GND
└── COM/NC/NO       → Control de carga

Relé 2:
├── IN  (Signal)    → GPIO13
├── VCC             → 5V
├── GND             → GND
└── COM/NC/NO       → Control de carga
```

### 💡 LED de Estado

```
LED Status:
├── Ánodo (+)    → GPIO2 (con resistencia 220Ω)
└── Cátodo (-)   → GND
```

### 🔌 Alimentación

```
Fuente de 5V 2A:
├── +5V  → ESP32 5V pin
├── GND  → ESP32 GND pin (x2)
├── +5V  → Sensores (VCC)
└── GND  → Sensores (GND)
```

## 🚀 Configuración del Firmware

### 1. Clonar o Descargar el Proyecto
```bash
cd ~/proyectos/
git clone https://github.com/tuusuario/monitoreo_agua_iot.git
cd monitoreo_agua_iot/firmware
```

### 2. Configurar Credenciales

Editar `src/config/credentials.h`:

```cpp
// WiFi
#define WIFI_SSID              "TU_SSID_AQUI"
#define WIFI_PASSWORD          "TU_CONTRASEÑA_AQUI"

// MQTT Broker
#define MQTT_BROKER            "192.168.1.100"  // IP de tu PC/servidor
#define MQTT_PORT              1883
#define MQTT_CLIENT_ID         "ESP32-AGUA-001"

// API Backend
#define API_BASE_URL           "http://192.168.1.100:3000/api/v1"
#define API_USERNAME           "dispositivo@example.com"
#define API_PASSWORD           "contraseña123"

// IDs del Sistema
#define DISPOSITIVO_ID         1
#define DISPOSITIVO_CODIGO     "DISP-ESP32-001"
#define JAGUEY_ID              1
```

### 3. Ajustar Pines si es Necesario

Editar `src/config/hardware.h` si usas pines diferentes:

```cpp
#define PIN_PH_SENSOR          GPIO_NUM_34
#define PIN_EC_SENSOR          GPIO_NUM_33
#define PIN_TEMPERATURE_SENSOR GPIO_NUM_32
#define PIN_TURBIDITY_SENSOR   GPIO_NUM_35
#define PIN_LEVEL_SENSOR       GPIO_NUM_36
```

## 📝 Compilar y Descargar

### Con PlatformIO CLI

```bash
# Compilar
pio run -e esp32

# Descargar a ESP32
pio run -e esp32 --target upload

# Monitorear serial (115200 baud)
pio device monitor -b 115200
```

### Con PlatformIO IDE (VS Code)

1. Abrir la carpeta `firmware` en VS Code
2. Conectar ESP32 por USB
3. Presionar: **Ctrl + Alt + U** (Upload)
4. Para monitorear serial: **Ctrl + Alt + S**

## ✅ Verificación Inicial

### 1. Monitoreo Serial
```
================================================
MONITOREO AGUA IoT - FIRMWARE ESP32
Versión: 1.0.0
Build: Jun  9 2026 14:30:00
================================================

[WiFi] Conectando a SSID: TU_SSID...
[WiFi] IP Address: 192.168.1.105
[SENSORS] Inicializando sensores...
[MQTT] Conectado al broker MQTT
[API] Autenticación exitosa
✓ Sistema inicializado completamente
```

### 2. Verificar Web Server
```bash
curl http://192.168.1.105/status

{
  "dispositivo_id": 1,
  "codigo": "DISP-ESP32-001",
  "wifi_connected": true,
  "mqtt_connected": true,
  "api_authenticated": true,
  "lecturas": 3,
  "uptime": 15000,
  "rssi": -45,
  "heap_free": 156000
}
```

### 3. Verificar MQTT
```bash
# En otra terminal, suscribirse a todos los tópicos
mosquitto_sub -h 192.168.1.100 -t "agua/#"

# Deberías ver mensajes como:
agua/sensores {"dispositivo_id":1,...}
agua/sensores/pH "7.45"
agua/estado {"dispositivo_id":1,...}
```

## 🔧 Calibración de Sensores

### Calibración Sensor de pH
1. Preparar soluciones buffer estándar (pH 4.0, 7.0, 10.0)
2. Sumergir sensor en pH 7.0
3. Esperar 30 segundos a estabilización
4. Enviar comando MQTT:
```bash
mosquitto_pub -h 192.168.1.100 -t "agua/comandos" \
  -m '{"comando":"CALIBRAR_PH","valor":7.0}'
```

### Calibración Sensor de Conductividad
1. Usar solución estándar 1413 µS/cm (KCl 0.1M)
2. Sumergir sonda
3. Medir voltaje en GPIO33
4. Calcular factor: `factor = 1413 / (voltaje_leído * 1000 / 3300)`
5. Actualizar en código

### Verificar Conexiones
```bash
# Acceder al reporte completo
curl http://192.168.1.105/reporte

{
  "reporte": {
    "sensores": {
      "pH": {"valor": "7.45", "estado": "NORMAL"},
      "ec": {"valor": "1250.50", "estado": "NORMAL"},
      ...
    }
  }
}
```

## 🐛 Diagnóstico de Problemas

### Problema: ESP32 no aparece en puerto USB
**Solución:**
1. Instalar drivers CH340G (para algunos modelos)
2. Usar cable USB de calidad (data, no solo poder)
3. Reintentar conexión

### Problema: No se conecta a WiFi
**Solución:**
1. Verificar SSID y contraseña en `credentials.h`
2. Comprobar que WiFi esté activo
3. Revisar logs: "RSSI" debe ser > -75 dBm
4. Reiniciar ESP32

### Problema: MQTT no conecta
**Solución:**
1. Verificar que Mosquitto esté ejecutándose
2. Probar conexión manual:
```bash
mosquitto_pub -h 192.168.1.100 -t "test" -m "hola"
```
3. Verificar firewall permite puerto 1883

### Problema: API retorna 401
**Solución:**
1. Verificar credenciales en `credentials.h`
2. Verificar que backend está ejecutándose
3. Revisar que usuario existe en base de datos

### Problema: Lecturas inválidas o ceros
**Solución:**
1. Verificar conexiones de sensores
2. Comprobar voltaje en GPIO (usar multímetro)
3. Revisar autodiagnóstico de sensores
4. Probar sensores individualmente

## 🔄 Actualización OTA (Over-The-Air) [Próxima Versión]

```cpp
// Será implementado en v1.1.0
// Permitirá actualizar firmware sin conexión USB
```

## 📊 Monitoreo Continuo

### Crear Script de Monitoreo en Python
```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload)
        print(f"[{datetime.now()}] {msg.topic}: {data}")
    except:
        print(f"[{datetime.now()}] {msg.topic}: {msg.payload}")

client = mqtt.Client()
client.on_message = on_message
client.connect("192.168.1.100", 1883, 60)
client.subscribe("agua/#")
client.loop_forever()
```

## 📈 Próximos Pasos

1. **Completar calibración** de todos los sensores
2. **Validar datos** en el backend
3. **Configurar alertas** según umbrales
4. **Implementar almacenamiento** local en SPIFFS
5. **Realizar pruebas** de larga duración

---

**Fecha de Actualización:** 2026-06-10  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para Producción
