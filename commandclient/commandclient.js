
var sessionId = null;
var room = 'ZJPRO69420';

var helloButton = document.getElementById('helloButton');
var helloButton2 = document.getElementById('helloButton2');

helloButton.addEventListener('click', function() {
	console.log('HELLO BUTTON');
	var state = {
		'x': '50',
		'y': 0
	};
	webrtc.sendToAll('someType', state);
}, false);

helloButton2.addEventListener('click', function() {
	console.log('HELLO BUTTON2');
	var state2 = {
		'x': '150',
		'y': 100
	};
	webrtc.sendDirectlyToAll('someLabel', 'someType', state2);
}, false);

var webrtc = new SimpleWebRTC({
    autoRequestMedia: false,
	debug: true,
	enableDataChannels: true,
});

// we have to wait until it's ready
webrtc.on('readyToCall', function () {		
    // you can name it anything
	console.log('READY TO CALL');
    webrtc.joinRoom(room, function (err, res) {
        console.log('joined', room, err, res);
    });
});

initialize = function() {
	console.log('INITIALIZE');
	
	webrtc.joinRoom(room, function (err, res) {
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


initialize();