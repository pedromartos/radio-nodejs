$(document).ready(function(){

    var socket = io.connect('http://187.55.96.212:3000/');

    var $chat = $('.chat-content');
    var $field = $('.chat .field');
    var $button = $('.chat .btn');

    /**
     * REAL-TIME EVENTS
     */
    // on connection to server, ask for user's name with an anonymous callback
    socket.on('connect', function(){
        // call the server-side function 'adduser' and send one parameter (value of prompt)
//        socket.emit('adduser', prompt("What's your name?"));
        socket.emit('adduser', 'User');
    });

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('updatechat', function (data) {

        var css = '';
        if(data.username == 'SERVER'){
            css = ' server';
        }

        $chat.append('<div class="message' + css + '"><strong>' + data.username + ':</strong> ' + data.message + '</div>');

        // Go to the end of block
        $chat.scrollTop($chat[0].scrollHeight);
    });

    // listener, whenever the server emits 'updateusers', this updates the username list
    socket.on('setuser', function(data) {
        $chat.attr('data-user', data);
    });


    /**
     * EVENT HANDLERS
     */
    // when the client clicks SEND
    $button.click( function() {
        var message = $field.val();
        $field.val('');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);
    });

    // when the client hits ENTER on their keyboard
    $field.keypress(function(e) {
        if(e.which == 13) {
            $button.click();
        }
    });


});