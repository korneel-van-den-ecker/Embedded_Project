
//Om hier ook de colors te kunnen gebruiken 
function kleur(r, g, b, bright) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.brightness = bright;
}

var mqttHost = "m23.cloudmqtt.com";
var mqttPort = 34309;
var _geselecteerdeKleurLiveEditor;
var _geselecteerdeKleurMarqueeLetters;
var _geselecteerdeKleurMarqueeAchterGrond;
var pixelFrame;
var BREEDTE = 16;
var HOOGTE = 16;
var socket = io();

var opgaveAlsTekst = ""
//0 = eerste getal
//1 = plus of min
//2 = tweede getal
//3 = uitkomst
//4 = ingave
var opgave = []
var opgaveGeschiedenis = []
var maximumRekenenTot = 200



//Voor het tekstvak
$(function () {
    var socket = io();
    $('#verzendForm').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        var teverzendenOject = {
            "tekst": $('#m').val(),
            "tekstKleur": _geselecteerdeKleurMarqueeLetters,
            "achertergrondkleur": _geselecteerdeKleurMarqueeAchterGrond,
        }
        socket.emit('PixelframeTekst', teverzendenOject);

        $('#m').val('');
        // Om te ontvangen dat er iemand aan het zenden is of niet
        //Bepaald bescjikbaarheid van Marquee op client
        socket.on('marqueeBezig', function (msg) {
            $('#marqueePaneel').show();
            if (msg == false) {
                $('#MarqueeBeschikbaarheid').text('Beschikbaar');
                $('#marqueeWarning').hide();

                console.log("beschikbaar Marquee")
            }
            else {
                console.log(" NIET beschikbaar Marquee")
                $('#MarqueeBeschikbaarheid').val('NIET Beschikbaar');
                $('#marqueePaneel').hide();
                $('#marqueeWarning').show();
            }
        });
        return false;
    });
});






$(document).ready(function () {

    //random som of verschil maken

    function stelSomOp() {
        var plusOfMin = Math.floor(Math.random() * 2) % 2
        var a;
        var b;
        console.log(plusOfMin)
        if (plusOfMin == 1) {
            opgave[1] = "-"
            opgave[0] = Math.floor(Math.random() * (maximumRekenenTot + 1))
            opgave[2] = Math.floor(Math.random() * (opgave[0] + 1))
            opgave[3] = opgave[0] - opgave[2]
        } else {
            opgave[1] = " + "
            opgave[3] = Math.floor(Math.random() * (maximumRekenenTot + 1))
            opgave[0] = Math.floor(Math.random() * (opgave[3] + 1))
            opgave[2] = opgave[3] - opgave[0]
        }
        console.log(opgave)
        console.log(opgave[3])
        $('#ingaveInput').val("")
        $('#reken_opdracht').text(`${opgave[0]} ${opgave[1]} ${opgave[2]} = `)

    }

    stelSomOp()



    $('#rekenForm').submit((e) => {
        e.preventDefault();

        opgave[4] = parseInt($('#ingaveInput').val())
        if (isNaN(opgave[4])) {
            window.alert("Geef een nummer in")
        } else {
            var resultaatTekst = ""
            if (opgave[4] == opgave[3]) {
                resultaatTekst = "Juist"
                tekstKleur = new kleur(0, 0, 0, 1)
                achertergrondkleur = new kleur(0, 255, 0, 1)
            } else {
                resultaatTekst = "Fout"
                tekstKleur = new kleur(0, 0, 0, 1)
                achertergrondkleur = new kleur(255, 0, 0, 1)
            }
            var teverzendenOject = {
                "tekst": resultaatTekst,
                "tekstKleur": tekstKleur,
                "achertergrondkleur": achertergrondkleur,
            }
            socket.emit('PixelframeTekst', teverzendenOject);
            function entry(result) {
                return {
                    "eersteFactor": opgave[0],
                    "plusOfMin": opgave[1],
                    "tweedeFactor": opgave[2],
                    "oplossing": opgave[3],
                    "ingave": opgave[4],
                    "eval": result
                }
            }
            var entry1 = entry(resultaatTekst);
            opgaveGeschiedenis.push(entry1)
            console.log(opgaveGeschiedenis)
            stelSomOp()
            vulGeschiedenisAan(entry1)
        }
    })

    vulGeschiedenisAan = (entry) => {
        //$('#geschiedenisLijst').empty()        

        if (entry.eval == "Juist") {
            $('#geschiedenisLijst').prepend(
                `<li class="list-group-item list-group-item-success">
                ${entry.eersteFactor} ${entry.plusOfMin} ${entry.tweedeFactor} = ${entry.ingave}
                </li>`)
        }
        else {
            $('#geschiedenisLijst').prepend(
                `<li class="list-group-item list-group-item-danger">
                ${entry.eersteFactor} ${entry.plusOfMin} ${entry.tweedeFactor} = ${entry.ingave}
                </li>`)
        }
        var aantalJuist = opgaveGeschiedenis.filter(x => x.eval == "Juist").length
        var totaalGemaakt = opgaveGeschiedenis.length
        var score = `Score: ${aantalJuist} / ${totaalGemaakt}`
        $('#totaal').html(score)

    }






    //Start zonder warning te laten zien
    $('#marqueeWarning').hide();


    //Colorpickers en brightnes  Initialiseren:
    //live-editor
    $("#colorPickerLiveEditor").val("#FF0000");
    _geselecteerdeKleurLiveEditor = $("#colorPickerLiveEditor").val();

    //Marquee LettersKleur
    $("#colorPickerLetters").val("#000000");
    _geselecteerdeKleurMarqueeLetters =
        getColorFromInterface($("#colorPickerLetters").val(), $('#brightLetters').val());
    //_geselecteerdeKleurMarqueeLetters = $("#colorPickerLetters").val();

    //Marquee achtergrond
    $("#colorPickerLettersAchtergrond").val("#FF0000");
    _geselecteerdeKleurMarqueeAchterGrond =
        getColorFromInterface($("#colorPickerLettersAchtergrond").val(), $('#brightLettersAchterGrond').val());
    //_geselecteerdeKleurMarqueeAchterGrond = $("#colorPickerLettersAchtergrond").val();




    tekenTabel();

    $(".btnPixel").css("background-color", "black").css("style", "none");

    var clientId = Math.floor(Math.random() * 10001);
    client = new Paho.MQTT.Client(mqttHost, Number(mqttPort), String(clientId));

    $('.chkBox').on('change', function () {
        $('.chkBox').not(this).prop('checked', false);
    });

    $("#btnVerstuur").prop("disabled", true);


    client.connect(
        {
            //Onconnected is een functie
            onSuccess: onConnected,
            userName: "korneel",
            password: "admin",
            useSSL: true
        }
    );

    //$('#btnVerstuur').click(function(e){
    //Maakjson();
    //e.preventDefault();
    //socket.emit('pixelFrame data',pixelFrame);
    //return false;
    //});

    $("#btnVerstuur").click(function () {
        Verzend_Mqtt();

        DisableButton();
    });


    function Maakjson() {
        //Json Object prepareren
        pixelFrame = { "pixelLijst": [] };
        $('.btnPixel').each(function () {
            var xPos = $(this).data('xpos'),
                yPos = $(this).data('ypos'),
                kleur = $(this).css("background-color"),
                bright = $(this).data('brightness');
            //We kuisen eerst de kleur code op dat deze gewoon r,g,b wordt
            var kleurGeknipt = kleur.slice(4, kleur.length - 1);
            //console.log(kleurGeknipt);
            pixelFrame.pixelLijst.push({
                'xPos': parseInt(yPos),
                'yPos': parseInt(xPos),
                'kleur': kleurGeknipt,
                'brightness': bright
            });
        });
        console.log(pixelFrame);
    };
    function tekenTabel() {

        for (let i = 0; i < BREEDTE; i++) {
            //var tr = document.createElement("tr");
            var tr = $('<tr ></tr>');
            $("#pixelframe").append(tr);
            for (let j = 0; j < HOOGTE; j++) {
                //DAta - property in button grbruiken data-row en data-collum
                var button = document.createElement("button");
                button.className = "btnPixel"
                //$(button).data("data-xpos",i).data("data-ypos",j)
                $(button).attr("data-xpos", i).attr('data-ypos', j).attr('data-brightness', $("#brightLiveEdito").val())
                //Event handler

                $(button).mousedown({ xPos: i, yPos: j, kleur: 0x00ff00 }, ModifyLedFrame).click(({ xPos: i, yPos: j, kleur: 0x00ff00 }, ModifyLedFrame));
                var td = $('<td ></td>');
                $(td).append(button);
                $("tr").last().append(td);
            }
        }
    };

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    function getColorFromInterface(kleurVal, brightVal) {
        var rgbKleur = hexToRgb(kleurVal);
        return new kleur(rgbKleur.r, rgbKleur.g, rgbKleur.b, brightVal);
    }

    //Waarden van de kleuren aanpassn
    $("#colorPickerLiveEditor").change(function () {
        _geselecteerdeKleurLiveEditor = this.value;
    });

    $("#colorPickerLetters").change(function () {
        _geselecteerdeKleurMarqueeLetters =
            getColorFromInterface($("#colorPickerLetters").val(), $('#brightLetters').val());
    });

    $("#brightLetters").change(function () {
        _geselecteerdeKleurMarqueeLetters =
            getColorFromInterface($("#colorPickerLetters").val(), $('#brightLetters').val());
    });



    $("#colorPickerLettersAchtergrond").change(function () {
        _geselecteerdeKleurMarqueeAchterGrond =
            getColorFromInterface($("#colorPickerLettersAchtergrond").val(), $('#brightLettersAchterGrond').val());
    });
    $("#brightLettersAchterGrond").change(function () {
        _geselecteerdeKleurMarqueeAchterGrond =
            getColorFromInterface($("#colorPickerLettersAchtergrond").val(), $('#brightLettersAchterGrond').val());
    });


    $("#btnKleur").click(function () {

        //gewoon via klasse kleuren 
        $(".btnPixel").css("background-color", _geselecteerdeKleurLiveEditor).css("style", "none");
        //En ook meteen verzenden via socket.io
        Maakjson();
        socket.emit('pixelFrame data', pixelFrame);
    });




    async function DisableButton() {
        $("#btnVerstuur").prop("disabled", true);
        await setTimeout(function () {
            $("#btnVerstuur").prop("disabled", false);
        }, 5000);
    };


    $("#btnReset").click(function () {
        $(".btnPixel").css("background-color", "black").css("style", "none");
        Maakjson();
        tekentabel();
    });


    function ModifyLedFrame(event) {
        //teken een lijn 
        if ($("#checkBoxRij").is(':checked')) {
            for (let i = 0; i < BREEDTE; i++) {
                UpdatePixelColor(event.data.xPos, i, _geselecteerdeKleurLiveEditor)
            }
        }
        //teken een kolom
        else if ($("#checkBoxKolom").is(':checked')) {
            for (let i = 0; i < BREEDTE; i++) {
                UpdatePixelColor(i, event.data.yPos, _geselecteerdeKleurLiveEditor)
            }
        }
        //teken een enkele pixel
        else {
            UpdatePixelColor(event.data.xPos, event.data.yPos, _geselecteerdeKleurLiveEditor);
        }

        //Verzenden van de frame over socket.io  bij elke verandering
        //Maakjson();
        //event.preventDefault();
        socket.emit('pixelFrame data', pixelFrame);
        Verzend_Mqtt();
        //return false;
    }

    function Verzend_Mqtt() {
        Maakjson();
        var JsonString = JSON.stringify(pixelFrame,);
        message = new Paho.MQTT.Message(
            JsonString
        );
        message.destinationName = "PixelFrame";
        client.send(message);
    };

    function UpdatePixelColor(xPos, yPos, kleur) {
        var test = $("#brightLiveEdito").val();
        $('.btnPixel[data-xpos="' + xPos + '"][data-ypos="' + yPos + '"]').css("background-color", kleur).data('brightness', $("#brightLiveEdito").val());

        Maakjson();
    }

    function onConnected() {
        console.log("onConnected");
        //Connected tonen wanneer mqtt geconecteerd is
        $("#connect").html("CONNECTED to Mqtt-broker").addClass("text-succes");

        client.subscribe("pixelFrame", { onSuccess: OnSubscribed });
        $("#btnVerstuur").prop("disabled", false);

    }

    function OnSubscribed(invocationContext) {
        console.log("onScubscribed");
    }




});