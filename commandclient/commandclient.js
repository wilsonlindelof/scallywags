
var sessionId = null;
var nickname = '';
var UID = '';
var team = 'grey';
var role = 'spectator';

var helloButton2 = document.getElementById('helloButton2');
var joinGameButton = document.getElementById('joinGameButton');
var redTeamButton = document.getElementById('redTeamButton');
var blueTeamButton = document.getElementById('blueTeamButton');

helloButton2.addEventListener('click', function() {
	console.log('HELLO BUTTON2');
	var state2 = {
		'x': '150',
		'y': 100
	};
	webrtc.sendDirectlyToAll('someLabel', 'someType', state2);
}, false);

joinGameButton.addEventListener('click', function() {
	console.log('Join Game');
	var gameCodeInput = document.getElementById('gameCode');	
	var gameCode = gameCodeInput.value;
	var nicknameInput = document.getElementById('nickname');
	nickname = nicknameInput.value;
	if (!nickname || !(nickname.length > 0)) {
		console.log('ENTER YOUR NICKNAME');
	} else {
		console.log(gameCode);
		webrtc.joinRoom(gameCode, function (err, res) {
			console.log('joined', gameCode, err, res);
			UID = generateUID(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
			var player = {
				'nickname': nickname,
				'UID': UID,
				'team': team,
				'role': role
			};
			document.getElementById('initialInput').style.display = 'none';
			document.getElementById('teamAndRoleInput').style.display = 'block';
			setTimeout(function() {
				console.log('just gonna send it');
				webrtc.sendDirectlyToAll('GAME', 'PLAYER_JOINED', player);
			}, 1000);			
		});
	}
}, false);

redTeamButton.addEventListener('click', function() {
	console.log('Join Red Team');
	team = 'red';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_TEAM', player);
}, false);

blueTeamButton.addEventListener('click', function() {
	console.log('Join Blue Team');
	team = 'blue';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_TEAM', player);
}, false);

function generateUID(length, chars) {
	console.log("GENERATE UID");
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

var webrtc = new SimpleWebRTC({
    autoRequestMedia: false,
	debug: false,
	enableDataChannels: true,
});

// we have to wait until it's ready
webrtc.on('readyToCall', function () {		
    // you can name it anything
	console.log('READY TO CALL THIS HSOULDNT HAPPEN');
    /*webrtc.joinRoom(room, function (err, res) {
        console.log('joined', room, err, res);
    });*/
});

initialize = function() {
	console.log('INITIALIZE');
	
	/*webrtc.joinRoom(room, function (err, res) {
		console.log('joined', room, err, res);
	});*/
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