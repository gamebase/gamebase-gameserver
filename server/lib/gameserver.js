var _ = require('underscore'),
    async = require('async'),
    Bison = require('bison'),
    events = require('events'),
    util = require('util'),
    WebSocketServer = require('ws').Server,
    Game = require('./game/game'),
    GameClient = require('./client/client'),
    messages = require('../../shared/dist/commonjs/Messages'),
    messageParser = messages.Parser,
    LobbyMessage = messages.LobbyMessage,
    GameMessage = messages.GameMessage,
    messageHandlers = {
        lobby: 'onLobbyMessage',
        game: 'onGameMessage'
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
        client = new GameClient(id, ws),
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
GameServer.prototype.onMessage = function(client, payload) {    
    
    var message = messageParser.parse(payload),
        handler;
    
    if (message && message.type) {        
        handler = this[messageHandlers[message.type]];
        if (handler) {
            handler.call(this, client, message);
            return;
        }    
    }
        
    this.emit('unhandledMessage', client, message);
}

/**
  Handles a lobby message
 **/
GameServer.prototype.onLobbyMessage = function(client, msg) {
    
    if (!msg || !msg.operationName) return;
    
    var handler = 'on' + msg.operationName;
    if (this[handler]) {
        this[handler](client, msg);
    } else {
        this.emit('lobbyMessage', client, message);
    }
}

/**
  Handles a game messsage
 **/
GameServer.prototype.onGameMessage = function(client, message) {
    if (!message || !message.gameId) return;    
    var game = this.games[message.gameId];    
    if (game) {
        game.onMessage(client, message);
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
        var game = new Game(message.data, client);
        this.games[name] = game;
        // Send the ok
        client.sendMessage(GameMessage.format(message.operation, 1));
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

    client.sendMessage(LobbyMessage.format(message.operation, 1, {games: gameList}));
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
        client.sendMessage(bMessage, options);
    }
}

module.exports = GameServer;