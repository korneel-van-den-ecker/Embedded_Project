//Om hier ook de colors te kunnen gebruiken 
function kleur(r,g,b,bright){
  this.r = r;
  this.g = g;
  this.b = b;
  this.brightness = bright;
}

const express = require('express');
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');
//var mqtt_server = require('./MQTT_Server');
//var mqtt = require('mqtt');

app.use(express.static('PixelFrame'));

//Instellen van deopties voor de connectie met Mqtt

//var client = new mqtt_server();
//console.log("hallo");
//client.connect();
// Om de map public mee te zenden als static data naar de client,
//staat dan in root

var mqtt = require('mqtt');
var options = {
    port: 24309,
    host: 'mqtt://m23.cloudmqtt.com',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'pwakhnjz',
    password: 'Z_-Miwavd08t',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};
var client = mqtt.connect('mqtt://m23.cloudmqtt.com', options);

client.on('connect', function() { // When connected
    console.log('connected Met Mqtt broker');
    // subscribe to a topic
    client.subscribe('pixelframe', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });
    });

    // publish a message to a topic
    client.publish('topic1/#', 'my message', function() {
        console.log("Message is published");
        client.end(); // Close the connection when published
    });
});

client.on('error',(error)=>{
  console.log("Réééééééééééééé")
  console.log(error)
});
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//voro de live editor
io.on('connection',(socket)=>{
  //console.log(socket.client);
  socket.on('pixelFrame data',(msg)=>{
    console.log(msg);
    Pix.tekenBitmap(msg);      
  });
})

//Voor de tekst
io.on('connection', function(socket){
  socket.on('PixelframeTekst', function(msg){
    console.log(msg);
    Pix.tekstMarque(msg.tekst,msg.tekstKleur,msg.achertergrondkleur);
    console.log('tekst getoond')
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');  
});