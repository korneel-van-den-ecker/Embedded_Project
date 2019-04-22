
var mqttHost = "m23.cloudmqtt.com";
var mqttPort = 34309;
var _geselecteerdeKleur;
var pixelFrame ;
var BREEDTE = 16;
var HOOGTE = 16;

$(document).ready(function(){    
    $("#colorPicker").val("#FF0000");
    _geselecteerdeKleur = $("#colorPicker").val();
    tekenTabel();
    $(".btnPixel").css("background-color","black").css("style","none"); 
    
    var clientId = Math.floor(Math.random()* 10001); 
    client = new Paho.MQTT.Client(mqttHost,Number(mqttPort),String(clientId));

    $('.chkBox').on('change', function() {
        $('.chkBox').not(this).prop('checked', false);  
    });

    $("#btnVerstuur").prop("disabled",true);

    
    client.connect(
        {
            //Onconnected is een functie
            onSuccess:onConnected,
            userName:"korneel",
            password:"admin",
            useSSL:true
        }
    );

    function Init_socketIO(){
        var socket = io();
        $('form').submit(function(e){
          e.preventDefault(); // prevents page reloading
          socket.emit('chat message', $('#m').val());   
          $('#m').val('');
          return false;
        });
    }

    function Maakjson(){
        //Json Object prepareren
         pixelFrame = {"pixelLijst":[]};
        $('.btnPixel').each(function(){
            var xPos = $(this).data('xpos'),
                yPos = $(this).data('ypos'),
                kleur = $(this).css("background-color");
            pixelFrame.pixelLijst.push({
                'xPos':parseInt(yPos),
                'yPos':parseInt(xPos),
                'kleur': kleur   
            });
        });
        console.log(pixelFrame);
    };
    function tekenTabel(){
        
        for (let i = 0; i < BREEDTE; i++) {
            //var tr = document.createElement("tr");
            var tr = $('<tr ></tr>');
            $("#pixelframe").append(tr);
            for (let j = 0; j < HOOGTE; j++) {
                //DAta - property in button grbruiken data-row en data-collum
                var button = document.createElement("button");
                button.className = "btnPixel"
                //$(button).data("data-xpos",i).data("data-ypos",j)
                $(button).attr("data-xpos",i).attr('data-ypos',j)
                //Event handler
                $(button).click({xPos: i, yPos: j,kleur: 0x00ff00}, ModifyLedFrame);
                var td = $('<td ></td>');
                $(td).append(button);                
                $("tr").last().append(td);                
            }            
        }
    };    
    $("#colorPicker").change(function(){
        _geselecteerdeKleur = this.value;
    });

    $("#btnKleur").click(function(){   
            
        //gewoon via klasse kleuren 
        $(".btnPixel").css("background-color",_geselecteerdeKleur).css("style","none");
    });   
    $("#btnVerstuur").click(function(){   
        Verzend_Mqtt();
        
        DisableButton();
    });   

    
    async function DisableButton(){
        $("#btnVerstuur").prop("disabled",true);
        await setTimeout(function(){
            $("#btnVerstuur").prop("disabled",false);
        },5000);
    };  
    
    
    $("#btnReset").click(function(){   
        $(".btnPixel").css("background-color","black").css("style","none");
    }); 
    
    
    function ModifyLedFrame(event){
        //teken een lijn 
        if($("#checkBoxRij").is(':checked')){
            for (let i = 0; i < BREEDTE; i++) {
                UpdatePixelColor(event.data.xPos, i,_geselecteerdeKleur)
            }
        }
        //teken een kolom
        else if($("#checkBoxKolom").is(':checked')){
            for (let i = 0; i < BREEDTE; i++) {
                UpdatePixelColor(i, event.data.yPos,_geselecteerdeKleur)
            }
        }
        //teken een enkele pixel
        else{
            UpdatePixelColor(event.data.xPos,event.data.yPos,_geselecteerdeKleur);    
        }  

        //Verzenden van de frame over socket.io  bij elke verandering
    }

    function Verzend_Mqtt(){
        Maakjson();
        var JsonString = JSON.stringify(pixelFrame,);
        message = new Paho.MQTT.Message(
            JsonString
            );
            message.destinationName = "PixelFrame";
            client.send(message);
    };

    function UpdatePixelColor(xPos, yPos,kleur){
        $('.btnPixel[data-xpos="' + xPos + '"][data-ypos="'+yPos+'"]').css("background-color",kleur);
        Maakjson();
    }

    function onConnected()
    {
        console.log("onConnected");
        //Connected tonen wanneer mqtt geconecteerd is
        $("#connect").html("CONNECTED").addClass("text text-succes");
        
        client.subscribe("pixelFrame",{onSuccess:OnSubscribed});
        $("#btnVerstuur").prop("disabled",false);

    }

    function OnSubscribed(invocationContext)
    {
        console.log("onScubscribed");
    }   

    
});