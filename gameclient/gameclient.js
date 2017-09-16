
var sessionId = null;
var players = [];

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
	// Only handle messages from your dataChannel
	console.log("ON MESSAGE", peer, label, data);
	console.log("PEER", peer);
	console.log("LABEL", label);
	console.log("DATA", data);
	/*if (label !== 'text chat') return;
	else if (data.type == 'chat') {
	console.log('Received message: ' + data.payload + ' from ' + peer.id);
	}*/
	//game client should only listen to GAME label messages
	if (label === 'GAME') {
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
			default:
				console.log('WARNING, ERROR! TYPE DIDNT MATCH!');
		}
	}
});

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