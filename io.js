var IO = require('socket.io')();

IO.on('connection', function(socket) {
    console.log('Connected to Socket');
      socket.on('chat message', function(msg){
        console.log('message: ' + msg);
      });
});

module.exports = IO;