/**
 * Created by David on 12. 12. 2016.
 */
var express = require('express');
var path = require('path');
var device = require('device');
var ejs = require('ejs');
var app = express();

var serverHostname;
//import{session} from './models/session.js';
var Session = require('./models/session.js');
//var session = new Session(1,false,null,null);
var shortid = require('shortid');

var generatedCodes = [];
var activeSessions = [];
var view_host;
function generateCode() {
    console.log(hostClient);
    var i;
    var code = "";

    for (i = 0; i < 8; i++) {
        code = code + Math.floor((Math.random() * 10));
    }
    while (containsCode(code) == false) // Če že ta ID obstaja se generira nova koda
    {
        for (i = 0; i < 8; i++) {
            code = code + Math.floor((Math.random() * 10));
        }
    }
    generatedCodes.push(code);
    var session = new Session(code, false,hostClient, null, null);
    activeSessions.push(session);

}

function containsCode(code) {
    /*
     Preverja če že slučajno obstaja ta ID... (malo verjetno ampak vseeno)
     */
    return generatedCodes.indexOf(code) == -1;
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/styles'));
var expressWs = require('express-ws')(app);
var Game = require('./dieCurve/game_main.js');
game = new Game('game_canvas', "DieCurve", '1');


var clientCounter = 0;
var clients = [];
var hostClient;
app.ws('/game', function (ws, req) {
    ws.on('message', function (data) { // ko dobimo porocilo
        data = JSON.parse(data); // sparsamo podatke
        if (data.initial == "true") // ce je to prvo sporocilo od nekoga ga shranimo v array clientov
        {
            clients[clientCounter] = {};
            clients[clientCounter].ws = ws; //shranimo vse povezave do serverja
            clients[clientCounter].lastActive = new Date().getTime() / 100000;
            game.addPlayer(clientCounter); // dodamo igralca, pozneje potrebno dodat izbiranje igre ce je igralec prvi v tej seji
            ws.send(JSON.stringify({id: clientCounter})); // ter mu posljemo id, da ob naslednjem sporocilu vemo kdo posilja
            clientCounter++; // idji clientov
            //console.log(data.myID+" "+data.command);
            //console.log(ws);
        }
        else {

            clients[data.myID].lastActive = 0;
            if (data.command == "left")
                game.sendCmdToPlayer("left", data.myID);
            else if (data.command == "right")
                game.sendCmdToPlayer("right", data.myID);
            else
                console.log("WE HAVE A HACKERMAN!");
        }


        if (containsCode(data.command)) {
            console.log("Failed");
        }
        else {
            var attachClient // spremenljivka za dodajanje clienta v session

            for (var i = 0; i < activeSessions.length; i++) {
                //console.log(activeSessions[i].getIdRoom());
                if (activeSessions[i].getIdRoom() == data.command) {
                    //console.log("Isti je");
                    attachClient = shortid.generate();
                    // dodaj clienta v ta Game room
                    if (activeSessions[i].getNumberOfClients() == 0) {
                        activeSessions[i].addClient(attachClient);
                        activeSessions[i].setAdmin(attachClient);
                        // console.log(activeSessions);
                        activeSessions[i].hostWS.send(JSON.stringify({type: "url", url: "http://"+serverHostname+":3000/gameRoom"}));
                        break;
                    }
                    activeSessions[i].addClient(attachClient);
                    break;
                }
            }
            // console.log(activeSessions);
            //console.log("Success");
        }

        //clients[0].lastActive = 0;
        if (typeof clients[data.myID] !== 'undefined') {
            if (data.command == "left")
                game.sendCmdToPlayer("left", data.myID);
            else if (data.command == "right")
                game.sendCmdToPlayer("right", data.myID);
            else {
                console.log("Client was inactive for too long.");
                console.log(clients);
            }
        }
    });
});

app.ws('/server', function (ws, req) {
    console.log("Host has connected! ");
    hostClient = ws;
    // console.log(ws);
    // setInterval(loopGame, 50);
    // setTimeout(loopGame,500);
    ws.on('message', function (data) { // ko dobimo sporocilo
        data = JSON.parse(data); // sparsamo podatke
        if(data.action == "generate_code")
        {
            console.log("Generiram kodo");
            generateCode();
            // console.log(activeSessions[activeSessions.length-1]);
            ws.send(JSON.stringify({type:"code", code:generatedCodes[generatedCodes.length-1], idRoom:activeSessions[activeSessions.length-1].idRoom} ));
        }
    });
    // setTimeout(loopGame,500);

});


function loopGame() {
    console.log("Sending data!");
    // console.log(hostClient);
    game.updatePlayers();
    hostClient.send(JSON.stringify({"type": "gameinfo", "game": game}));
}

app.get('/gameRoom/:idRoom',function(req,res){
    console.log(req.params.idRoom);
    res.render('gameRoom');
});

app.get('/', function (req, res) {
    serverHostname = req.hostname;
    console.log("User agent: " + req.headers['user-agent']);
    var mydevice = device(req.headers['user-agent']);
    // console.log("Device:");
    if (mydevice.type == 'desktop') {

        res.render('code');
    }

    else
    {
        res.sendFile(path.join(__dirname, 'views', 'curve_controler.html'));
    }
})


app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
