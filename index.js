/**
 * Created by David on 12. 12. 2016.
 */
var express = require('express');
var path = require('path');
var device = require('device');
var ejs = require('ejs');
var app = express();

var generatedCodes=[];


function generateCode()
{

  var i;
  var code ="";

  for(i = 0; i < 8; i++)
  {
    code = code + Math.floor((Math.random() * 10));
  }
  while(isValidCode(code) == false)
  {
    for(i = 0; i < 8; i++)
    {
      code = code + Math.floor((Math.random() * 10));
    }
  }
  generatedCodes.push(code);
}

function isValidCode(code)
{
  /*
  while(isValidCode != -1)
  generatedCodes.append(code);
  */
  return generatedCodes.indexOf(code) == -1;
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/styles'));
var expressWs = require('express-ws')(app);
var Game = require('./dieCurve/game_main.js');
game = new Game('game_canvas',"DieCurve",'1');
var clientCounter = 0;
var clients = [];
app.ws('/game', function(ws, req) {
    ws.on('message', function(data) { // ko dobimo porocilo
        data = JSON.parse(data); // sparsamo podatke
        if(data.initial == "true") // ce je to prvo sporocilo od nekoga ga shranimo v array clientov
        {
            console.log(data);
            clients[clientCounter] = {};
            clients[clientCounter].ws = ws; //shranimo vse povezave do serverja
            clients[clientCounter].lastActive= new Date().getTime() / 100000;
            game.addPlayer(clientCounter); // dodamo igralca, pozneje potrebno dodat izbiranje igre ce je igralec prvi v tej seji
            ws.send(JSON.stringify({id:clientCounter})); // ter mu posljemo id, da ob naslednjem sporocilu vemo kdo posilja
            clientCounter++; // idji clientov
            //console.log(data.myID+" "+data.command);
            //console.log(ws);
        }
        else
        {
            console.log(data.myID+" "+data.command);
            //clients[0].lastActive = 0;
            if(data.command == "left")
                game.sendCmdToPlayer("left",data.myID);
            else if(data.command == "right")
                game.sendCmdToPlayer("right",data.myID);
            else
                "WE HAVE A HACKERMAN!";
        }

    })
});

app.ws('/server', function(ws, req) {
    ws.on('message', function(data) { // ko dobimo sporocilo
        data = JSON.parse(data); // sparsamo podatke
        if(data.refresh == "true")
        {/*
            if(clients.length > 0)
            {
                // console.log(game.getPlayers());
                for (index = 0; index < clients.length; ++index) {
                    //console.log("Player : "+ index +" has been inactive for :"+((new Date().getTime() / 1000) - clients[index].lastActive));
                    if((new Date().getTime() / 1000) - clients[index].lastActive  > 10){

                        game.removePlayer(index);
                        clients.splice(index,1);
                        clientCounter--;
                    }
                }*/
                console.log("OK, refresham!");

                ws.send(JSON.stringify({refresh:"true",players : game.getPlayers(), clientCounter : clientCounter}));
            //}
        }
    });
});
app.get('/code', function(req, res){
  generateCode();
  res.render('code',{clients: clients, code:generatedCodes[generatedCodes.length -1 ]});
})

app.get('/', function (req, res) {
    console.log("User agent: " + req.headers['user-agent']);
    var mydevice = device(req.headers['user-agent']);
    // console.log("Device:");
    if(mydevice.type == 'desktop') {
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
        //res.render('game'
      //res.sendFile(path.join(__dirname, 'views', 'mobile_view.html'));
    }
    else
    {
        res.sendFile(path.join(__dirname, 'views', 'mobile_view.html'));
    }
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
