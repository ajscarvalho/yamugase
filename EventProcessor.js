
Yamugase.EventProcessor = {};

Yamugase.EventProcessor.processAction = function(server, action, player, params)
{
console.log('process action', action, player, params);
	switch(action)
	{
		case 'InitializeGame':	return EventProcessor.initializeGame(server, player, params);
		case 'StartGame':		return EventProcessor.startGame(server, player, params);
//		case 'FlipCard':		return EventProcessor.flipCard(server, player, params);
		case 'GameAction':		return EventProcessor.gameAction(server, player, params);
		case 'AnotherGame':		return EventProcessor.anotherGame(server, player, params);
		case 'pull':			return EventProcessor.pull(server, player, params);
		default: console.log('ERROR: Action not implemented "' + action + '"');
	}
};

Yamugase.EventProcessor.initializeGame = function(server, player, params)
{
	var playerName = params.shift(),
		numberOfPlayers = params.shift(), 
		roomNo = params.shift();

	player.leaveGame(); // if any
	player.setName(playerName);
	if (numberOfPlayers == 1) return server.startSinglePlayerGame(player, params);
	if (roomNo) return server.joinFriendGame(roomNo, player, params);

	var gameTypeIndex = EventProcessor.getGameTypeIndex(params);
	return server.joinGame(gameTypeIndex, player, params);
};

Yamugase.EventProcessor.gameAction = function(server, player, params)
{
	if (!player) return game_error('InvalidPlayer');
	if (!player.currentGame) return player.send(game_error('NotCurrentlyPlaying'));
	return player.currentGame.processAction(server, player, params.gameAction, params.params);
};

/*
EventProcessor.flipCard = function(server, player, params)
{
	var cardPos = params.shift();
};
*/

EventProcessor = Yamugase.EventProcessor;
