const express = require('express');
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');
var mqtt = require('./mqtt_Info');

// Om de map public mee te zenden als static data naar de client,
//staat dan in root
app.use(express.static('PixelFrame'));

//Instellen van deopties voor de connectie met Mqtt

var client = new mqtt();

client.on('connect', function() { // When connected
    console.log('connected');
    // subscribe to a topic
    client.subscribe('PixelFrame', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });
    });

    // publish a message to a topic
    //client.publish('topic1/#', 'my message', function() {
     //   console.log("Message is published");
     //   client.end(); // Close the connection when published
    //});
});

client.on('error', function(err) {
  console.log(err);
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',(socket)=>{
  //console.log(socket.client);
  socket.on('pixelFrame data',(msg)=>{
    console.log(msg);
    Pix.tekenBitmap(msg);      
  });
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});