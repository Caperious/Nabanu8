/**
 * Created by David on 10. 01. 2017.
 */

var DieCurve = require('../dieCurve/dieCurve');

function GameHostEngine(hostWs)
{
    this.currentGame;
    this.hostWs = hostWs;
    this.ready = false;
    this.gameIsSelected = false;
}
GameHostEngine.prototype = {
    selectGame : function(gameName)
    {
        // console.log("I got this gameName: " + gameName);
        if(gameName == "dieCurve") {
            console.log("Okej zdej bom naštimou en dieCurve");
            this.currentGame = new DieCurve('nimaveze', 'dieCurve', 1);
            this.gameIsSelected = true;
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
            this.currentGame.run(this.hostWs);
        else
            console.log("Not all players are ready!");
    },
    readySteady : function()
    {   // Ko so vsi igralci v seji ready uporabmo to funkcijo
        this.ready = true;
    },
    isGameSelected : function () {
        console.log("Game is selected : " + this.gameIsSelected);
        return this.gameIsSelected;
    },
    addPlayers: function(clients){
        // console.log("========================GAME==============================");
        // console.log(this.currentGame);
        // console.log(clients);
        for(var i = 0; i < clients.length; i++)
        {
            // console.log(clients[i]);
            this.currentGame.addPlayer(clients[i].id,clients[i].name);
        }
    }
};

module.exports = GameHostEngine;