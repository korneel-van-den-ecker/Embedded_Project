
//Om hier ook de colors te kunnen gebruiken 
function kleur(r, g, b, bright) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.brightness = bright;
}


var socket = io();

var opgaveAlsTekst = ""
//0 = eerste getal
//1 = plus of min
//2 = tweede getal
//3 = uitkomst
//4 = ingave
var opgave = []
var opgaveGeschiedenis = []
var maximumRekenenTot = 20

// 0 = voor Na Of Tussen
// 1 = midden
// 2 = ingave 1 
// 3 = ingave 2 -> enkel voor tussen 
// 4 = eval

var raadselVoorNOpgave = []
var raadselVoorNOpgaveGeschiedenis = []

$(document).ready(function () {

    stelSomOp = () => {
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

    //Navigatie Menu
    $('#rekenModuleLink').click(() => {
        $('#rekenModule').show();
        $('#raadselModule').hide();
        return false;
    })

    $('#raadselnModuleLink').click(() => {
        $('#rekenModule').hide();
        $('#raadselModule').show();
        raadselBuilderVoorNa();
        return false;
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
        var aantalJuist = opgaveGeschiedenis.filter(x => x.eval == "Juist").length
        var totaalGemaakt = opgaveGeschiedenis.length
        var score = `Score: ${aantalJuist} / ${totaalGemaakt}`
        $('#totaalRekenen').html(score)

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