function Session(idRoom,isLocked,admin,game)
{
    this.idRoom = idRoom;
    this.clients = [];
    this.isLocked = isLocked;
    this.admin = admin;
    this.game = game;
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

    addClient: function(clientID)
    {
      this.clients.push(clientID);
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
    }
};

module.exports = Session;
