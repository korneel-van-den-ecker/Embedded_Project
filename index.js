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
var _TekstAanHetTonen = false;
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

client.on('connect', function() { 
    console.log('connected Met Mqtt broker');
    // subscribe op pixelfram
    client.subscribe('pixelframe', function() {
        //bericht komt binnen
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

//verbinden met socket client
io.on('connection', function(socket){
  //Voor Live editor
  socket.on('pixelFrame data',(msg)=>{
    console.log(msg);
    Pix.tekenBitmap(msg);      
  });
  //wanneer er teskt voor de Marquee binnenkomt + client emitten van beschikbaarheid
  socket.on('PixelframeTekst', async function(msg){
    _TekstAanHetTonen = true;
      io.emit('marqueeBezig',_TekstAanHetTonen);
    if( await Pix.tekstMarque(msg.tekst,msg.tekstKleur,msg.achertergrondkleur) == true){
      console.log('Klaar');
      _TekstAanHetTonen = false;
      io.emit('marqueeBezig',_TekstAanHetTonen);
    } 
  });  
});

http.listen(3000, function(){
  console.log('listening on *:3000');  
});