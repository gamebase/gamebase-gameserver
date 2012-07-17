var expect = require('chai').expect,
    WebSocket = require('ws'),
    GameServer = require('../lib/gameserver'),
    LobbyMessage = require('../../shared/dist/commonjs/Messages').LobbyMessage,
    server;
    
    
describe('LobbyServer tests', function() {
    
    before(function(done) {        
        server = new GameServer({ port: 3334 }, done);        
    });
   
    it('should be able to connect, and create a game, and list the games', function(done) {
        
        var ws = new WebSocket('ws://localhost:3334'),
            messageNum = 0;
        
        ws.on('open', function() {
            ws.send(LobbyMessage.format(1));
            messageNum++;
        });
        
        ws.on('message', function(message) {

            var msg = LobbyMessage.parse(message);
            
            if (messageNum === 1) {
                ws.send(LobbyMessage.format(10, 1, {gameName: 'Test Game'}));
                messageNum++;
            } else if (messageNum === 2) {
                
                if (msg.operationName == 'NewGame') {
                    expect(msg.state).to.equal('1');
                    ws.send(LobbyMessage.format(1));
                } else if (msg.operationName === 'ListGames') {
                    expect(msg.data.games[0].name).to.equal('Test Game');
                    
                    ws.send(GameMessage.format('Test Game', 11));
                    messageNum++;
                }
            } else if (messageNum === 3) {
                console.log(message);
                done();
            }
                        
        });
            
    });
    
    
});