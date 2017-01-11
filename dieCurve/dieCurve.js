/**
 * Created by David on 14. 12. 2016.
 */
var color = require('randomcolor')
var Player = require('./player');

function DieCurve(canvas, gameName, gameID)
{
    this.canvas = canvas;
    this.GameName = gameName;
    this.gameID = gameID;
    this.players = {};
    this.scoreBoard = [];
}

DieCurve.prototype = {
    addPlayer: function(id,name)
    {
        player = new Player(id,random(0,360), random(0,750),random(0,750),color.randomColor(),name);
        if(typeof this.players[id] == 'undefined')
            this.players[id] = player;

    },
    sendCmdToPlayer : function (cmd, id)
    {
        // console.log("Players: ");
        // console.log(this.players);
        // console.log("Dobil smo tale ukaz: " + cmd);
        // console.log("Dobil smo tale id: " + id);
        p = this.players[id];
        if(cmd == "hit")
            this.playerCollided(p);
        else if(cmd == "left")
            p.left();
        else
            p.right();
    },
    getPlayers: function () {
        return this.players;
    },
    removePlayer: function (id) {
        this.players = this.players.filter(function(obj) {
            return id === -1;
        });
    },
    updatePlayers: function() {
        // console.log("Updatam vse playerje");
        // console.log(this.players);
        for (var key in this.players) {
            if (this.players.hasOwnProperty(key)) {
//                    alert("Tle not smo");
                var player = this.players[key];
                player.updateCoordinates();
                if (player.cX < 0 || player.cX > 900 || player.cY < 0 || player.cY > 900) {
                    this.playerCollided(player);
                }
            }
        }
    },
    playerCollided: function(player)
    {
        player.playing = false;
        this.updatePlayerScoreBoard(player.id);
    },
    updatePlayerScoreBoard: function(idPlayer)
    {
        scoreBoard[idPlayer] = this.players.length - this.remainingPlayers();
    },
    remainingPlayers: function()
    {
        var counter = 0;
        this.players.forEach(function(player) {
           if(player.playing == true)
               counter++;
        });
        return counter;
    },
    run:function(ws)
    {
        console.log()
        var that = this;

        // return;
        setInterval(function()
            {
                that.updatePlayers();
                // console.log(that);
                ws.send(JSON.stringify({"type": "gameinfo", "game": that}));
            }
        ,50,[ws,that]);
    }
};
module.exports = DieCurve;

function random(min,max)
{
    return Math.random() * (max - min) + min;
}