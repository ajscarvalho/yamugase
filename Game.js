
/** @constructor */
Yamugase.Game = function() { this.init(); };

Yamugase.Game.prototype.className = 'Yamugase.Game';
Yamugase.Game.prototype.id = null;
Yamugase.Game.prototype.roomNo = null;

Yamugase.Game.prototype.players = null; // list of Player
Yamugase.Game.prototype.started = false;
Yamugase.Game.prototype.over = false;
Yamugase.Game.prototype.replays = null; // list of Player (wanting to replay game)
Yamugase.Game.prototype.replayTimer = null; // replay timer at the end of which the game will start, and other players will be dropped


Yamugase.Game.prototype.init = function()
{
	this.id = 'g_' + Yamugase.UUID.generate();
	this.players = [];
};

/** returns true when no more players can be added to the game */
Yamugase.Game.prototype.isFull = function() { return this.players.length >= 4; } // 4 is a good default number, I guess

Yamugase.Game.prototype.gameOver = function() 
{
console.log('Yamugase.Game.gameOver');
	this.over = true;
	this.replays = [];
	this.replayTimer = setTimeout(this.restart.bind(this), Config.Server.GAME_REPLAY_TIMEOUT);
//	this.replayTimer = setTimeout(this.replayAnalysis.bind(this), Config.Server.GAME_REPLAY_TIMEOUT);
};

Yamugase.Game.prototype.addPlayer = function(player)
{
	this.players.push(player);
	player.setCurrentGame(this);
	this.broadcast(this.createUpdatePlayerStatsMessage());
};

Yamugase.Game.prototype.start = function()
{
	this.started = true;
	this.over = false;
	this.broadcast(this.createGameStartMessage());
};


Yamugase.Game.prototype.getPlayersMessagePart = function()
{
	var data = '';
	for(var p = 0; p < this.players.length; p++)
	{
		if (data) data += ',';
		data += this.players[p].serialize();
	}
	return '[' + data + ']';
};

Yamugase.Game.prototype.createGameStartMessage = function()
{
	var players = this.getPlayersMessagePart();
	return '{"action": "GameStart", "data": {' +
		'"players": ' + players + 
		',"game": ' + this.serialize() +
	'}}';  	
};

Yamugase.Game.prototype.createUpdatePlayerStatsMessage = function()
{
	return '{"action": "UpdatePlayerStats", "data": {"players":' + this.getPlayersMessagePart() + '}}';  
};

//	TODO (gameIdentifier, playerIdentifier, roomNo, errorCode)
Yamugase.Game.prototype.createCharacteristicsMessage = function(player)
{
	var data = null;
	return '{"action": "GameCharacteristics", "data": {' +
		' "gameId": ' + JSON.stringify(this.id) + 
		',"playerId": ' + JSON.stringify(player.id) + 
		',"privateId": ' + JSON.stringify(player._internal_id) + 
		(this.roomNo ? ',"roomNo": ' + JSON.stringify(this.roomNo) : '') + 
	'}}';
};

Yamugase.Game.prototype.broadcast = function(message)
{
console.log('broadcasting', message);
	for(var p = 0; p < this.players.length; p++)
		this.players[p].send(message);
};

Yamugase.Game.prototype.serialize = function()
{
	return JSON.stringify({id: this.id});
};

Yamugase.Game.prototype.processAction = function(server, player, action, params)
{
	if (!this.started) return player.sendImmediate(game_error("GameNotStarted"));
	
	return null; // all ok - no messages to player 
// "the Game::processAction function is meant to be overriden";
};

Yamugase.Game.prototype.dropPlayer = function(player)
{
	var pos = this.players.indexOf(player);
	if (pos < 0) return console.log('player ', player.id, 'not found in game', this.id);

	this.players = array_contract(this.players, pos);

	player.send(this.createGameDroppedYouMessage());
	this.broadcast(this.createPlayerDroppedMessage(player));
	
	if (this.over) this.replayAnalysis();
};

Yamugase.Game.prototype.createGameDroppedYouMessage = function()
{
	return JSON.stringify( {action: 'GameDroppedYou', data: this.id} );			
};

Yamugase.Game.prototype.createPlayerDroppedMessage = function(player)
{
	return JSON.stringify( {action: 'PlayerDropped', data: player.id} );		
};

Yamugase.Game.prototype.createGameOverMessage = function(data)
{
console.log('created gameover message');
	return JSON.stringify( {action: 'GameOver', data: data} );	
};


Yamugase.Game.prototype.replay = function(player)
{
console.log('Yamugase.Game.prototype.replay');
	if (this.replays.indexOf(player) >= 0 || this.players.indexOf(player) < 0) return;

	this.replays.push(player);
	this.replayAnalysis();
};

Yamugase.Game.prototype.replayAnalysis = function()
{
console.log('Yamugase.Game.prototype.replayAnalysis', this.replays.length, this.players.length);

	if (this.players.length == 0) return this.drop();
	if (this.replays.length == this.players.length) 
		this.restart();
};

Yamugase.Game.prototype.restart = function()
{
console.log('Yamugase.Game.prototype.restart');
	var player;

	clearTimeout(this.replayTimer);
	for(var p = 0; p < this.players.length; p++)
	{
		player = this.players[p];
		if (this.replays.indexOf(player) >= 0) continue;
		this.dropPlayer(player);
	}

	if (this.players.length == 0) return this.drop();
	this.start();
};


Yamugase.Game.prototype.drop = function()
{
console.log('Yamugase.Game.prototype.drop');

	for(var p = 0; p < this.players.length; p++)
	{
		player = this.players[p];
		this.dropPlayer(player);
	}

	this.players = [];
	this.replays = [];
	clearTimeout(this.replayTimer);
};

Yamugase.Game.prototype.expired = function()
{
	return (!this.players || !this.players.length);
};
 
Yamugase.Game.prototype.getGameTypeIndex = function()
{
	return Yamugase.getGameTypeIndex();
};

 
Game = Yamugase.Game;
