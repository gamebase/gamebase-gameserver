


GameMessage = {
    messageId: 1,
    
    types: {
        11: 'JoinGame',
        12: 'LeaveGame',
        13: 'StartGame',
        14: 'PlayerReady',
        15: 'ListPlayers',
        20: 'PlayerAction',
        21: 'GameAction'
    },
    
    /**
      Formats a message into the generic transfer format
     **/
    format: function(gameId, op, state, data) {
        var extra = '';
        if (data) {
            extra = '|' + JSON.stringify(data);
        }
        return GameMessage.messageId + '|' + gameId + '|' + op + (state ? '|' + state + extra : '');
    },
    
    /**
      Parses the message
     **/
    parse: function(message) {
        if (!message) return null;
        var elements = message.split('|'),
            result = {};
        if (!elements || elements.length < 3) return null;
        elements.shift();

        result.type = "game";
        result.operation = elements[0];
        result.operationName = GameMessage.types[elements[0]] || GameMessage.types[0];
        result.gameId = elements[1];
        result.state = element[2];
        result.data = (elements.length > 3 && elements[3] ? JSON.parse(elements[3]) : null);
        return result;
    }
};
LobbyMessage = {
    
    messageId: 0,
    
    types: {
        0: 'Unknown',
        1: 'ListGames',
        10: 'NewGame',
        11: 'RemoveGame'
    },
    
    /**
      Formats a message into the generic transfer format
     **/
    format: function(op, state, data) {
        var message = LobbyMessage.messageId + '|' + op + (state ? '|' + state + (data ? '|' + JSON.stringify(data) : '') : '');
        return message;
    },
    
    /**
      Parses the message
     **/
    parse: function(message) {
        if (!message) return null;
        var elements = message.split('|'),
            result = {};
        if (!elements || elements.length < 2) return null;
        // Remove the lobby message type from the front
        elements.shift();
    
        result.type = "lobby";
        result.operation = elements[0];
        result.operationName = LobbyMessage.types[elements[0]] || LobbyMessage.types[0];
        result.state = (elements.length > 1 && elements[1] ? elements[1] : null);
        result.data = (elements.length > 2 && elements[2] ? JSON.parse(elements[2]) : null);
        return result;
    }
};

Messages = {
    GameMessage: GameMessage,
    LobbyMessage: LobbyMessage
};

MessageParser = {
    
    split: function(message) {
        if (!message) return null;
        return message.split("|"); 
    },
    
    parse: function(message) {
        var elements = MessageParser.split(message),
            messageType;

        if (elements.length > 0) {
            messageType = parseInt(elements[0]);
            for (var messageCls in Messages) {
                if (Messages[messageCls].messageId == messageType) {
                    return Messages[messageCls].parse(message);
                }
            }
       }
       return null;
    }
}

if (typeof Messages != 'undefined') {
    module.exports = Messages;
}
