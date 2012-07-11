//= game/gamemessage.js
//= lobby/lobbymessage.js

Messages = {
    GameMessage: GameMessage,
    LobbyMessage: LobbyMessage
};

MessageParser = {
    parse: function(message) {
        var elements = message.split("|"),
            messageType;

        if (elements.length > 0) {
            messageType = parseInt(elements[0]);
            for (var message in Messages) {
                if (Messages[message].messageId == messageType) {
                    return Messages[message].parse(message);
                }
            }
       }
       return null;
    }
}