/**
 * Created by David on 14. 12. 2016.
 */
var color = require('randomcolor')
var Player = require('./player');

function dieCurve(canvas, gameName, gameID)
{
    this.canvas = canvas;
    this.GameName = gameName;
    this.gameID = gameID;
    this.players = [];
    this.scoreBoard = [];
}

dieCurve.prototype = {
    addPlayer: function(id,name)
    {
        player = new Player(id,random(0,360), random(0,750),random(0,750),color.randomColor(),name);
        if(typeof this.players[id] == 'undefined')
            this.players[id] = player;

    },
    sendCmdToPlayer : function (cmd, id)
    {
        p = this.players[id];
        if(cmd == "hit")
            this.playerCollided(p);
        else if(cmd == "left")
            p.left();
        else
            p.right();X
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
        this.players.forEach(function(player){
            player.updateCoordinates();
            if(player.cX < 0 || player.cX > 900 ||player.cY < 0 || player.cY > 900)
            {
                this.playerCollided(player);
            }
        });
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
        setInterval(function()
        {
            this.updatePlayers();
            ws.send(JSON.stringify({"type": "gameinfo", "game": this}));
        },50);


    }
};
module.exports = dieCurve;

function random(min,max)
{
    return Math.random() * (max - min) + min;
}