/**
 * Created by David on 12. 12. 2016.
 */
var express = require('express');
var path = require('path');
var device = require('device');
var ejs = require('ejs');
var app = express();

//import{session} from './models/session.js';
var Session = require('./models/session.js');
//var session = new Session(1,false,null,null);
var shortid = require('shortid');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/styles'));
var expressWs = require('express-ws')(app);

var serverHostname;
var generatedCodes = [];
var activeSessions = [];
var view_host;
var hostClient;

var firstClient = true;



app.ws('/game', function (ws, req) {
    ws.on('message', function (data) { // ko dobimo porocilo

        data = JSON.parse(data); // sparsamo podatke
        if (containsCode(data.command)) {
            console.log("Failed");
            console.log(data.command);
            console.log("Kode: ");
            console.log(generatedCodes);
        }
        else if(data.dieCurve == "true") // Če je igralec poslal ukaz iz dieCurve igre
        {
            activeSessions[data.idRoom].gameHostEngine.game.sendCmdToPlayer(data.cmd, data.myID);
        }
        else {
            // var attachClient // spremenljivka za dodajanje clienta v session
            var exits = false;
            for (var i = 0; i < activeSessions.length; i++) {

                //console.log(activeSessions[i].getIdRoom());
                if (activeSessions[i].getIdRoom() == data.command) {
                    // Če client že obstaja ga refreshamo

                    console.log(activeSessions);
                    console.log("==========================");
                    for (var j = 0; j < activeSessions[i].clients.length; j++) {
                        console.log("CLient IP: " + activeSessions[i].clients[j].ip + " ws_ip: "+ ws._socket.remoteAddress);
                        if (activeSessions[i].clients[j].ip == ws._socket.remoteAddress) {
                            activeSessions[i].clients[j].ws = ws;
                            exits = true;
                            break;
                        }
                    }
                    // Če client ne obstaja dodamo novega v sejo
                    if (!exits) {
                        console.log("Naj bi dodajal");
                        client = {};
                        client.id = shortid.generate();
                        client.ip = ws._socket.remoteAddress;
                        // ipList[client.id] = client.ip;
                        client.ws = ws;
                        // dodaj clienta v ta Game room
                        if (activeSessions[i].getNumberOfClients() == 0) {
                            activeSessions[i].addClient(client);
                            activeSessions[i].setAdmin(client.id);
                            // console.log(activeSessions);
                            activeSessions[i].hostWS.send(JSON.stringify({
                                type: "url",
                                url: "http://" + serverHostname + ":3000/gameRoom"
                            }));
                            ws.send(JSON.stringify({
                                type: "url",
                                url: "http://" + serverHostname + ':3000/admin_controls_view'
                            }));
                            break;
                        }
                        activeSessions[i].addClient(client);
                        ws.send(JSON.stringify({
                            type: "msg",
                            msg: "Uspešno ste se prijavili v skupino. Prosimo počakajte da admin izbere igro",
                            myID : client.id
                        }));
                        break;
                    }
                    else // Ce klient obstaja breakamo da ne loopamo skozi vse seje
                        break;
                }
            }
        }

      ws.on('message', function (data) { // ko dobimo porocilo
          data = JSON.parse(data); // sparsamo podatke
          if (containsCode(data.command)) {
              console.log("Failed");
              console.log(data.command);
              console.log("Kode: ");
              console.log(generatedCodes);
          }
          else if(data.dieCurve == "true") // Če je igralec poslal ukaz iz dieCurve igre
          {
              activeSessions[data.idRoom].gameHostEngine.game.sendCmdToPlayer(data.cmd, data.myID);
          }
          else {
              // var attachClient // spremenljivka za dodajanje clienta v session
              var exits = false;
              for (var i = 0; i < activeSessions.length; i++) {

                  //console.log(activeSessions[i].getIdRoom());
                  if (activeSessions[i].getIdRoom() == data.command) {
                      // Če client že obstaja ga refreshamo

                      //console.log(activeSessions);
                      console.log("==========================");
                      for (var j = 0; j < activeSessions[i].clients.length; j++) {
                          console.log("CLient IP: " + activeSessions[i].clients[j].ip + " ws_ip: "+ ws._socket.remoteAddress);
                          if (activeSessions[i].clients[j].ip == ws._socket.remoteAddress) {
                              activeSessions[i].clients[j].ws = ws;
                              exits = true;
                              break;
                          }
                      }
                      // Če client ne obstaja dodamo novega v sejo
                      if (!exits) {
                          console.log("Naj bi dodajal");
                          client = {};
                          client.id = shortid.generate();
                          client.ip = ws._socket.remoteAddress;
                          // ipList[client.id] = client.ip;
                          client.ws = ws;
                          // dodaj clienta v ta Game room
                          if (activeSessions[i].getNumberOfClients() == 0) {
                              activeSessions[i].addClient(client);
                              activeSessions[i].setAdmin(client.id);
                              // console.log(activeSessions);
                              activeSessions[i].hostWS.send(JSON.stringify({
                                  type: "url",
                                  url: "http://" + serverHostname + ":3000/gameRoom"
                              }));
                              ws.send(JSON.stringify({
                                  type: "url",
                                  url: "http://" + serverHostname + ':3000/admin_controls_view'
                              }));
                              break;
                          }
                          activeSessions[i].addClient(client);
                          ws.send(JSON.stringify({
                              type: "msg",
                              msg: "Uspešno ste se prijavili v skupino. Prosimo počakajte da admin izbere igro",
                              myID : client.id
                          }));
                          //console.log(activeSessions);
                          break;
                      }
                      else // Ce klient obstaja breakamo da ne loopamo skozi vse seje
                          break;
                  }
              }
          }

          //clients[0].lastActive = 0;
          /*
          if (typeof clients[data.myID] !== 'undefined') {
              if (data.command == "left")
                  game.sendCmdToPlayer("left", data.myID);
              else if (data.command == "right")
                  game.sendCmdToPlayer("right", data.myID);
              else {
                  console.log("Client was inactive for too long.");
                  console.log(clients);
              }
          }*/
      });
    });
});

app.ws('/server', function (ws, req)
{
    //console.log("Host has connected! ");
    hostClient = ws;
    ws.on('message', function (data) { // ko dobimo sporocilo
        data = JSON.parse(data); // sparsamo podatke
        //console.log(data);
        if (data.action == "generate_code") {
            console.log("Generiram kodo");
            generateCode();
            ws.send(JSON.stringify({
                type: "code",
                code: generatedCodes[generatedCodes.length - 1],
                idRoom: activeSessions[activeSessions.length - 1].idRoom
            }));
        }

        else if(data.action == "sendMeSessionData")
        {
          var idRoom = data.idRoom;
          var session = selectSession(idRoom);
          //console.log("Seja: "+session.getClients());
          //console.log("Client id: "+session.clients[0].id);
          var clientNumbers = [];
          var isThisHostAdmin = "false";
          if(session.getNumberOfClients() == 1)
                isThisHostAdmin="true";
          var i;
          for(i = 0; i < session.getNumberOfClients(); i++)
          {
            clientNumbers[i] = "Guest "+i;
          }

/* Possibly thing to do is to do loop is to check if the host is admin*/

          ws.send(JSON.stringify({
            type:"gameRoom",
            admin:session.getAdmin(),
            //clients:session.getClients(),
            idRoom:session.idRoom,
            clients: clientNumbers,
            isThisHostAdmin:isThisHostAdmin
            /*/
            Če bo potrebno bomo poslali še kašken podatek

            */
            }));

        }


        else if(data.selectGame == "true")
        {
            activeSessions[data.idRoom].gameHostEngine.selectGame(data.gameName);
        }
        else if(data.playersReady == true) // Ko admin pritisne play
        {
            activeSessions[data.idRoom].gameHostEngine.ready(); // Vsi igralci so pripravljeni || admin pritisne play kr nm bol paše
            if(activeSessions[data.idRoom].gameHostEngine.gameIsSelected()) { // Če je igra izbrana jo zaženemo
                activeSessions[data.idRoom].gameHostEngine.runGame();
            }
        }

});
})

app.get('/gameRoom/:idRoom', function (req, res) {


     //console.log(req.params.idRoom);
    // Poiščeš session s tem req.params.idRoom v actieveSessions ter zrenderiraš še podatke ki jih rabiš iz te seje

    res.render('gameRoom');
    //res.render('gameRoom',{sendSession:session});
});

app.get('/admin_controls_view', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'admin_controls_view.html'));
});

app.get('/', function (req, res) {
    serverHostname = req.hostname;
    console.log("User agent: " + req.headers['user-agent']);
    var mydevice = device(req.headers['user-agent']);
    // console.log("Device:");
    if (mydevice.type == 'desktop')
    {
        res.render('code');
    }

    else {
        res.sendFile(path.join(__dirname, 'views', 'mobile_view.html'));
    }
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

function generateCode() {
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
    var session = new Session(code, false, hostClient, null, null);
    console.log("Pushing session!");
    activeSessions.push(session);
}
function containsCode(code) {
    /*
     Preverja če že slučajno obstaja ta ID... (malo verjetno ampak vseeno)
     */
    if (typeof code !== 'undefined') {
        return generatedCodes.indexOf(code) == -1;
    }
    return false;
}

function selectSession(gameID)
{
  var i;
  for(i = 0; i < activeSessions.length; i++)
  {
    if(activeSessions[i].getIdRoom() == gameID)
      return activeSessions[i];
  }
}
