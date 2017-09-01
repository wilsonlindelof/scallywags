
var sessionId = null;
var room = 'ZJPRO69420';

var webrtc = new SimpleWebRTC({
    autoRequestMedia: false,
	debug: true,
	enableDataChannels: true,
});

// we have to wait until it's ready
webrtc.on('readyToCall', function () {		
    // you can name it anything
	console.log('READY TO CALL');
	webrtc.createRoom(room, function (err, res) {
        console.log('joined', room, err, res);
    });
});

initialize = function() {
	console.log('INITIALIZE');
	webrtc.createRoom(room, function (err, res) {
		console.log('joined', room, err, res);
	});
}

// time to log when thing has started
webrtc.on('connectionReady', function (sessionIdIncoming) {		
    console.log('SESSION ID: ', sessionIdIncoming);
	sessionId = sessionIdIncoming;
});

// time to log when something has joined us!
webrtc.on('createdPeer', function (peer) {		
    console.log('CREATED PEER: ', peer);
});

// log when we leave
webrtc.on('leftRoom', function (roomName) {		
    console.log('LEFT ROOM BYE BYE: ', roomName);
});

getPeers = function() {		
	console.log('get peers!');
	setTimeout(function() {
		if (sessionId) {
			var peers = webrtc.getPeers(sessionId);
			console.log('PEERS ', peers);
		} else {
			console.log('Didnt get peers because sessionId is ', sessionId);
		}
		getPeers();
	}, 5000);
}

getPeers();
initialize();