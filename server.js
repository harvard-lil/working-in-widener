var app = require('express')()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server)

server.listen(3000)

// routing
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/index.html');
});
app.get('/style.css', function (req, res) {
    res.sendfile(__dirname + '/static/style.css');
});
app.get('/shelve-game.js', function (req, res) {
    res.sendfile(__dirname + '/static/shelve-game.js');
});


var player_data = {};

// Socket.io business
//io.set('loglevel',10) // set log level to get all debug messages

io.on('connection',function(socket){
    socket.on('move', function (data) {
        player_data[data.p] = {b: data.b, i: data.i, j: data.j};
        socket.emit('board_update', player_data);
    });
})






