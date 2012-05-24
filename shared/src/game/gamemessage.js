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
        return GameMessage.messageId + '|' + gameId + '|' + op + (state ? '|' + state + (data ? '|' + JSON.stringify(data) : '') : '');
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

        result.operation = elements[0];
        result.operationName = GameMessage.types[elements[0]] || GameMessage.types[0];
        result.state = (elements.length > 1 && elements[1] ? elements[1] : null);
        result.data = (elements.length > 2 && elements[2] ? JSON.parse(elements[2]) : null);
        return result;
    }
};