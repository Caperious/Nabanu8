var GameHostEngine = require('./gameHostEngine');

function Session(idRoom,isLocked,host,admin,game)
{
    this.hostWS = host;
    this.idRoom = idRoom;
    this.clients = [];
    this.isLocked = isLocked;
    this.admin = admin;
    this.game = game;
    this.gameHostEngine = new GameHostEngine(this.host);
}

Session.prototype = {
    getAll: function()
    {
      return this;
    },

    getIdRoom: function ()
    {
      return this.idRoom;
    },

    setIdRoom: function(idRoom)
    {
      this.idRoom = idRoom;
    },

    getClients: function () {
        return this.players;
    },

    getNumberOfClients: function()
    {
      return this.clients.length;
    },

    addClient: function(client)
    {
      this.clients.push(client);
    },

    removeClient: function (clientID)
    {
        this.clients.splice(indexOf(clientID),1);
    },

    getAdmin:function()
    {
      return this.admin;
    },

    setAdmin : function (clientID)
    {
      this.admin = clientID;
    },

    getIsLocked:function()
    {
      return this.isLocked;
    },

    setIsLocked:function()
    {
      return !this.isLocked;
    },
    getHost:function()
    {
        return this.hostWS;
    },
    setHost:function (hostWS) {
        this.hostWS = hostWS;
        this.gameHostEngine.updateHost(this.hostWS);
    }

};

module.exports = Session;
