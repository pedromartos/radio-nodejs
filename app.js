/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { pretty:true });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('LadoDireito'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src:__dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// Socket.IO
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.emit('updatechat', {username: socket.username, message: data});
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(username){
        // we store the username in the socket session for this client
        socket.username = username;
        // echo to client they've connected
        socket.emit('updatechat', {username: 'SERVER', message: 'you have connected'});
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('updatechat', {username: 'SERVER', message: username + ' has connected'});
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', {username: 'SERVER', message: socket.username + ' has disconnected'});
    });

});