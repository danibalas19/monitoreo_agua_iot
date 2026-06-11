/**
 * @file hardware.h
 * @brief Configuración de pines y constantes de hardware para ESP32
 * @author Daniel Balasnoa
 * @version 1.0.0
 */

#ifndef HARDWARE_H
#define HARDWARE_H

// ==========================================
// PINES ANALÓGICOS (ADC) - BASADO EN ESQUEMA REAL
// ==========================================
// Sensores analógicos requieren GPIO34-39 (ADC1) o GPIO32-33 (ADC2)
#define PIN_PH_SENSOR          GPIO_NUM_34    // Sensor de pH (ADC1_CH6) - PH_EN
#define PIN_TURBIDITY_SENSOR   GPIO_NUM_35    // Sensor de turbidez (ADC1_CH7) - TURBIDEZ2
#define PIN_TDS_SENSOR         GPIO_NUM_33    // Sensor TDS/Conductividad (ADC2_CH4) - TDS
#define PIN_TEMPERATURE_SENSOR GPIO_NUM_32    // Dallas DS18B20 (1-Wire) - TEMPERATURA

// ==========================================
// PINES DIGITALES - SENSORES Y ACTUADORES
// ==========================================
// Sensor Ultrasónico HC-SR04 (NIVEL)
#define PIN_ULTRASONIC_TRIG    GPIO_NUM_4     // Trigger del ultrasónico (ULTRASONICO)
#define PIN_ULTRASONIC_ECHO    GPIO_NUM_5     // Echo del ultrasónico

// Relés (MIRELE)
#define PIN_RELAY_1            GPIO_NUM_12    // Actuador/Bomba 1 - MIRELE1
#define PIN_RELAY_2            GPIO_NUM_13    // Actuador/Bomba 2 - MIRELE2
#define PIN_LED_STATUS         GPIO_NUM_2     // LED de estado (builtin)
#define PIN_BUTTON_CONFIG      GPIO_NUM_0     // Botón de configuración

// ==========================================
// COMUNICACIÓN
// ==========================================
#define PIN_TX                 GPIO_NUM_1     // UART TX (DEBUG)
#define PIN_RX                 GPIO_NUM_3     // UART RX (DEBUG)

// ==========================================
// CONFIGURACIÓN ADC
// ==========================================
#define ADC_MAX_VALUE          4095.0         // Resolución 12-bit
#define ADC_REFERENCE_VOLTAGE  3.3            // Voltaje de referencia
#define ANALOG_READ_SAMPLES    10             // Muestras promediadas

// ==========================================
// CONFIGURACIÓN DE LECTURAS
// ==========================================
#define SENSOR_READ_INTERVAL   10000          // Leer sensores cada 10 segundos
#define MQTT_PUBLISH_INTERVAL  30000          // Publicar en MQTT cada 30 segundos
#define API_SYNC_INTERVAL      60000          // Sincronizar con API cada 1 minuto
#define WATCHDOG_INTERVAL      30000          // Watchdog cada 30 segundos

// ==========================================
// UMBRALES DE SENSORES - BASADO EN ESQUEMA REAL
// ==========================================
// pH: rango 0-14 (SENSOR PH_EN)
#define PH_MIN_THRESHOLD       6.5
#define PH_MAX_THRESHOLD       8.5
#define PH_CALIBRATION_NEUTRAL 7.0

// Turbidez: NTU (Nephelometric Turbidity Units) - SENSOR TURBIDEZ2
#define TURBIDITY_MIN_THRESHOLD  0.0
#define TURBIDITY_MAX_THRESHOLD  10.0

// TDS/Conductividad: ppm - SENSOR TDS
#define TDS_MIN_THRESHOLD      50.0
#define TDS_MAX_THRESHOLD      1000.0

// Temperatura: °C (SENSOR TEMPERATURA DS18B20)
#define TEMP_MIN_THRESHOLD     5.0
#define TEMP_MAX_THRESHOLD     35.0

// Nivel de Agua: centímetros - SENSOR ULTRASONICO HC-SR04
#define LEVEL_MIN_THRESHOLD_CM    10.0        // Mínimo 10 cm de agua
#define LEVEL_MAX_THRESHOLD_CM    500.0       // Máximo 500 cm (5 metros)

// ==========================================
// CONFIGURACIÓN ULTRASÓNICO HC-SR04 (SENSOR DE NIVEL)
// ==========================================
#define ULTRASONIC_MAX_DISTANCE    400         // Máxima distancia en cm
#define ULTRASONIC_MIN_DISTANCE    2           // Mínima distancia en cm
#define ULTRASONIC_SPEED_OF_SOUND  343         // Velocidad del sonido en m/s a 20°C
#define ULTRASONIC_SAMPLES         5           // Muestras promediadas
#define ULTRASONIC_TIMEOUT_US      30000       // Timeout en microsegundos

// ==========================================
// TAMAÑOS DE BUFFERS
// ==========================================
#define MAX_MESSAGE_SIZE       512
#define MAX_READINGS_BUFFER    100
#define MAX_RETRY_ATTEMPTS     3

// ==========================================
// TIMEOUTS
// ==========================================
#define WIFI_CONNECT_TIMEOUT   20000          // 20 segundos
#define MQTT_CONNECT_TIMEOUT   10000          // 10 segundos
#define API_REQUEST_TIMEOUT    30000          // 30 segundos
#define SENSOR_READ_TIMEOUT    5000           // 5 segundos

// ==========================================
// MEMORIA FLASH
// ==========================================
#define SPIFFS_SIZE            1048576        // 1MB para SPIFFS
#define CONFIG_FILE            "/config.json"
#define READINGS_FILE          "/readings.json"
#define CALIBRATION_FILE       "/calibration.json"

#endif // HARDWARE_H
