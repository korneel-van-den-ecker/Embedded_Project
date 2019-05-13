const mqtt = require('mqtt');

const mqtt_info = require('./mqtt_info');


class MQTT_Server {

  constructor(info) {
    let info = new mqtt_info();
    console.log(info);
    this.port= info.poort	,
    this.mqttClient = info.clientID;
    this.host = info.hostnaam;
    this.username = info.username; // mqtt credentials if these are needed to connect
    this.password = info.password;
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.MQTT_Server = mqtt.connect(this.host, {port: this.port, username: this.username, password: this.password});

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('mytopic', {qos: 0});

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      console.log(message.toString());
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    this.mqttClient.publish('mytopic', message);
  }
}





module.exports = MqttHandler;