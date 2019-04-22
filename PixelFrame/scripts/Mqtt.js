

//Dezee info komt van de website van cloudmqtt
var mqttHost = "m20.cloudmqtt.com";
var mqttPort = 34309;

window.onload = Init;

function Init(){

var clientId = Math.floor(Math.random()* 10001); //Random tussen 0 en 10000
client = new Paho.MQTT.Client(mqttHost,Number(mqttPort),String(clientId));
//Zie:http://www.eclipse.org/paho/files/jsdoc/index.html //Dit is een event
client.onMessageArrived = onMessageArrived;

//Hier nog connect oproepen
client.connect(
    {
        //Onconnected is een functie
        onSuccess:onConnected,
        userName:user,
        password:password,
        useSSL:true
    }
);

//Klik-gebeuretenis en bericht 
document.getElementById("btnSendMessage").addEventListener("click",
function(){
    message = new Paho.MQTT.Message(
        
    );
    message.destinationName = "pixelFrame";
    client.send(message);
});
    
}
function onConnected()
{
    console.log("onConnected");
    //Aboneren op een onderwerp
    client.subscribe("pixelFrame",{onSuccess:OnSubscribed});
}

function OnSubscribed(invocationContext)
{
    console.log("onScubscribed");
}




function onMessageArrived(message){
    var currentTime = new Date();
    document.getElementById("divSubscription").innerHTML += message.payloadString + "("+
    currentTime.toLocaleTimeString() + ")<br>";
    console.log("onMessageArrived: " + message.payloadString);
}