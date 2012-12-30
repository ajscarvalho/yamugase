
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

Yamugase.Game.prototype.gameOver = function() 
{
	this.over = true;
	this.replays = [];
	this.replayTimer = setTimeout(this.restart.bind(this), Config.Server.GAME_REPLAY_TIMEOUT);
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
	for(var p in this.players)
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
	for(var p in this.players)
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

	if (this.over) this.replayAnalysis();
};

Yamugase.Game.prototype.createGameOverMessage = function(data)
{
	return JSON.stringify( {action: 'GameOver', data: data} );	
}


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

	if (this.players.length == 0) this.drop();
	if (this.replays.length == this.players.length) 
		this.restart();
};

Yamugase.Game.prototype.restart = function()
{
console.log('Yamugase.Game.prototype.restart');
	var player;

	clearTimeout(this.replayTimer);
	for (var playerPos in this.players)
	{
		player = this.players[playerPos];
		if (this.replays.indexOf(player) >= 0) continue;
		this.dropPlayer(player);
	}

	if (this.players.lenght == 0) return this.drop();
	this.start();
};


Yamugase.Game.prototype.drop = function()
{
console.log('Yamugase.Game.prototype.drop');
	this.players = null;
	this.replays = null;
};

Yamugase.Game.prototype.expired = function()
{
	return (this.players == null);
};
 
Yamugase.Game.prototype.getGameTypeIndex = function()
{
	return Yamugase.getGameTypeIndex();
};

 
Game = Yamugase.Game;
