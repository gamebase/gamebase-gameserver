/**
  The GameClient provides functionality for interacting with a client via a WebSocket
  connection
 **/
function GameClient(id, ws, opts) {
    
    this.id = id;
    this.ws = ws;
    this.opts = opts;
        
}

/**
  Sends a message to a single client
 **/
GameClient.prototype.sendMessage = function(message, options, callback) {
    if (!this.ws) return;
    this.ws.send(message, options, callback);
}

module.exports = GameClient;