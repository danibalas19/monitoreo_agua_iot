# 🎯 Próximos Pasos - Firmware Completamente Reestructurado

## Estado Actual: ✅ COMPLETADO 

El firmware ha sido **completamente reestructurado** para coincidir con el esquema real de tu PCB. Todos los componentes son ahora exactos según tu circuito.

---

## 📝 PASO 1: Completar credentials.h

Edita el archivo `firmware/src/config/credentials.h` y rellena tus valores reales:

### WiFi
```cpp
#define WIFI_SSID              "TuRedWiFi"         // Tu SSID real
#define WIFI_PASSWORD          "TuContraseña"      // Tu contraseña WiFi
```

### MQTT
```cpp
#define MQTT_BROKER            "192.168.X.X"       // IP de tu Mosquitto
#define MQTT_PORT              1883                 // Puerto (generalmente 1883)
#define MQTT_USERNAME          "usuario"            // Si tu broker lo requiere
#define MQTT_PASSWORD          "contraseña"         // Si tu broker lo requiere
#define MQTT_CLIENT_ID         "ESP32-AGUA-001"     // ID único (opcional cambiar)
```

### API Backend
```cpp
#define API_BASE_URL           "http://192.168.X.X:3000/api/v1"  // Tu servidor Node.js
#define API_USERNAME           "dispositivo@example.com"           // Email del dispositivo
#define API_PASSWORD           "contraseña_dispositivo"            // Contraseña en BD
```

### Identificadores del Dispositivo
```cpp
#define DISPOSITIVO_ID         1                    // ID en tu BD (tabla dispositivos)
#define DISPOSITIVO_CODIGO     "DISP-ESP32-001"     // Código único
#define JAGUEY_ID              1                    // ID del jaguey en tu BD
```

---

## 🔌 PASO 2: Verificar Conexiones Físicas

Asegúrate de que todos los pines coincidan con tu PCB:

### ANALÓGICOS (ADC)
```
GPIO34 ← PH_EN (rango 400-2500 mV = 0-14 pH)
GPIO35 ← TURBIDEZ2 (rango 0-2500 mV = 0-4000 NTU)
GPIO33 ← TDS (rango 0-3300 mV = 0-5000 ppm)
GND    ← Común
```

### DIGITAL 1-WIRE
```
GPIO32 ← TEMPERATURA (DS18B20 Data)
3.3V   ← Común
GND    ← Común
```

### ULTRASÓNICO HC-SR04
```
GPIO4  ← TRIG (disparador)
GPIO5  ← ECHO (retorno)
5V     ← VCC
GND    ← Común
```

### RELÉS
```
GPIO12 ← MIRELE 1 (Relay 1)
GPIO13 ← MIRELE 2 (Relay 2)
```

### DEBUGGING
```
Serial RX (GPIO3) ← Programador/Monitor Serial
Serial TX (GPIO1) ← Programador/Monitor Serial
GND ← Común
```

---

## 💻 PASO 3: Compilar el Firmware

### Opción A: Usando VS Code + PlatformIO Extension (Recomendado)
1. Abre VS Code en la carpeta `firmware/`
2. Si PlatformIO no está instalado, instálalo desde extensiones
3. Presiona `Ctrl+Shift+P` y busca "PlatformIO: Build"
4. O usa: `PlatformIO > Build` en la barra lateral

### Opción B: Línea de Comando
```bash
cd firmware
pio run -e esp32doit-devkit-v1
```

### Opción C: Arduino IDE
1. Abre `firmware/src/main.ino` en Arduino IDE
2. Selecciona placa: "ESP32 Dev Module"
3. Verifica compilación: Sketch > Verify

---

## 🔬 PASO 4: Cargar el Firmware en ESP32

### USB a Serie (CH340/FTDI)
1. Conecta tu programador USB a serie al ESP32:
   - GND ↔ GND
   - TX ↔ GPIO3 (RX)
   - RX ↔ GPIO1 (TX)
   - 5V ↔ 5V (opcional, si el ESP32 lo necesita)

2. Coloca el ESP32 en modo bootloader:
   - Mantén GPIO0 presionado
   - Presiona RESET mientras lo mantienes
   - Suelta GPIO0

3. Carga el firmware:
   ```bash
   pio run -t upload
   ```
   O en Arduino IDE: Sketch > Upload

4. Abre Serial Monitor a **115200 baud** para ver logs

---

## ✅ PASO 5: Validación Inicial

### Monitor Serial (115200 baud)
Deberías ver logs similares a estos:
```
[WiFi] Conectando a SSID: TuRedWiFi
[WiFi] ✓ Conectado a WiFi
[WiFi] IP Address: 192.168.X.X
[MQTT] Intentando conectar...
[MQTT] ✓ Conectado al broker MQTT
[SENSORS] Inicializando sensores del esquema real...
[SENSORS] ✓ Todos los sensores (5) inicializados correctamente
[API] ✓ Autenticación exitosa
```

### Verificar MQTT (línea de comando)
```bash
# Terminal 1: Monitorear todos los tópicos
mosquitto_sub -h 192.168.X.X -t "agua/#" -v

# Deberías ver mensajes como:
agua/sensores/pH 7.50
agua/sensores/tds 520.15
agua/sensores/turbidez 2.50
agua/sensores/temperatura 25.30
agua/sensores/nivel 234.56
agua/sensores/nivel_porcento 85.3
```

### Verificar API REST
```bash
curl "http://192.168.X.X/status"
# Respuesta esperada:
{
  "dispositivo_id": 1,
  "wifi_connected": true,
  "mqtt_connected": true,
  "api_authenticated": true,
  "lecturas": 42,
  "uptime": 120000
}
```

---

## 🔧 PASO 6: Calibración de Sensores

### pH (PH_EN)
1. Prepara soluciones de calibración: pH 7.0 (neutro) y 4.0 ó 10.0
2. Publica en MQTT:
   ```bash
   mosquitto_pub -h 192.168.X.X -t "agua/comandos/calibrate/ph" -m "7.0"
   ```
3. Espera ~5 segundos y verifica en `agua/debug`

### TDS (Sensor de Conductividad)
1. Prepara soluciones estándar: 50 ppm, 200 ppm, 500 ppm, 1000 ppm
2. Publica:
   ```bash
   mosquitto_pub -h 192.168.X.X -t "agua/comandos/calibrate/tds" -m "500"
   ```

### Turbidez (TURBIDEZ2)
1. Usa agua destilada para cero turbidez
2. Publica:
   ```bash
   mosquitto_pub -h 192.168.X.X -t "agua/comandos/calibrate/turbidez" -m "0.0"
   ```

### Ultrasónico (HC-SR04)
1. Mide una distancia conocida (ej: 100 cm)
2. Publica:
   ```bash
   mosquitto_pub -h 192.168.X.X -t "agua/comandos/calibrate/ultrasonic" -m "100"
   ```

### Autodiagnóstico
Para probar todos los sensores a la vez:
```bash
mosquitto_pub -h 192.168.X.X -t "agua/comandos/selftest" -m "1"
```
Verifica salida en Monitor Serial

---

## 🗄️ PASO 7: Verificar Backend

**IMPORTANTE:** Tu backend Node.js debe estar actualizado para los nuevos sensores.

### Cambios Necesarios en Backend

#### 1. Base de Datos (tiposVariable tabla)
Verifica que existan estos tipos de variable:
```sql
SELECT * FROM tipos_variable;
```

Esperado (al menos):
```
id | nombre          | unidad | rango_min | rango_max
1  | Nivel           | cm     | 0         | 500
2  | Temperatura     | °C     | -55       | 125
3  | pH              | pH     | 0         | 14
4  | TDS/Conductiv   | ppm    | 0         | 5000      ← IMPORTANTE: cambiar de EC (µS/cm) a TDS (ppm)
5  | Turbidez        | NTU    | 0         | 4000
```

Si `tipo_variable_id=4` estaba configurado para EC (µS/cm), actualiza:
```sql
UPDATE tipos_variable SET 
  nombre = 'TDS',
  unidad = 'ppm',
  rango_min = 50,
  rango_max = 1000
WHERE id = 4;
```

#### 2. API REST (`/api/v1/lecturas` POST)
El payload ahora incluye unidades:
```json
{
  "sensor_id": 2,
  "tipo_variable_id": 4,
  "valor": "520.15",
  "unidad": "ppm"  ← NUEVO CAMPO (opcional pero recomendado)
}
```

Asegúrate de que tu endpoint pueda procesar este campo.

#### 3. Alertas y Umbrales
Los umbrales en el backend deben coincidir con los de hardware.h:
```cpp
#define TDS_MIN_THRESHOLD      50.0
#define TDS_MAX_THRESHOLD      1000.0
#define LEVEL_MIN_THRESHOLD_CM 10.0
#define LEVEL_MAX_THRESHOLD_CM 500.0
```

---

## 📊 PASO 8: Monitoreo en Tiempo Real

### Dashboard Frontend
El frontend React debe actualizar sus gráficos y umbrales para:
- TDS en ppm (no EC en µS/cm)
- Nivel en cm y porcentaje (no metros)
- Visualización del porcentaje de llenado

Ver: `front/src/app/pages/Dashboard.tsx`
```typescript
// ACTUALIZAR thresholds
const getStatus = (sensor, value) => {
  if (sensor === 'tds') return value > 1000 ? 'ALTO' : value < 50 ? 'BAJO' : 'NORMAL';
  if (sensor === 'nivel_cm') return value < 10 ? 'BAJO' : value > 500 ? 'ALTO' : 'NORMAL';
  // ...
};
```

### Monitoreo MQTT (Dashboard Público)
Tópicos a monitorear:
```
agua/sensores/pH              → Valores 0-14
agua/sensores/tds             → Valores 0-5000 ppm
agua/sensores/turbidez        → Valores 0-4000 NTU
agua/sensores/temperatura     → Valores -55 a +125 °C
agua/sensores/nivel           → Valores 0-400 cm
agua/sensores/nivel_porcento  → Valores 0-100 %
```

---

## 🚨 Solución de Problemas

### "No se conecta a WiFi"
- Verifica WIFI_SSID y WIFI_PASSWORD en credentials.h
- Asegúrate que el ESP32 esté dentro del rango de la red
- Comprueba firewall/MAC filtering

### "No se conecta a MQTT"
- Verifica MQTT_BROKER IP y puerto
- Comprueba que Mosquitto esté corriendo: `mosquitto -v`
- Usa `mosquitto_sub -h IP -t "#"` para ver si hay conexión

### "Lecturas incorrectas de sensores"
- Verifica las conexiones físicas de los pines
- Ejecuta `mosquitto_pub ... -t "agua/comandos/selftest" -m "1"`
- Revisa Monitor Serial para logs de error

### "API request timeout"
- Verifica que el backend Node.js esté corriendo
- Prueba: `curl http://API_BASE_URL/sensores`
- Verifica firewalling/puerto 3000

---

## 📋 Checklist Final

- [ ] Edité credentials.h con mis valores reales
- [ ] Verifiqué todas las conexiones físicas de pines
- [ ] Compilé el firmware sin errores
- [ ] Cargué el firmware en el ESP32
- [ ] Verifiqué logs en Monitor Serial @ 115200 baud
- [ ] Verifiqué conexión WiFi
- [ ] Verifiqué conexión MQTT (`mosquitto_sub`)
- [ ] Verifiqué endpoint `/status` del ESP32
- [ ] Calibré los sensores (pH, TDS, Turbidez, Ultrasónico)
- [ ] Actualicé backend Node.js para TDS (si fue necesario)
- [ ] Actualicé frontend React para nuevos rangos
- [ ] Monitoreo en tiempo real funcionando

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás un sistema completamente funcional de monitoreo de agua con:

✅ **5 sensores reales** del esquema PCB  
✅ **Comunicación WiFi + MQTT + API REST**  
✅ **Calibración automática de sensores**  
✅ **Almacenamiento en SPIFFS**  
✅ **Diagnóstico integrado**  
✅ **Integración completa con backend**  

¿Preguntas o problemas? Consulta los logs del Monitor Serial y verifica los tópicos MQTT.
