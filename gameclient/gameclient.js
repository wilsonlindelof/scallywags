
var sessionId = null;
var players = [];
var gameState = {};
var canvas = null;
var ctx = null;
var lastTime;
var shipSpeed = 30; //this should be based on dynamic wind eventually
var shipWidth = 10;
var shipHeight = 10;

//crossbrowser shim
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

var webrtc = new SimpleWebRTC({
    autoRequestMedia: false,
	debug: true,
	enableDataChannels: true,
});

// we have to wait until it's ready
webrtc.on('readyToCall', function () {		
    // you can name it anything
	console.log('READY TO CALL SHOULDNT HAPPEN');
	/*webrtc.createRoom(room, function (err, res) {
        console.log('joined', room, err, res);
    });*/
});

initialize = function() {
	console.log('INITIALIZE');
	var gameCode = generateGameCode(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
	var gameCodeSpan = document.getElementById('gameCode');
    gameCodeSpan.innerHTML = gameCode;
	webrtc.createRoom(gameCode, function (err, res) {
		console.log('joined', gameCode, err, res);
	});
}

function generateGameCode(length, chars) {
	console.log("GENERATE GAME CODE");
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
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

webrtc.on('channelMessage', function (peer, label, data) {
	/*if (label !== 'text chat') return;
	else if (data.type == 'chat') {
	console.log('Received message: ' + data.payload + ' from ' + peer.id);
	}*/
	//game client should only listen to GAME label messages
	if (label === 'GAME') {
		console.log("ON MESSAGE", peer, label, data);
		console.log("PEER", peer);
		console.log("LABEL", label);
		console.log("DATA", data);
		switch (data.type) {
			case 'PLAYER_JOINED':
				console.log('A new Player has joined!');
				var player = {
					'nickname': data.payload.nickname,
					'UID': data.payload.UID,
					'team': data.payload.team,
					'role': data.payload.role
				};
				players.push(player);
				if (players.length === 1) {
					webrtc.sendDirectlyToAll('COMMAND', 'FIRST_PLAYER', player);
				}
				updatePlayerLobby();				
				break;
			case 'PLAYER_SELECTED_TEAM':
				console.log('A player has selected a team');
				for (var i = 0; i < players.length; i++) {
					if (players[i].UID === data.payload.UID) {
						console.log(players[i], 'MATCH');
						console.log('going to set players team from ', players[i].team, ' to ', data.payload.team);
						console.log(players[i].team);
						players[i].team = data.payload.team;
						console.log(players[i].team);
					}
				}
				updatePlayerLobby();
				break;
			case 'START_GAME':
				console.log('start the game');
				webrtc.sendDirectlyToAll('COMMAND', 'GAME_STARTING', null);
				gameState = {
					'red': {
						'x': 100,
						'y': 500,
						'vectorX': 0,
						'vectorY': 1
					},
					'blue': {
						'x': 900,
						'y': 500,
						'vectorX': 0,
						'vectorY': -1
					}
				};
				document.getElementById('titleSection').style.display = 'none';
				document.getElementById('lobbySection').style.display = 'none';
				document.getElementById('gameCanvas').style.display = 'block';
				canvas = document.getElementById('canvas');
				ctx = canvas.getContext("2d");
				canvas.width = 1000;
				canvas.height = 1000;
				lastTime = Date.now();
				gameLoop();
				break;
			case 'NAVIGATION':
				console.log('navigation received');
				gameState[data.payload.team].vectorX = data.payload.vectorX;
				gameState[data.payload.team].vectorY = data.payload.vectorY;
				console.log('VECTORS: ', gameState[data.payload.team].vectorX, gameState[data.payload.team].vectorY);
				break;
			default:
				console.log('WARNING, ERROR! TYPE DIDNT MATCH!');
		}
	} else {
		console.log('ignoring message');
	}
});

function gameLoop() {
	var now = Date.now();
	var dt = (now - lastTime) / 1000.0;
	
	update(dt);
	render();
	
	lastTime = now;
	requestAnimFrame(gameLoop);
}

function update(dt) {
	
	gameState['red']['x'] = gameState['red']['x'] + (shipSpeed * dt * gameState['red']['vectorX']);
	gameState['red']['y'] = gameState['red']['y'] + (shipSpeed * dt * gameState['red']['vectorY']);
	
	gameState['blue']['x'] = gameState['blue']['x'] + (shipSpeed * dt * gameState['blue']['vectorX']);
	gameState['blue']['y'] = gameState['blue']['y'] + (shipSpeed * dt * gameState['blue']['vectorY']);
	
	if (gameState['red']['x'] < 0) {
		gameState['red']['x'] = 0;
	}
	if (gameState['red']['x'] > 1000) {
		gameState['red']['x'] = 1000;
	}
	if (gameState['red']['y'] < 0) {
		gameState['red']['y'] = 0;
	}
	if (gameState['red']['y'] > 1000) {
		gameState['red']['y'] = 1000;
	}
	
	if (gameState['blue']['x'] < 0) {
		gameState['blue']['x'] = 0;
	}
	if (gameState['blue']['x'] > 1000) {
		gameState['blue']['x'] = 1000;
	}
	if (gameState['blue']['y'] < 0) {
		gameState['blue']['y'] = 0;
	}
	if (gameState['blue']['y'] > 1000) {
		gameState['blue']['y'] = 1000;
	}
	//check collisions, bullets, etc
}

function render() {
	ctx.fillStyle = '#CCCCFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);//draw the ocean
	
	console.log('red', gameState['red']['x'], gameState['red']['y']);
	ctx.fillStyle = '#FF0000';
	ctx.fillRect(gameState['red']['x'] - 5, gameState['red']['y'] - 5, shipWidth, shipHeight);//draw the red
	
	ctx.fillStyle = '#0000FF';
	ctx.fillRect(gameState['blue']['x'] - 5, gameState['blue']['y'] - 5, shipWidth, shipHeight);//draw the blue
}

function updatePlayerLobby() {
	console.log('UPDATE PLAYER LOBBY');
	console.log(players);
	var redTeamPlayersDiv = document.getElementById('redTeamPlayers');
	var greyTeamPlayersDiv = document.getElementById('greyTeamPlayers');
	var blueTeamPlayersDiv = document.getElementById('blueTeamPlayers');
	
	var redTeamPlayersHTML = '<ul>';
	var greyTeamPlayersHTML = '<ul>';
	var blueTeamPlayersHTML = '<ul>';
	for (var i = 0; i < players.length; i++) {
		if (players[i].team === 'red') {
			redTeamPlayersHTML += '<li>' + players[i].nickname + ' - ' + players[i].role + '</li>';
		} else if (players[i].team === 'grey') {
			greyTeamPlayersHTML += '<li>' + players[i].nickname + ' - ' + players[i].role + '</li>';
		} else if (players[i].team === 'blue') {
			blueTeamPlayersHTML += '<li>' + players[i].nickname + ' - ' + players[i].role + '</li>';
		}					
	}
	redTeamPlayersHTML += '</ul>';
	greyTeamPlayersHTML += '</ul>';
	blueTeamPlayersHTML += '</ul>';
	
	redTeamPlayersDiv.innerHTML = redTeamPlayersHTML;
	greyTeamPlayersDiv.innerHTML = greyTeamPlayersHTML;
	blueTeamPlayersDiv.innerHTML = blueTeamPlayersHTML;
}

initialize();