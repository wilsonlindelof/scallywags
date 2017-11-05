
var sessionId = null;
var players = [];
var gameState = {};
var canvas = null;
var ctx = null;
var lastTime;
var shipSpeed = 30; //this should be based on dynamic wind eventually
var shipWidth = 10;
var shipHeight = 10;
var shipTurnSpeed = 20;

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
	media: { video: false, audio: false},
	receiveMedia: { offerToReceiveAudio: 0, offerToReceiveVideo: 0},
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
						players[i].role = data.payload.role;
						console.log(players[i].team);
					}
				}
				updatePlayerLobby();
				break;
			case 'PLAYER_SELECTED_ROLE':
				console.log('A player has selected a role');
				for (var i = 0; i < players.length; i++) {
					if (players[i].UID === data.payload.UID) {
						console.log(players[i], 'MATCH');
						console.log('going to set players role from ', players[i].role, ' to ', data.payload.role);
						console.log(players[i].role);
						players[i].role = data.payload.role;
						console.log(players[i].role);
					}
				}
				updatePlayerLobby();
				break;
			case 'START_GAME':
				console.log('start the game');
				webrtc.sendDirectlyToAll('COMMAND', 'GAME_STARTING', null);
				let now = Date.now();
				gameState = {
					'red': {
						'x': 100,
						'y': 500,
						'vectorDegree': 90,						
						'desiredDegree': 90,
						'lastShot': now,
						'cannonballs': []
					},
					'blue': {
						'x': 900,
						'y': 500,
						'vectorDegree': 270,						
						'desiredDegree': 270,
						'lastShot': now,
						'cannonballs': []
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
				gameState[data.payload.team].desiredDegree = data.payload.desiredDegree;
				break;
			case 'GUNNER':
				console.log('gunnery received');
				let nowG = Date.now();
				if (nowG - gameState[data.payload.team].lastShot > 1500) {
					let cannonball1 = {
						'timeLeft': 4000,
						'x': gameState[data.payload.team].x,
						'y': gameState[data.payload.team].y,
						'vectorDegree': (data.payload.direction === 'LEFT' ? gameState[data.payload.team].vectorDegree - 70 : gameState[data.payload.team].vectorDegree + 70 ),
					};
					gameState[data.payload.team].cannonballs.push(cannonball1);
					let cannonball2 = {
						'timeLeft': 4000,
						'x': gameState[data.payload.team].x,
						'y': gameState[data.payload.team].y,
						'vectorDegree': (data.payload.direction === 'LEFT' ? gameState[data.payload.team].vectorDegree - 75 : gameState[data.payload.team].vectorDegree + 75 ),
					};
					gameState[data.payload.team].cannonballs.push(cannonball2);
					let cannonball3 = {
						'timeLeft': 4000,
						'x': gameState[data.payload.team].x,
						'y': gameState[data.payload.team].y,
						'vectorDegree': (data.payload.direction === 'LEFT' ? gameState[data.payload.team].vectorDegree - 80 : gameState[data.payload.team].vectorDegree + 80 ),
					};
					gameState[data.payload.team].cannonballs.push(cannonball3);
					gameState[data.payload.team].lastShot = nowG;
				}
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
	
	let teamKeys = Object.keys(gameState);
	teamKeys.forEach(function (team) {
		//team is 'red' or 'blue'
		
		//if its less than 2 degrees off, just let it keep the same bearing
		if (gameState[team]['desiredDegree'] - gameState[team]['vectorDegree'] >= 2 || gameState[team]['desiredDegree'] - gameState[team]['vectorDegree'] <= -2) {			
			
			let clockwise = -1;
			let desired = 0;
			let vector = gameState[team]['vectorDegree'] - gameState[team]['desiredDegree'];
			if (vector < 0) {
				vector = vector + 360;
			} else if (vector > 360) {
				vector = vector - 360;
			}
			
			if (vector >= 180) {
				clockwise = 1;
			}
			
			gameState[team]['vectorDegree'] = gameState[team]['vectorDegree'] + (shipTurnSpeed * dt * clockwise);
			if (gameState[team]['vectorDegree'] >= 360) {
				gameState[team]['vectorDegree'] = 0;
			} else if (gameState[team]['vectorDegree'] <= 0) {
				gameState[team]['vectorDegree'] = 360;
			}
			
		}
		
		//this 90 is kind of magic, without it they go sideways. oh well whatevs.
		let vectorRadians = (((gameState[team]['vectorDegree'] - 90) * Math.PI) / 180);
		gameState[team]['x'] = gameState[team]['x'] + (shipSpeed * dt * Math.cos(vectorRadians));
		gameState[team]['y'] = gameState[team]['y'] + (shipSpeed * dt * Math.sin(vectorRadians));
		
		if (gameState[team]['x'] < 0) {
			gameState[team]['x'] = 0;
		}
		if (gameState[team]['x'] > 1000) {
			gameState[team]['x'] = 1000;
		}
		if (gameState[team]['y'] < 0) {
			gameState[team]['y'] = 0;
		}
		if (gameState[team]['y'] > 1000) {
			gameState[team]['y'] = 1000;
		}
		
		//check collisions, bullets, etc
		gameState[team].cannonballs.forEach(function(cannonball) {
			let cannonballRadians = (((cannonball['vectorDegree'] - 90) * Math.PI) / 180);
			cannonball['x'] = cannonball['x'] + (shipSpeed * 4 * dt * Math.cos(cannonballRadians));
			cannonball['y'] = cannonball['y'] + (shipSpeed * 4 * dt * Math.sin(cannonballRadians));	
			// if (collision) or if timeout
		});
		
	});
	
}

function render() {
	ctx.fillStyle = '#CCCCFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);//draw the ocean
	
	ctx.fillStyle = '#222222';
	//update this with degrees
	let teamKeys = Object.keys(gameState);
	teamKeys.forEach(function (team) {
		
		drawRotated('../assets/Ship01.png', gameState[team]['x'], gameState[team]['y'], 44, 150, gameState[team]['vectorDegree']);
		
		gameState[team].cannonballs.forEach(function(cannonball) {
			ctx.fillRect(cannonball.x, cannonball.y, 5, 5);
		});	
	});
	
}

function drawRotated(imageURL, x, y, width, height, vectorDegree) {
	ctx.translate(x, y);
	//var angleInRadians = Math.atan2(vectorY, vectorX);
	var angleInRadians = (vectorDegree * (Math.PI/180));
	//ctx.rotate(angleInRadians + (.5 * Math.PI)); //this is just because the thing is up when default is facing right.
	ctx.rotate(angleInRadians);
	ctx.drawImage(resources.get(imageURL), 
		-(width / 2), -(height / 2),
		width, height);
	//ctx.rotate(-angleInRadians - (.5 * Math.PI));
	ctx.rotate(-angleInRadians);
	ctx.translate(-x, -y);
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

resources.load([
    '../assets/images/Ship01.png'
]);
resources.onReady(initialize);