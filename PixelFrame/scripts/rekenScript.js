
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

    $('#rekenModuleLink').click(()=>{
        $('#rekenModule').show();
        $('#raadselModule').hide();
        return false;        
    })

    $('#raadselnModuleLink').click(()=>{
        $('#rekenModule').hide();
        $('#raadselModule').show();
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
        $('#totaal').html(score)

    }

    function raadselBuilder() {
        
    }

});