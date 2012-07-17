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
        result.gameId = elements[0];
        result.operation = elements[1];
        result.operationName = GameMessage.types[elements[1]] || GameMessage.types[0];
        result.state = elements[2];
        result.data = (elements.length > 3 && elements[3] ? JSON.parse(elements[3]) : null);
        return result;
    }
};