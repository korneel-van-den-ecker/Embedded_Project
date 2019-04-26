const express = require('express');
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/indeex.html');
});

io.on('connection', function(socket){
    socket.on('PixelframeTekst', function(msg){
      console.log('message: ' + msg);
      //Tekst naar Pixelframe sturen
      Pix.tekstMarque(msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});