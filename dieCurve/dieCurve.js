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
    this.scoreBoard = {};
    this.interval;
    this.scoreBoardID;
    this.running = false;
    this.playersCounter = 0;
}

DieCurve.prototype = {
    addPlayer: function(id,name)
    {
        player = new Player(id,random(0,360), random(0,750),random(0,750),color.randomColor(),name);
        player.scoreBoardID = this.playersCounter++;
        if(typeof this.players[id] == 'undefined') {
            this.players[id] = player;
            this.scoreBoard[player.scoreBoardID] = 0;
        }


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
        this.updatePlayerScoreBoard(player.scoreBoardID);
    },
    updatePlayerScoreBoard: function(idPlayer) {
        remaining = this.remainingPlayers();
        console.log("je še toliko igralcev: "+ remaining);
        console.log("izračunal sem : " + this.playersCounter + ' - ' + remaining);
        this.scoreBoard[idPlayer] += this.playersCounter - remaining;
        if (remaining == 1) {
            this.awardLastPlayer();
            this.stopRunning();
        }
    },
    awardLastPlayer : function()
    {
        for (var key in this.players) {
            if (this.players.hasOwnProperty(key)) {
//                    alert("Tle not smo");
                var player = this.players[key];
                if(player.playing == true)
                    this.scoreBoard[player.scoreBoardID] += this.playersCounter;
            }
        }
    },
    remainingPlayers: function()
    {
        var counter = 0;
        for (var key in this.players) {
            if (this.players.hasOwnProperty(key)) {
//                    alert("Tle not smo");
                var player = this.players[key];
                if(player.playing == true)
                    counter++;
            }
        }
        return counter;
    },
    run:function(ws)
    {
        ws.send(JSON.stringify({type:"initScoreboard",game:this}));
        if(!this.running)
        {
            this.running=true;
            var that = this;
            this.interval = setInterval(function()
                {
                    that.updatePlayers();
                    // console.log(that);
                    ws.send(JSON.stringify({"type": "gameinfo", "game": that}));
                }
            ,50,[ws,that]);
        }
    },
    stopRunning:function()
    {

        clearInterval(this.interval);
        this.running=false;
        console.log("dieCurve stopped running");
    }
};
module.exports = DieCurve;

function random(min,max)
{
    return Math.random() * (max - min) + min;
}