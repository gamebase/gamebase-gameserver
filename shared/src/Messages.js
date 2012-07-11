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
            for (var messageCls in Messages) {
                if (Messages[messageCls].messageId == messageType) {
                    return Messages[messageCls].parse(message);
                }
            }
       }
       return null;
    }
}