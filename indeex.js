const express = require('express');
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');

var berichtenLijst = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/indeex.html');
});

io.on('connection', function(socket){
    socket.on('PixelframeTekst', function(msg){
      console.log('message: ' + msg);
      //tekst aan lijst toevoegen
      //berichtenLijst.push(msg);
      Pix.tekstMarque(msg);
      console.log('tekst getoond')
    });
});

http.listen(3001, function(){
  console.log('listening on *:3000');
});