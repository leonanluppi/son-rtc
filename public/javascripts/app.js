(function() {
    var app  = {
        peers: []
    };

    app.events = {
        newPeer: function newPeer() {
            $('#id').text(app.peer.id);
        },
        checkRTC: function checkRTC(cb) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!navigator.getUserMedia) {
                return cb({ err: 'Unssuported RTC' }, false);
            }

            navigator.getUserMedia({ audio: true, video: true }, cb, function(err) {
                console.err('An error occured: ', err);
            });
        },
        onReceiveStream: function onReceiveStream(stream, element_id) {
            var video = $('#' + element_id + ' video')[0];
            video.src = window.URL.createObjectURL(stream);
            window.peer_stream = stream;
        },
        peerConnect: function peerConnect(con) {
            app.peer.peer_id = con.peer;
            app.peer.con     = con;
            // con.on('data', handleMessage);

            $('.pattern_peer_id_connected').addClass('hidden').val(peer_id);
            $('#text_connected_peer').removeClass('hidden');
            $('#connected_peer').text(con.metadata.username);
        },
        onReceiveCall: function onReceiveCall(call) {
            call.answer(window.localStream);
            call.on('stream', function(stream){
              window.peer_stream = stream;
              app.events.onReceiveStream(stream, 'pattern-camera');
            });
        },
        peerCall: function peerCall(call) {
            return app.events.onReceiveCall(call);
        }
    };

    app.events.user = {
        login: function login() {
            var data = {
                username: $('#username').val(),
                peer_id: $('#peer_id').val()
            };

            if (data.peer_id) {
                app.peers.push(data);
                con = app.peer.connect(data.peer_id, { metadata: data });
                con.on('data', app.events.user.handleMessage);
            }

            $('.main').removeClass('hidden');
            $('.login-container').addClass('hidden');
        },
        call: function call() {
            console.log('calling: ', app.peer.peer_id);

            var call = app.peer.call(app.peer.peer_id, window.localStream);

            call.on('stream', function(stream) {
              window.peer_stream = stream;
              app.events.onReceiveStream(stream, 'pattern-camera');
            });
        },
        handleMessage: function handleMessage(data) {
            return $('#editor').val(data.editor);
        },
        editing: function editing() {
            var editor = $('#editor').val();
            var data = {
                editor: editor
            };

            app.peer.con.send(data);
            app.events.user.handleMessage(data);
            $('#message').val('');
        }
    }

    app.init = function init() {
        app.peer = new Peer({
            host: 'localhost',
            port: 9000,
            path: '/peerjs',
            debug: 3
        });

        app.peer.on('open', app.events.newPeer);
        app.peer.on('connection', app.events.peerConnect);
        app.peer.on('call', app.events.peerCall);

        app.events.checkRTC(function(stream) {
            window.localStream = stream;
            app.events.onReceiveStream(stream, 'my-camera');
        });

        $('#login').on('click', app.events.user.login);
        $('#call').on('click', app.events.user.call);
        $('#editor').on('input propertychange paste', app.events.user.editing);
    };

    app.init();
})();
