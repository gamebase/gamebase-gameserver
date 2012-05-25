var _ = require('underscore'),
    async = require('async'),
    Bison = require('bison'),
    events = require('events'),
    util = require('util'),
    WebSocketServer = require('ws').Server,
    Game = require('./game/game'),
    messages = require('../../shared/pkg/cjs/Messages'),
    LobbyMessage = messages.LobbyMessage,
    GameMessage = messages.GameMessage,
    messageHandlers = {
        '0': 'onLobbyMessage',
        '1': 'onGameMessage'
    };


/**
  Create a GameServer
 **/
function GameServer(config, callback) {
    
    events.EventEmitter.call(this);
    
    var myself = this;
    config = config || {};
    this.games = {};
    this.gameCount = 0;
    this.clientCount = 0;
    this.clients = {};
    
    this.server = new WebSocketServer({port: config.port || 6456}, function() {

        myself.server.on('connection', _.bind(myself.onConnect, myself));    
        console.log('Server listening on port ' + (config.port || 6456));
        
        if (callback) {
            callback();
        }
    });
    
};
util.inherits(GameServer, events.EventEmitter);

/**
  Returns a unique client id
 **/
GameServer.prototype.createClientId = function() {
    this.clientCount++;
    return this.clientCount + '-' + Math.round(Math.random(99) * 1000);    
};

/**
  Called when a ws connection occurs
 **/
GameServer.prototype.onConnect = function(ws) {
    var id = this.createClientId(),
        client = {
            id: id,
            ws: ws
        },
        server = this;
    this.clients[id] = client;
    
    // Remove the connection from the clients list
    ws.on('close', function() {
        server.emit('clientDisconnected', client);
        delete server.clients[id];
    });
    
    // Add the message listeners
    ws.on('message', function(message) {
       server.onMessage(client, message);
    });
    
    server.emit('clientConnected', client);
};

/**
  Handle the game server receiving a message
 **/
GameServer.prototype.onMessage = function(client, message) {    
    
    for (var mType in messageHandlers) {
        if (message.indexOf(mType) === 0 && this[messageHandlers[mType]]) {
            this[messageHandlers[mType]](client, message);
            return;
        }
    }
    
    this.emit('unhandledMessage', client, message);
}

/**
  Handles a lobby message
 **/
GameServer.prototype.onLobbyMessage = function(client, message) {
    
    var msg = LobbyMessage.parse(message),
        handler;
    if (!msg) return;
    
    handler = 'on' + msg.operationName;
    if (this[handler]) {
        this[handler](client, msg);
    } else {
        this.emit('lobbyMessage', client, message);
    }
}

/**
  Creates a new game    
 **/
GameServer.prototype.onNewGame = function(client, message) {
    
    var name = message.data.gameName;
    if (this.games[name]) {
        // Send the failure
        this._sendToClient(client, GameMessage.format(message.operation, 0, {error: 'Game already exists'}));
    } else {
        var game = new Game(message.data);
        this.games[name] = game;
        // Send the ok
        this._sendToClient(client, GameMessage.format(message.operation, 1));
        this.emit('gameCreated', game);
    }    
}

/**
  Handles a player joining a game
 **/
GameServer.prototype.onJoinGame = function(client, message) {
    var name = message.data.gameName,
        game = this.games[name];
    if (!game) {
        // No game, send failure
        this._sendToClient(client, GameMessage.format(message.operation, 0, {error: 'Game not found'}));
    } else {
        if (game.isFull()) {
            this._sendToClient(client, GameMessage.format(message.operation, 0, {error: 'Game is full'}));
        } else {
            game.addClient(client);
            this._sendToClient(client, GameMessage.format(message.operation, 1));
        }
    }
}

/**
  Sends the list of games to the client
 **/
GameServer.prototype.onListGames = function(client, message) {
    var gameList = _.map(this.games, function(value, key) {
        return {name: key, currentPlayers: value.currentPlayerCount(), maxPlayers: value.maxPlayers};
    });
    
    this._sendToClient(client, LobbyMessage.format(message.operation, 1, {games: gameList}));
}

/**
  Sends a message to all the clients
 **/
GameServer.prototype._send = function(message) {
    var bMessage = JSON.stringify(message),
        client = null,
        options = null;
    for (clientId in this.clients) {
        client = this.clients[clientId];
        this._sendToClient(client, bMessage, options);
    }
}

/**
  Sends a message to a single client
 **/
GameServer.prototype._sendToClient = function(client, message, options, callback) {
    if (!client || !client.ws) return;
    client.ws.send(message, options, callback);
}

module.exports = GameServer;