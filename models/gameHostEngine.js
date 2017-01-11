/**
 * Created by David on 10. 01. 2017.
 */

var r_dieCurve = require('../dieCurve/dieCurve');

function GameHostEngine(hostWs)
{
    this.game;
    this.hostWs = hostWs;
    this.ready = false;
    this.gameIsSelected = false;
}
GameHostEngine.prototype = {
    selectGame : function(gameName)
    {
        if(gameName = "dieCurve") {
            this.game = new r_dieCurve('nimaveze', 'dieCurve', 1);
            this.gameIsSelected == true;
        };
        // else if pride kaki drugi spil tle not

    },
    updateHost : function (hostWs)
    {
        this.hostWs = hostWs;
    },
    runGame : function()
    {   // vsak špil mora met napisan RUN funkcijo, v kateri se špil začne izvajat
        if(this.ready)
            this.game.run(this.hostWs);
        else
            console.log("Not all players are ready!");
    },
    ready : function()
    {   // Ko so vsi igralci v seji ready uporabmo to funkcijo
        this.ready == true;
    },
    isGameSelected : function () {
        return this.gameIsSelected;
    },
    addPlayers: function(clients){
        clients.forEach(function(client){
            this.game.addPlayer(client.id,client.name);
        });
    }
};

module.exports = GameHostEngine;