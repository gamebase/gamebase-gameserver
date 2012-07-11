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

        result.operation = elements[0];
        result.operationName = LobbyMessage.types[elements[0]] || LobbyMessage.types[0];
        result.state = (elements.length > 1 && elements[1] ? elements[1] : null);
        result.data = (elements.length > 2 && elements[2] ? JSON.parse(elements[2]) : null);
        return result;
    }
};