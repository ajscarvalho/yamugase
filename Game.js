
/** @constructor */
Yamugase.Game = function()
{
	this.init();
};

Yamugase.Game.prototype.className = 'Yamugase.Game';
Yamugase.Game.prototype.id = null;
Yamugase.Game.prototype.roomNo = null;

Yamugase.Game.prototype.players = null; // list of Player
Yamugase.Game.prototype.started = false;

Yamugase.Game.prototype.init = function()
{
	this.id = 'g_' + UUID.generate();
	this.players = [];
};

Yamugase.Game.prototype.addPlayer = function(player)
{
	this.players.push(player);
	player.setCurrentGame(this);
	this.broadcast(this.createUpdatePlayerStatsMessage());
};

Yamugase.Game.prototype.start = function()
{
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
Yamugase.Game.prototype.createCharacteristicsMessage = function(playerId)
{
	var data = null;
	return '{"action": "GameCharacteristics", "data": {' +
		' "gameId": ' + JSON.stringify(this.id) + 
		',"playerId": ' + JSON.stringify(playerId) + 
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
// "the Game::processAction function is me ant to be overriden";
};

Game = Yamugase.Game;
