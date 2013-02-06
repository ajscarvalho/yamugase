
Yamugase.EventProcessor = {};

Yamugase.EventProcessor.processAction = function(server, action, player, params)
{
console.log('process action', action, player.id, params);
	switch(action)
	{
		case 'InitializeGame':	return EventProcessor.initializeGame(server, player, params);
		case 'StartGame':		return EventProcessor.startGame(server, player, params);
//		case 'FlipCard':		return EventProcessor.flipCard(server, player, params);
		case 'GameAction':		return EventProcessor.gameAction(server, player, params);
		case 'ReplayGame':		return EventProcessor.replayGame(server, player, params);
		case 'LeaveGame':		return EventProcessor.leaveGame(server, player, params);
		case 'Pull':			return EventProcessor.pull(server, player, params);
		default:
			console.log('ERROR: Action not implemented "' + action + '"');
			return GameError.createErrorMessage(GameError.ACTION_NOT_IMPLEMENTED);
	}
};

Yamugase.EventProcessor.initializeGame = function(server, player, params)
{
	var playerName = params.shift(),
		numberOfPlayers = params.shift(), 
		roomNo = params.shift();

console.log('initializegame: roomNo =', roomNo);

	player.leaveGame(); // if any
	player.setName(playerName);
	player.updateLastAction();

	try
	{
		if (numberOfPlayers == 1) return server.startSinglePlayerGame(player, params);
		if (roomNo) return server.joinFriendGame(roomNo, player, params);

		var gameTypeIndex = Yamugase.getGameTypeIndex(params);
		return server.joinGame(gameTypeIndex, player, params);
	}
	catch(e) // GameError
	{
		if ("string" == typeof(e)) player.sendImmediate(e);
		console.log("Error on Yamugase.EventProcessor.initializeGame", e);
	}
};

Yamugase.EventProcessor.gameAction = function(server, player, params)
{
	if (!player) return GameError.createErrorMessage(GameError.PLAYER_INVALID);
	if (!player.currentGame) return player.send(GameError.createErrorMessage(GameError.PLAYING_NOT_PLAYING));
	
	var gameAction = params.shift();
	player.updateLastAction();
	return player.currentGame.processAction(server, player, gameAction, params);
};

Yamugase.EventProcessor.replayGame = function(server, player, params)
{
	if (!player) return GameError.createErrorMessage(GameError.PLAYER_INVALID);
	if (!player.currentGame.over) return player.send(GameError.createErrorMessage(GameError.PLAYING_ALREADY));

	player.updateLastAction();
	player.currentGame.replay(player);
};

Yamugase.EventProcessor.leaveGame = function(server, player, params)
{
	if (!player) return GameError.createErrorMessage(GameError.PLAYER_INVALID);
//	if (!player.currentGame) return player.send(GameError.createErrorMessage(GameError.PLAYING_NOT_PLAYING));
	player.updateLastAction();
	player.leaveGame();
};

Yamugase.EventProcessor.startGame = function(server, player, params)
{
	if (!player) return GameError.createErrorMessage(GameError.PLAYER_INVALID);
	if (!player.currentGame) return player.send(GameError.createErrorMessage(GameError.PLAYING_NOT_PLAYING));
	if (player.currentGame.started) return;
	player.updateLastAction();
	player.currentGame.start();
};

Yamugase.EventProcessor.pull = function(server, player, params)
{
	if (!player) return GameError.createErrorMessage(GameError.PLAYER_INVALID);
	return player.pull();
};


EventProcessor = Yamugase.EventProcessor;
