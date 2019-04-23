const express = require('express');
const app = express()

var http = require('http').Server(app);
var io = require('socket.io')(http);
var Pix = require('pixelframe');
// Om de map public mee te zenden als static data naar de client
app.use(express.static('PixelFrame'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection',(socket)=>{
  //console.log(socket.client);
  socket.on('pixelFrame data',(msg)=>{
    console.log(msg);
    Pix.tekenBitmap(msg);    
    //Pix.tekstMarque("Hallo Test live tekenen")    
  });
})


//io.on('connection', function(socket){
//    socket.on('chat message', function(msg){
//      console.log('message: ' + msg);
//      Pix.tekstMarque(msg);
//    });
//  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});