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
}

dieCurve.prototype = {
    addPlayer: function(id)
    {
        player = new Player(id,random(0,360), random(0,600),random(0,600),color.randomColor());
        this.players[id] = player;

    },
    sendCmdToPlayer : function (cmd, id)
    {
        p = this.players[id];
        if(cmd == "left")
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
    }
};
module.exports = dieCurve;

function random(min,max)
{
    return Math.random() * (min - max) + min;
}