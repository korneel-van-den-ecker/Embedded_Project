
//Om hier ook de colors te kunnen gebruiken 
function kleur(r, g, b, bright) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.brightness = bright;
}


var socket = io();
//rekenen
var opgaveAlsTekst = ""
//0 = eerste getal
//1 = plus of min
//2 = tweede getal
//3 = uitkomst
//4 = ingave
var opgave = []
var opgaveGeschiedenis = []
var maximumRekenenTot = 20

//Raadsels
// 0 = voor Na Of Tussen
// 1 = midden
// 2 = ingave 1 
// 3 = ingave 2 -> enkel voor tussen 
// 4 = eval

var raadselVoorNOpgave = []
var raadselVoorNOpgaveGeschiedenis = []

//Tafels

var tafelspgave = []
var tafelsOpgaveGeschiedenis = []
var tafelVan = 2;
var tafelTot = 5;
var tafelMax = 10
var tafelsKeuze = [true,true,false,false,false,false,false,false,false,false]


$(document).ready(function () {

    //initial State
        $('#rekenModule').show();
        $('#raadselModule').hide();        
        $('#tafelModule').hide();

     //Navigatie Menu
     $('#rekenModuleLink').click(() => {
        $('#rekenModule').show();
        $('#raadselModule').hide();        
        $('#tafelModule').hide();
        return false;
    })

    $('#raadselnModuleLink').click(() => {
        $('#rekenModule').hide();
        $('#raadselModule').show();        
        $('#tafelModule').hide();
        raadselBuilderVoorNa();
        return false;
    })

    $('#tafelModuleLink').click(() => {
        $('#rekenModule').hide();
        $('#raadselModule').hide();
        $('#tafelModule').show();
        //raadselBuilderVoorNa();
        return false;
    })

    /////////////////////:Tafels///////////////////////

    bepaalTafelVan = (tafels)=>{
        //hoeveel tefels zijn er true?
        var trueArray = [];
        for (let index = 0; index < tafelMax; index++) {
            if(tafels[index]){
                trueArray.push(index)
            }        
        }
        var keuzeRandom =  Math.floor(Math.random()*trueArray.length)
        return trueArray[keuzeRandom] 
    }

    stelTafelOpgaveOp = () => {
        tafelVan =  bepaalTafelVan(tafelsKeuze) +1
        var maalOfGedeeld = Math.floor(Math.random() * 2) % 2
        var a;
        var b;
        console.log(maalOfGedeeld)
        if (maalOfGedeeld == 1) {
            tafelspgave[1] = " X "
            tafelspgave[0] = Math.floor(Math.random()*10)
            tafelspgave[2] = tafelVan
            tafelspgave[3] = tafelspgave[0] * tafelspgave[2]
        } else {
            tafelspgave[1] = " : "            
            tafelspgave[0] = (Math.floor(Math.random()*10)+1) * tafelVan
            tafelspgave[2] =  tafelVan
            tafelspgave[3] =  tafelspgave[0] / tafelspgave[2]
        }
        console.log(tafelspgave)
        $('#ingaveInputTafel').val("")
        $('#tafel_opdracht').text(`${tafelspgave[0]} ${tafelspgave[1]} ${tafelspgave[2]} = `)

    }

    stelTafelOpgaveOp()

    $('#tafelForm').submit((e) => {
        e.preventDefault();

        tafelspgave[4] = parseInt($('#ingaveInputTafel').val())
        if (isNaN(tafelspgave[4])) {
            window.alert("Geef een nummer in")
        } else {
            var resultaatTekst = ""
            if (tafelspgave[4] == tafelspgave[3]) {
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
                    "eersteFactor": tafelspgave[0],
                    "plusOfMin": tafelspgave[1],
                    "tweedeFactor": tafelspgave[2],
                    "oplossing": tafelspgave[3],
                    "ingave": tafelspgave[4],
                    "eval": result
                }
            }
            var entry1 = entry(resultaatTekst);
            tafelsOpgaveGeschiedenis.push(entry1)
            //console.log(opgaveGeschiedenis)
            stelTafelOpgaveOp()
            vulGeschiedenisTafelAan(entry1)
        }
    })

    vulGeschiedenisTafelAan = (entry) => {
        //$('#geschiedenisLijst').empty()        

        if (entry.eval == "Juist") {
            $('#tafelGeschiedenisLijst').prepend(
                `<li class="list-group-item list-group-item-success">
                ${entry.eersteFactor} ${entry.plusOfMin} ${entry.tweedeFactor} = ${entry.ingave}
                </li>`)
        }
        else {
            $('#tafelGeschiedenisLijst').prepend(
                `<li class="list-group-item list-group-item-danger">
                ${entry.eersteFactor} ${entry.plusOfMin} ${entry.tweedeFactor} = ${entry.ingave}
                </li>`)
        }
        var aantalJuist = tafelsOpgaveGeschiedenis.filter(x => x.eval == "Juist").length
        var totaalGemaakt = tafelsOpgaveGeschiedenis.length
        var score = `Score: ${aantalJuist} / ${totaalGemaakt}`
        $('#totaalTafel').html(score)

    }

    //Selectie Welke tafels 
    stelKeuzeMenuOp = () =>{
        

        for (let index = 0; index < tafelMax; index++) {
            tafel = tafelsKeuze[index]
            if(tafel){
                $('#tafelsSelectie').append(
                    `<label class="btn btn-secondary active tafelsInput">
                        <input  type="checkbox" name="options" id="${index+1}" autocomplete="off" checked> ${index+1}
                    </label>`
                    )
            }
            else{
                $('#tafelsSelectie').append(
                    `<label class="btn btn-secondary tafelsInput">
                        <input  type="checkbox" name="options" id="${index+1}" autocomplete="off"> ${index+1}
                    </label>`
                    )
            }
           
        }
    }

    updateKeuzeMenu = (index,status)=>{
        $('#'+index).checked = status;
    }
    
    stelKeuzeMenuOp()
    
    $('.tafelsInput').click((event)=>{
        var idTafelKnop = event.target.children[0].id -1
        var status = event.target.children[0].checked

        $('#'+idTafelKnop).checked = status
        tafelsKeuze[idTafelKnop] = !tafelsKeuze[idTafelKnop]
        stelTafelOpgaveOp()
    })
    


    /////////////////////:REKENEN//////////////////////

    stelSomOp = () => {
        var plusOfMin = Math.floor(Math.random() * 2) % 2
        var a;
        var b;
        opgave[0] = Math.floor(Math.random() * (maximumRekenenTot + 1))
        console.log(plusOfMin)
        if (plusOfMin == 1) {
            opgave[1] = "-"
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
        $('#totaalRekenen').html(score)

    }

    ////////////////////////////  Raadsels  //////////////////////////::

    function raadselBuilderVoorNa() {
        raadselVoorNOpgave[0] = Math.floor(Math.random() * 2) % 2
        raadselVoorNOpgave[1] = Math.floor(Math.random() * (maximumRekenenTot + 1))

        juistFoutGenerator = (juist) => {
            if (juist) {
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
        }

        //Voor
        if (raadselVoorNOpgave[0] == 0) {
            raadselBuilderVoorNa[2] = raadselVoorNOpgave[1] + 1
            $('#reken_opdrachtText1').text(`${raadselVoorNOpgave[1]} komt net voor: `)
            $('#ingaveInputOpdracht2').hide()
            $('#reken_opdrachtText2').hide()
        }
        //Na
        if (raadselVoorNOpgave[0] == 1) {
            raadselBuilderVoorNa[2] = raadselVoorNOpgave[1] - 1
            $('#reken_opdrachtText1').text(`${raadselVoorNOpgave[1]} komt net na: `)
            $('#ingaveInputOpdracht2').hide()
            $('#reken_opdrachtText2').hide()
        }
        //Tussen
        if (raadselVoorNOpgave[0] == 2) {

        }

    }
    function vuldGeschiedenisAanRaadsel(entry) {
        var kleur;
        var text;
        if (entry.eval == true) {
            kleur = "success"
        } else {
            kleur = "danger"
        }

        switch (entry.voorNaOfTussen) {
            case 0:
                text = `${entry.midden} komt net voor: ${entry.ingave1}`
                break;
            case 1:
                text = `${entry.midden} komt net na: ${entry.ingave1}`
                break;
            case 2:
                break;
            default:
                break;
        }


        $('#geschiedenisLijstRaadsel').prepend(
            `<li class="list-group-item list-group-item-${kleur}">
            ${text}            
            </li>`
        )
        var aantalJuist = raadselVoorNOpgaveGeschiedenis.filter(x => x.eval == "Juist").length
        var totaalGemaakt = raadselVoorNOpgaveGeschiedenis.length
        var score = `Score: ${aantalJuist} / ${totaalGemaakt}`
        $('#totaalRaadsel').html(score)

    }

    $('#raadselForm').submit(function (e) {
        e.preventDefault();
        raadselVoorNOpgave[2] = parseInt($('#ingaveInputOpdracht1').val())
        raadselVoorNOpgave[3] = parseInt($('#ingaveInputOpdracht2').val())

        if (isNaN(raadselVoorNOpgave[2])) {
            window.alert("Geef een nummer in")
        }

        else {

            switch (raadselVoorNOpgave[0]) {
                //Voor
                case 0:
                    //Juist
                    if (raadselVoorNOpgave[2] == raadselVoorNOpgave[1] + 1) {
                        juistFoutGenerator(true);
                        raadselVoorNOpgave[4] = true
                    }
                    //Fout
                    else {
                        juistFoutGenerator(false);
                        raadselVoorNOpgave[4] = false
                    }
                    break;
                //Na
                case 1:
                    //Juist
                    if (raadselVoorNOpgave[2] == raadselVoorNOpgave[1] - 1) {
                        juistFoutGenerator(true);
                        raadselVoorNOpgave[4] = true
                    }
                    //Fout
                    else {
                        juistFoutGenerator(false);
                        raadselVoorNOpgave[4] = false
                    }
                    break;
                //Tussen
                case 2:

                    break;

                default:
                    break;
            }
            // 0 = voor Na Of Tussen
            // 1 = midden
            // 2 = ingave 1 
            // 3 = ingave 2 -> enkel voor tussen 
            function entry() {
                return {
                    "voorNaOfTussen": raadselVoorNOpgave[0],
                    "midden": raadselVoorNOpgave[1],
                    "ingave1": raadselVoorNOpgave[2],
                    "ingave2": raadselVoorNOpgave[3],
                    "eval": raadselVoorNOpgave[4]
                }
            }
            var entry1 = entry();
            raadselVoorNOpgaveGeschiedenis.push(entry1)
            vuldGeschiedenisAanRaadsel(entry1)
            raadselBuilderVoorNa();
            $('#ingaveInputOpdracht1').val("")
            $('#ingaveInputOpdracht2').val("")
        }



    });

});