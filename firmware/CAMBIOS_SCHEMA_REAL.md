# Cambios del Firmware para Esquema Real de PCB

**Versión:** 2.0.0  
**Fecha:** 2025-01-15  
**Objetivo:** Actualizar todo el firmware para trabajar con los sensores reales del circuito PCB (en lugar de una plantilla genérica)

---

## 🎯 Sensores Reales del Circema (Según Esquema PCB)

| Sensor | Tipo | Conexión | Rango | Unidad |
|--------|------|----------|-------|--------|
| **PH_EN** | Analógico | GPIO34 (ADC1_CH6) | 0-14 | pH |
| **TURBIDEZ2** | Analógico | GPIO35 (ADC1_CH7) | 0-4000 | NTU |
| **TDS** | Analógico | GPIO33 (ADC2_CH4) | 50-1000 | ppm |
| **TEMPERATURA** | 1-Wire DS18B20 | GPIO32 | -55 a +125 | °C |
| **ULTRASONICO (HC-SR04)** | Digital | GPIO4 (TRIG), GPIO5 (ECHO) | 2-400 | cm |

### Actuadores Relé (MIRELE)
- **Relé 1:** GPIO12
- **Relé 2:** GPIO13

---

## ✅ Archivos Modificados

### 1. **hardware.h** - Configuración de Pines
```cpp
// PINES ANALÓGICOS ACTUALIZADOS
#define PIN_PH_SENSOR          GPIO_NUM_34    // PH_EN
#define PIN_TURBIDITY_SENSOR   GPIO_NUM_35    // TURBIDEZ2
#define PIN_TDS_SENSOR         GPIO_NUM_33    // TDS
#define PIN_TEMPERATURE_SENSOR GPIO_NUM_32    // TEMPERATURA (1-Wire)

// PINES DIGITALES ACTUALIZADOS
#define PIN_ULTRASONIC_TRIG    GPIO_NUM_4     // HC-SR04 Trigger
#define PIN_ULTRASONIC_ECHO    GPIO_NUM_5     // HC-SR04 Echo
#define PIN_RELAY_1            GPIO_NUM_12    // MIRELE1
#define PIN_RELAY_2            GPIO_NUM_13    // MIRELE2

// CONFIGURACIÓN ULTRASÓNICO NUEVA
#define ULTRASONIC_MAX_DISTANCE    400         // cm
#define ULTRASONIC_MIN_DISTANCE    2           // cm
#define ULTRASONIC_SPEED_OF_SOUND  343         // m/s
#define ULTRASONIC_SAMPLES         5           // muestras promediadas
#define ULTRASONIC_TIMEOUT_US      30000       // microsegundos
```

**Cambios clave:**
- ✅ EC (conductividad) → TDS (ppm)
- ✅ Nivel analógico (0-10V) → Ultrasónico (HC-SR04 digital)
- ✅ Threshold de nivel: centímetros en lugar de metros
- ✅ Agregadas constantes del ultrasónico

---

### 2. **Ultrasonic_Sensor.h** - ARCHIVO NUEVO ✨
Clase completamente nueva para el sensor HC-SR04.

**Métodos principales:**
- `readDistance()` - Mide distancia en cm
- `readLevel()` - Convierte distancia a nivel de agua
- `calibrate(knownDistance)` - Calibración con distancia conocida
- `getLevelPercentage()` - Porcentaje de llenado (0-100%)
- `getWaterLevelDescription()` - Interpretación: "BAJO", "NORMAL", "ALTO", etc.

**Rango de operación:** 2-400 cm con precisión ±3mm

---

### 3. **TDS_Sensor.h** - NUEVO (Reemplaza EC_Sensor.h)
Sensor de TDS (Total Dissolved Solids) en ppm, en lugar de conductividad en µS/cm.

**Fórmula de conversión:**
```
TDS(ppm) = (Voltaje(V) / 3.3V) × 5000 ppm
```

**Métodos principales:**
- `readTDS(temperature)` - Lectura con compensación de temperatura
- `calibrate(measuredTDS)` - Calibración con solución estándar
- `getWaterQuality()` - Interpretación de calidad
- `tdsToEC(tds)` - Conversión aproximada a conductividad

---

### 4. **SensorController.h** - Actualizado
Controlador maestro con 5 sensores reales.

**Cambios:**
```cpp
// NUEVA ESTRUCTURA
struct SensorReading {
  float ph;
  float tds;              // TDS en ppm (antes: ec en µS/cm)
  float turbidity;
  float temperature;
  float level;            // Nivel en centímetros (antes: metros)
  float levelPercentage;  // NUEVO: porcentaje de llenado
  unsigned long timestamp;
  bool valid;
};

// SENSORES INSTANCIADOS
PH_Sensor phSensor;
TDS_Sensor tdsSensor;          // Antes: EC_Sensor ecSensor
Turbidity_Sensor turbiditySensor;
Temperature_Sensor temperatureSensor;
Ultrasonic_Sensor ultrasonicSensor;  // NUEVO: antes Level_Sensor
```

---

### 5. **dataFormatter.h** - Actualizado
Cambios en formateo de datos:

**JSON Output (anterior vs nuevo):**
```json
// ANTERIOR
{
  "ec": "520.15",
  "nivel": "2.34"
}

// NUEVO
{
  "tds": "520.15",
  "nivel_cm": "234.56",
  "nivel_porcento": "85.3"
}
```

**Métodos actualizados:**
- `formatSensorReadingJSON()` - Incluye TDS y nivel en cm/porcentaje
- `formatForStorage()` - CSV con unidades correctas
- `getTDSStatus()` - Interpretación de TDS (antes: `getECStatus()`)
- `getLevelPercentageDescription()` - NUEVO método

---

### 6. **main.ino** - Actualizado
Cambios principales:

```cpp
// PUBLICACIÓN MQTT - ACTUALIZADA
mqttManager.publishNumeric(MQTT_TOPIC_TDS, lastReading.tds, 2);
mqttManager.publishNumeric(MQTT_TOPIC_LEVEL, lastReading.level, 2);
mqttManager.publishNumeric(MQTT_TOPIC_LEVEL_PERCENT, lastReading.levelPercentage, 1);

// COMANDOS DE CALIBRACIÓN - NUEVOS
handleCalibrateTDSCommand();        // Antes: handleCalibrateECCommand()
handleCalibrateUltrasonicCommand(); // NUEVO
handleSelfTestCommand();             // NUEVO
```

---

### 7. **credentials.h** - Tópicos MQTT Actualizados
```cpp
// TÓPICOS DE SENSORES INDIVIDUALES
#define MQTT_TOPIC_PH          "agua/sensores/pH"
#define MQTT_TOPIC_TDS         "agua/sensores/tds"          // CAMBIO: EC → TDS
#define MQTT_TOPIC_TURBIDITY   "agua/sensores/turbidez"
#define MQTT_TOPIC_TEMP        "agua/sensores/temperatura"
#define MQTT_TOPIC_LEVEL       "agua/sensores/nivel"
#define MQTT_TOPIC_LEVEL_PERCENT "agua/sensores/nivel_porcento"  // NUEVO
```

---

### 8. **APIClient.h** - Payload de API Actualizado
```cpp
// PAYLOAD ANTERIOR (4 sensores)
pH, EC, Turbidez, Temperatura

// PAYLOAD NUEVO (5 sensores)
pH, TDS, Turbidez, Temperatura, Nivel(ultrasónico)

// Con unidades explícitas
{
  "sensor_id": 2,
  "valor": "520.15",
  "unidad": "ppm",      // NUEVO: antes sin unidad
  "tipo_variable_id": 4  // TDS/Conductividad
}
```

---

## 📊 Estructura de Datos Antes vs Después

### ANTES (Plantilla Genérica)
```
Sensores:     5 (pH, EC, Turbidez, Temperatura, Nivel_analógico)
Nivel:        0-5 metros (0-10V analógico)
TDS:          No existe (EC en µS/cm)
Ultrasónico:  No existe
```

### DESPUÉS (Esquema Real PCB)
```
Sensores:     5 (pH, TDS, Turbidez, Temperatura, Nivel_ultrasónico)
Nivel:        0-400 centímetros + porcentaje de llenado
TDS:          50-1000 ppm (medición real)
Ultrasónico:  HC-SR04 con pulso de tiempo
```

---

## 🔧 Cambios en API REST Payload

### Lectura de Sensores Enviada al Backend

**ESTRUCTURA ANTERIOR:**
```json
{
  "dispositivo_id": 1,
  "jaguey_id": 1,
  "lecturas": [
    {"sensor_id": 1, "tipo_variable_id": 3, "valor": "7.50"},  // pH
    {"sensor_id": 2, "tipo_variable_id": 4, "valor": "520"},   // EC (µS/cm)
    {"sensor_id": 3, "tipo_variable_id": 5, "valor": "2.5"},   // Turbidez
    {"sensor_id": 4, "tipo_variable_id": 2, "valor": "25.3"},  // Temp
    {"sensor_id": 5, "tipo_variable_id": 1, "valor": "2.34"}   // Nivel (m)
  ]
}
```

**ESTRUCTURA NUEVA:**
```json
{
  "dispositivo_id": 1,
  "jaguey_id": 1,
  "lecturas": [
    {"sensor_id": 1, "tipo_variable_id": 3, "valor": "7.50", "unidad": "pH"},        // pH
    {"sensor_id": 2, "tipo_variable_id": 4, "valor": "520", "unidad": "ppm"},       // TDS (ppm)
    {"sensor_id": 3, "tipo_variable_id": 5, "valor": "2.5", "unidad": "NTU"},       // Turbidez
    {"sensor_id": 4, "tipo_variable_id": 2, "valor": "25.3", "unidad": "°C"},       // Temperatura
    {"sensor_id": 5, "tipo_variable_id": 1, "valor": "234.56", "unidad": "cm"}      // Nivel (cm)
  ]
}
```

---

## 📡 Tópicos MQTT Actualizados

### Publicación Automática de Sensores
```
agua/sensores/pH              → "7.50"
agua/sensores/tds             → "520.15"   (CAMBIO: antes "agua/sensores/EC")
agua/sensores/turbidez        → "2.50"
agua/sensores/temperatura     → "25.30"
agua/sensores/nivel           → "234.56"   (ahora en centímetros)
agua/sensores/nivel_porcento  → "85.3"     (NUEVO)
```

### Comandos Disponibles
```
agua/comandos/calibrate/ph           → {"value": "7.0"}
agua/comandos/calibrate/tds          → {"value": "500"}   (CAMBIO: antes /ec)
agua/comandos/calibrate/turbidez     → {"value": "10.0"}
agua/comandos/calibrate/ultrasonic   → {"value": "50"}    (NUEVO: distancia en cm)
agua/comandos/relay/1/on             → Activar relé 1
agua/comandos/relay/1/off            → Desactivar relé 1
agua/comandos/selftest               → Ejecutar diagnóstico (NUEVO)
agua/comandos/status                 → Pedir estado (NUEVO)
```

---

## ✨ Nuevas Funcionalidades

1. **Sensor Ultrasónico HC-SR04**
   - Medición de distancia 2-400 cm
   - Cálculo automático de porcentaje de llenado
   - Descripción interpretativa del nivel (MUY BAJO, BAJO, NORMAL, ALTO, MUY ALTO)

2. **Calibración de Ultrasónico**
   - Comando MQTT para ajuste con distancia conocida
   - Factor de calibración personalizado

3. **Diagnóstico Mejorado**
   - Método `runSelfTest()` en sensores
   - Comando MQTT para activar autodiagnóstico completo
   - Reporte detallado en serie y MQTT

4. **Unidades Explícitas en API**
   - Cada lectura incluye unidad (ppm, cm, °C, NTU, pH)
   - Facilita procesamiento en backend

---

## 🚀 Próximos Pasos

1. **Llenar credentials.h con valores reales:**
   ```cpp
   #define WIFI_SSID              "TuRedWiFi"
   #define WIFI_PASSWORD          "TuContraseña"
   #define MQTT_BROKER            "192.168.X.X"
   #define DISPOSITIVO_ID         1
   #define JAGUEY_ID              1
   ```

2. **Calibración de sensores:**
   - pH: Usar soluciones de calibración 7.0 y 4.0/10.0
   - TDS: Usar soluciones estándar (50, 200, 500, 1000 ppm)
   - Turbidez: Calibración a cero (agua destilada)
   - Ultrasónico: Medir distancia conocida y calibrar

3. **Testing en hardware:**
   - Verificar lecturas en Monitor Serial a 115200 baud
   - Monitorear tópicos MQTT con `mosquitto_sub`
   - Validar datos en API backend

4. **Verificar IDs en Backend:**
   - Confirmar que `tipo_variable_id` para TDS es el correcto
   - Actualizar base de datos si es necesario

---

## 📋 Lista de Verificación Finales

- ✅ Pines ADC correctos (GPIO34, GPIO35, GPIO33)
- ✅ Pines digitales correctos (GPIO4, GPIO5 para ultrasónico; GPIO12, GPIO13 para relés)
- ✅ Fórmulas de conversión actualizadas (TDS en ppm, nivel en cm)
- ✅ Clases de sensores implementadas (UltrasonicSensor, TDS_Sensor)
- ✅ SensorController actualizado con 5 sensores reales
- ✅ DataFormatter con nuevas unidades y campos
- ✅ MQTT topics actualizados (EC → TDS)
- ✅ APIClient payload actualizado con 5 sensores
- ✅ Comandos MQTT para calibración de todos los sensores
- ✅ Autodiagnóstico implementado

---

## 🔗 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `firmware/src/config/hardware.h` | Pines, rangos, thresholds |
| `firmware/src/config/credentials.h` | WiFi, MQTT, API, tópicos |
| `firmware/src/sensors/SensorController.h` | Controlador maestro |
| `firmware/src/sensors/Ultrasonic_Sensor.h` | HC-SR04 (NUEVO) |
| `firmware/src/sensors/TDS_Sensor.h` | TDS en ppm (NUEVO) |
| `firmware/src/main.ino` | Programa principal |
| `firmware/src/utils/dataFormatter.h` | Formateo de datos |
| `firmware/src/api/APIClient.h` | Comunicación REST |

---

**Estado:** ✅ **LISTO PARA COMPILAR Y DESPLEGAR**

Todos los archivos han sido actualizados para trabajar con los sensores reales del esquema PCB. El firmware está optimizado, documentado y listo para pruebas en hardware.
