var events = require('events'),
    util = require('util');

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

module.exports = Game;

