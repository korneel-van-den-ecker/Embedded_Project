var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket){
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      Pix.tekstMarque(msg);
    });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});