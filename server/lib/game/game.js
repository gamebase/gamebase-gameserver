var _ = require('underscore'),
    events = require('events'),
    util = require('util'),
    handlers = {
        JoinGame: 'onJoinGame'        
    };

function Game(config, creator) {
    config = config || {};
    this.name = config.gameName || 'Unknown game';
    this.maxPlayers = config.maxPlayers || 6;
    this.clients = [];
    this.creator = creator;
}
util.inherits(Game, events.EventEmitter);

/**
  Returns true if the game is full
 **/
Game.prototype.isFull = function() {
    return this.clients.length >= this.maxPlayers;
}

/**
  Adds a client to the game
 **/
Game.prototype.addClient = function(client) {
    this.clients.push(client);
    this.emit('clientJoined', client);
}

Game.prototype.currentPlayerCount = function() {
    return this.clients.length;
}

/**
  Receives a message, be it passed through from the game server or another
  mechanism
 **/
Game.prototype.onMessage = function(client, message) {
    
    if (!message || !message.operationName) return;
    
    var handler = this[handlers[message.operationName]];    
    if (handler) {
        handler.call(this, client, message);
    }
}

/**
  Handle an attempted player join
 **/
Game.prototype.onJoinGame = function(client, message) {
    
    if (_.find(this.clients, function(cln) { return cln.id == client.id })) {
        client.sendMessage(GameMessage.format(this.name, message.operation, 0, {error: 'Already joined'}));
    } else if (this.clients.length >= this.maxPlayers) {
        // Reject player join
        client.sendMessage(GameMessage.format(this.name, message.operation, 0, {error: 'Game is full'}));
    } else {
        this.addClient(client);
        client.sendMessage(GameMessage.format(this.name, message.operation, 1));
    }
}

/**
  Broadcasts a message to all players
 **/
Game.prototype.broadcast = function(message) {
    
    if (!this.clients) return;
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].sendMessage(message);
    }
    
}

module.exports = Game;

