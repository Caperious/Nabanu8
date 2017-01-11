/**
* Created by David on 12. 12. 2016.
*/
var express = require('express');
var path = require('path');
var device = require('device');
var ejs = require('ejs');
var app = express();
app.set('view cache', false);
//import{session} from './models/session.js';
var Session = require('./models/session.js');
//var session = new Session(1,false,null,null);
var shortid = require('shortid');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/styles'));
var expressWs = require('express-ws')(app);
var DieCurve = require('./dieCurve/dieCurve');
var serverHostname;
var generatedCodes = [];
var activeSessions = [];
var view_host;
var hostClient;
clientNames = ['Sam','Dean','Mario','Zelda','Link','SubZero','Quan Chi','Xin Zao', 'Lux', 'Sion','Devourer', 'Nomad','Master Yi', 'Ralph', 'Luigi', 'Max Payne','Agent 47'];
var firstClient = true;

function sendCommandGameroom(cmd)  // from console to desktop
{
  var i;
  for(i = 0; i < activeSessions.length; i++)
  {
    if(activeSessions[i].idRoom == idRoom)
    {
      if(cmd == "url")
      {
          activeSessions[i].hostWS.send(JSON.stringify({type:"url", url:"http://" + serverHostname + ':3000/gameRoom/'+idRoom+'/'+activeSessions[i].game}));
      }
      else {
          activeSessions[i].hostWS.send(JSON.stringify({
              command: cmd,
              type: "adminCmd"
              //Če bo potrebno bomo poslali še kašken podatek
          }));
      }
    }
  }
}



app.ws('/adminMobile', function (ws, req)
{

  ws.on('message', function (data)
  {
    // console.log(data);
    data = JSON.parse(data);
    // console.log(data);
    idRoom = data.idRoom;
    session = selectSession(idRoom);
      session.clients[0].ws = ws
    if(data.dieCurve == "true") // Če je igralec poslal ukaz iz dieCurve igre
    {
        // console.log("Smo dubl ukaz za dieCurve");
        if(data.action=="start_game")
        {
          //Tle ma seja še zmer playerje
          session.gameHostEngine.runGame();
        }
        else {
            session.gameHostEngine.currentGame.sendCmdToPlayer(data.command, data.myID);
        }
        return;
    }

    if (data.command == "left")
    {
      var cmd = "levo";
      sendCommandGameroom(cmd);
      console.log("levo");
      //Če bo potrebno bomo poslali še kašken podatek
    }
    else if (data.command == "right") {
      var cmd = "desno";
      sendCommandGameroom(cmd);
      console.log("desno");
    }else if (data.command == "ok") {
      var cmd = "ok";
      if(session.gameHostEngine.isGameSelected() == false) {
        // console.log(data.selectGame);
          session.game=data.selectGame;
          session.gameHostEngine.selectGame(data.selectGame);
          // session.gameHostEngine.game = new DieCurve('Nimaveze','dieCurve',1);
          session.gameHostEngine.gameIsSelected = true;
          console.log("Game is selected!");
          sendCommandGameroom("url");

          // Clientom zamenjamo kontroler
          session.clients.forEach(function(client){
              // console.log(client.id);
              // console.log(client.name);

              client.ws.send(JSON.stringify({type:"urlKontroler",url:"http://" + serverHostname + ':3000/curve_controler/'+idRoom, id:client.id}));
          });
      }
      else // Ko drugič pritisne so igralci "pripravljeni" in se požene igra
      {
        // console.log(session);
        session.gameHostEngine.readySteady();
        session.gameHostEngine.addPlayers(session.clients);
        // conso
        // console.log(session.gameHostEngine.currentGame);
        console.log("Players ready!");
        ws.send(JSON.stringify({type:"action",action:"updateControls",id:session.clients[0].id}));
        console.log("Sending url");
        console.log(session.gameHostEngine.currentGame.players);
      }
      // sendCommandGameroom(cmd);
      // console.log("ok");
      // console.log(session.clients);
    }else {
      if(data.command != null)
      console.log("Error: Invalid data from admin control");
    }

  })
});



app.ws('/admin', function (ws, req)
{
  ws.on('message', function (data) {

    data = JSON.parse(data);
    var session;
    idRoom = data.idRoom;
    var hostWS;
    // communication server-desktop
    if(data.action == "sendMeSessionData")
    {
      var i;
      for(i = 0; i < activeSessions.length; i++)
      {
        if(activeSessions[i].idRoom == idRoom)
        {
          session = activeSessions[i];
          activeSessions[i].hostWS = ws;
          hostWS = activeSessions[i].hostWS;
          break;
        }
      }
      // console.log(hostWS);
      //console.log("Seja: "+session.getClients());
      //console.log("Client id: "+session.clients[0].id);
      var clientNames = [];
      var isThisHostAdmin = "false";
      if(session.getNumberOfClients() == 1)
      isThisHostAdmin="true";
      var i;
      // for(i = 0; i < session.clients; i++)
        // {
        //   clientNumbers[i] = session.clients[i].name;
        // }
        session.clients.forEach(function (client){
          clientNames.push(client.name);
        });
      // console.log(session.clients);

      // Possibly thing to do is to do loop is to check if the host is admin//

      ws.send(JSON.stringify({
        type:"gameRoom",
        admin:session.getAdmin(),
        //clients:session.getClients(),
        idRoom:session.idRoom,
        clients: clientNames,
        isThisHostAdmin:isThisHostAdmin

        //Če bo potrebno bomo poslali še kašken podatek
      }));
    }
  });
});
app.ws('/game', function (ws, req) {
  ws.on('message', function (data) { // ko dobimo porocilo

    data = JSON.parse(data); // sparsamo podatke
    if (containsCode(data.command) && data.dieCurve != "true") {
      console.log("Failed");
      // console.log(data.command);
      // console.log("Kode: ");
      // console.log(generatedCodes);
    }
    else if(data.dieCurve == "true") // Če je igralec poslal ukaz iz dieCurve igre
    {
      asession = selectSession(idRoom);
      asession.gameHostEngine.currentGame.sendCmdToPlayer(data.cmd, data.myID);
    }
    else {
      // var attachClient // spremenljivka za dodajanje clienta v session
      var exits = false;
      for (var i = 0; i < activeSessions.length; i++) {

        //console.log(activeSessions[i].getIdRoom());
        if (activeSessions[i].getIdRoom() == data.command) {
          // Če client že obstaja ga refreshamo

          // console.log(activeSessions);
          // console.log("==========================");
          for (var j = 0; j < activeSessions[i].clients.length; j++) {
            console.log("CLient IP: " + activeSessions[i].clients[j].ip + " ws_ip: "+ ws._socket.remoteAddress);
            if (activeSessions[i].clients[j].ip == ws._socket.remoteAddress) {
              activeSessions[i].clients[j].ws = ws;
              ws.send(JSON.stringify({
                  idRoom:activeSessions[i].idRoom,
                  myID : client.id
              }))
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
            r = random(0,clientNames.length);
            client.name = clientNames[r];

            console.log("We have a new client: " + client.name);
            // ipList[client.id] = client.ip;
            client.ws = ws;
            // dodaj clienta v ta Game room
            if (activeSessions[i].getNumberOfClients() == 0) {
              activeSessions[i].addClient(client);
              activeSessions[i].setAdmin(client.id);
              // activeSessions[i].gameHostEngine.addPlayer(client.id,client.name);
              // console.log(activeSessions);
              activeSessions[i].hostWS.send(JSON.stringify({
                type: "url",
                url: "http://" + serverHostname + ":3000/gameRoom"
              }));
              ws.send(JSON.stringify({
                type: "url",
                url: "http://" + serverHostname + ':3000/admin_controls_view',
                idRoom:activeSessions[i].idRoom
              }));
              break;
            }
            activeSessions[i].addClient(client);
            // activeSessions[i].gameHostEngine.game.addPlayer(client.id);
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
    //
    // ws.on('message', function (data) { // ko dobimo porocilo
    //   data = JSON.parse(data); // sparsamo podatke
    //   if (containsCode(data.command)) {
    //     console.log("Failed");
    //     console.log(data.command);
    //     console.log("Kode: ");
    //     console.log(generatedCodes);
    //   }
    //
    //   else if(data.dieCurve == "true") // Če je igralec poslal ukaz iz dieCurve igre
    //   {
    //     activeSessions[data.idRoom].gameHostEngine.game.sendCmdToPlayer(data.cmd, data.myID);
    //   }


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
// });
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

  });
})
app.ws('/dieCurveHost', function (ws, req) {
    //console.log("Host has connected! ");
    ws.on('message', function (data) { // ko dobimo sporocilo
        // hostClient = ws;
        data = JSON.parse(data); // sparsamo podatke
        if(data.initial == "true")
        {
              idRoom = data.idRoom;
              // console.log(idRoom);
              var session = selectSession(idRoom);
              // console.log(session);
              ws.send(JSON.stringify({zaza:"abrakadabra"}));
              session.hostWS = ws;
              session.gameHostEngine.hostWs = ws;
              // ws.send()
              console.log("Okej smo updatal ws");
        }
        if(data.action == "player_crashed")
        {
          console.log("Kurba sm se zaletu");
          dchsession = selectSession(data.idRoom);
          var player = dchsession.gameHostEngine.currentGame.players[data.myID];
          dchsession.gameHostEngine.currentGame.playerCollided(player);
        }
    });
});
app.get('/gameRoom/:idRoom', function (req, res) {


  //console.log(req.params.idRoom);
  // Poiščeš session s tem req.params.idRoom v actieveSessions ter zrenderiraš še podatke ki jih rabiš iz te seje

  res.render('gameRoom');
  //res.render('gameRoom',{sendSession:session});
});
app.get('/gameRoom/:idRoom/:game', function (req, res) {
    res.render(req.params.game,{idRoom:req.params.idRoom});
})
app.get('/admin_controls_view/:idRoom', function (req, res) {
  res.sendFile(path.join(__dirname, 'views', 'admin_controls_view.html'));
});
app.get('/curve_controler/:idRoom', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'curve_controler.html'));
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
function random(min,max)
{
    return Math.floor(Math.random() * (max - min) + min);
}