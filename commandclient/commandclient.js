
var sessionId = null;
var nickname = '';
var UID = '';
var team = 'grey';
var role = 'spectator';

var joinGameButton = document.getElementById('joinGameButton');
var redTeamButton = document.getElementById('redTeamButton');
var blueTeamButton = document.getElementById('blueTeamButton');
var navigatorButton = document.getElementById('navigatorButton');
var gunnerTeamButton = document.getElementById('gunnerTeamButton');
var shootLeftButton = document.getElementById('shootLeftButton');
var shootRightButton = document.getElementById('shootRightButton');
var startGameButton = document.getElementById('startGameButton');
var compass = document.getElementById('compass');

joinGameButton.addEventListener('click', function() {
	console.log('Join Game');
	var gameCodeInput = document.getElementById('gameCode');	
	var gameCode = gameCodeInput.value.toUpperCase();
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
			document.getElementById('teamInput').style.display = 'block';
			document.getElementById('roleInput').style.display = 'block';
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
	role = 'spectator';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_TEAM', player);
	document.getElementById('redTeamButton').style.display = 'none';
	document.getElementById('blueTeamButton').style.display = 'block';
	document.getElementById('navigatorButton').style.display = 'block';
	document.getElementById('gunnerTeamButton').style.display = 'block';
}, false);

blueTeamButton.addEventListener('click', function() {
	console.log('Join Blue Team');
	team = 'blue';
	role = 'spectator';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_TEAM', player);
	document.getElementById('blueTeamButton').style.display = 'none';
	document.getElementById('redTeamButton').style.display = 'block';
	document.getElementById('navigatorButton').style.display = 'block';
	document.getElementById('gunnerTeamButton').style.display = 'block';
}, false);

navigatorButton.addEventListener('click', function() {
	console.log('play as nav');
	role = 'navigator';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_ROLE', player);
	document.getElementById('navigatorButton').style.display = 'none';
	document.getElementById('gunnerTeamButton').style.display = 'block';
}, false);

gunnerTeamButton.addEventListener('click', function() {
	console.log('play as gunn');
	role = 'gunner';
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'PLAYER_SELECTED_ROLE', player);
	document.getElementById('gunnerTeamButton').style.display = 'none';
	document.getElementById('navigatorButton').style.display = 'block';
}, false);

startGameButton.addEventListener('click', function() {
	console.log('Start Game');
	var player = {
		'nickname': nickname,
		'UID': UID,
		'team': team,
		'role': role
	};
	webrtc.sendDirectlyToAll('GAME', 'START_GAME', player);
}, false);

shootLeftButton.addEventListener('click', function() {
	console.log('Shoot Left clicked');
	var command = {
		'direction': 'LEFT',
		'team': team
	};
	webrtc.sendDirectlyToAll('GAME', 'GUNNER', command);
}, false);

shootRightButton.addEventListener('click', function() {
	console.log('Shoot Right clicked');
	var command = {
		'direction': 'RIGHT',
		'team': team
	};
	webrtc.sendDirectlyToAll('GAME', 'GUNNER', command);
}, false);

compass.addEventListener('click', function(event) {
	console.log('compass clicked');

	let height = compass.height;
	let center = compass.height / 2;
	let clickX = event.offsetX;
	let clickY = event.offsetY;
	let centerDiffX = clickX - center;
	let centerDiffY = clickY - center;
	
	let degreesAdj = (((Math.atan2(centerDiffY, centerDiffX) * 180) / Math.PI + 180) - 90);
	if (degreesAdj < 0) {
		degreesAdj = degreesAdj + 360;
	}
	degreesAdj = +(degreesAdj.toFixed(0));
	console.log(degreesAdj);
	
	var command = {
		'desiredDegree': degreesAdj,
		'team': team
	};
	webrtc.sendDirectlyToAll('GAME', 'NAVIGATION', command);
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

webrtc.on('channelMessage', function (peer, label, data) {
	
	//game client should only listen to GAME label messages
	if (label === 'COMMAND') {
		console.log("ON MESSAGE", peer, label, data);
		console.log("PEER", peer);
		console.log("LABEL", label);
		console.log("DATA", data);
		switch (data.type) {
			case 'FIRST_PLAYER':
				console.log('first player');
				if (data.payload.UID === UID) {
					console.log('you are the first player');
					document.getElementById('startGame').style.display = 'block';
				} else {
					console.log('you are not the first player');
				}
				break;
			case 'GAME_STARTING':
				console.log('game is starting');
				document.getElementById('startGame').style.display = 'none';
				document.getElementById('teamInput').style.display = 'none';
				document.getElementById('roleInput').style.display = 'none';
				document.getElementById('titleSection').style.display = 'none';
				if (role === 'navigator') {
					document.getElementById('navigatorCommands').style.display = 'block';
				} else if (role === 'gunner') {
					document.getElementById('gunnerCommands').style.display = 'block';
				}
				break;
			default:
				console.log('WARNING, ERROR! TYPE DIDNT MATCH!');
		}
	} else {
		console.log('ignoring message');
	}
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