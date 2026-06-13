import mqtt from 'mqtt';
import { logger } from '../utils/logger.js';

export const initMQTTClient = () => {
  // Usa la URL de tu broker (Mosquitto, HiveMQ, etc.)
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://test.mosquitto.org';
  
  logger.info(`Iniciando cliente MQTT, conectando a: ${brokerUrl}...`);
  const client = mqtt.connect(brokerUrl);

  client.on('connect', () => {
    logger.info('✓ Cliente MQTT del Backend conectado exitosamente');
    
    // Suscribirse a los tópicos. Asegúrate de que este tópico coincida con
    // el valor de MQTT_TOPIC_SENSORS en tu config/hardware.h del ESP32
    const topicSensors = process.env.MQTT_TOPIC_SENSORS || 'monitoreo_agua/sensores/#';
    
    client.subscribe(topicSensors, (err) => {
      if (!err) {
        logger.info(`✓ Suscrito exitosamente al tópico: ${topicSensors}`);
      } else {
        logger.error('Error al suscribirse al tópico MQTT:', err);
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      // Convertir el payload MQTT (Buffer) a un objeto JSON
      const payload = JSON.parse(message.toString());
      logger.info(`[MQTT] Nuevo mensaje recibido en [${topic}]:`, payload);
      
      // TODO: Aquí puedes importar tu lógica de base de datos para guardar estas lecturas.
    } catch (error) {
      logger.error(`[MQTT] Error parseando el mensaje del tópico ${topic}:`, error.message);
    }
  });

  return client;
};