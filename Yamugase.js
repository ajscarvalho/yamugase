
var http = require('http');
var ws = require('./websocket/websocket_server');


/** @constructor */
Yamugase = function(){ this.init(); };

require('./utils/XML');
require('./utils/UUID');


require('./GameError');
require('./Player');
require('./Game');
require('./EventProcessor');

Yamugase.prototype.className = 'Yamugase';
Yamugase.prototype.httpServer = null;
Yamugase.prototype.websocketServer = null;
Yamugase.prototype.connections = null; // object
Yamugase.prototype.games = null; // object
Yamugase.prototype.gameTypes = null; // object
Yamugase.prototype.friendGames = null; // object
Yamugase.prototype.config = null;

Yamugase.prototype.init = function(config)
{
	this.connections = {};
	this.games = {};
	this.gameTypes = {};
	this.friendGames = {};

	this.config = config;

	this.httpServer = http.createServer(this.httpRequestHandler.bind(this));
	this.httpServer.listen(config.WEBSERVER_PORT);

	this.websocketServer = WebSocketServer.createServer(this.websocketConnected.bind(this));
	this.websocketServer.listen(config.WEBSOCKET_PORT);

	this.clearHttpClients(); // cycle checking clients for timeout events
	this.clearEmptyGames(); // cycle checking empty games and dropping them
};



/**
 * HTTP Request Handling
 */
Yamugase.prototype.httpRequestHandler = function(request, response)
{
	var params = request.url.replace(/\?.*/, '').replace(/^\/+/, '').replace(/\/+$/, '').split('/'),
		action = params.shift(),
		id = params.shift(),
		player = this.connections[id];

	if (!player) this.addClient(player = new Player());

	var res = EventProcessor.processAction(this, action, player, params);
	if (null == res)
	{
		console.warn('null value returned from action', action, params);
		response.writeHead(200);
		return;
	}

	if (request.url.match(/\?xml$/))
	{
		contentType = 'text/xml';
//		if (action == 'pull') events = Yamugase.XML.convertFromJSONList(player.getEvents());
//		else
console.log(res);
		events = Yamugase.XML.convertFromJSONResponse(res);
	}
	else
	{
		contentType = 'application/json‎';
//		if (action == 'pull') events = '[' + player.getEvents().join(',') + ']';
//		else 
		events = res;
	}

	response.writeHead(200, {'Content-Type': contentType});
//console.log("====\n" + events + "\n====");
	response.end(events);
};

Yamugase.prototype.send_http_error = function(response, code, text)
{
	response.writeHead(code, {'Content-Type': 'text/plain'});
	response.end(text);
};




/**
 * Websocket Event Handling
 */
Yamugase.prototype.websocketConnected = function(websocket)
{
console.log('websocket connected');
//	websocket.addListener('connect', this.websocketConnectHandler.bind(this));
	websocket.addListener('data', this.websocketDataHandler.bind(this, websocket));
	websocket.addListener('close', this.websocketCloseHandler.bind(this, websocket));
	websocket.addListener('error', this.websocketErrorHandler.bind(this, websocket));
};
/*
Yamugase.prototype.websocketConnectHandler = function(websocket)
{
//its called alright	console.log(' --- isThis called? (websocket connect handler)');
};
*/
Yamugase.prototype.websocketDataHandler = function(websocket, data)
{
console.log("received:", data);
//console.log(this, websocket, data);
	if (!data) return console.log('Error websocket on data with no data');
	var message = JSON.parse(data);

	var player = websocket.player;
	if (!player)
	{
		player = new Player();
		websocket.player = player;
		player.websocket = websocket;
		this.addClient(player);
	}

	EventProcessor.processAction(this, message.action, player, message.params);
//	if (res) websocket.write(res);
};

Yamugase.prototype.websocketCloseHandler = function(websocket)
{
console.log('Closed websocket', websocket);
	this.websocketClientDropped(websocket);
};

Yamugase.prototype.websocketErrorHandler = function(websocket)
{
console.log('Error on websocket', websocket);
	this.websocketClientDropped(websocket);
};



/**
 * Drop Connections 
 */
Yamugase.prototype.clearHttpClients = function()
{;
//console.log("connections", this.connections);
	for(var id in this.connections)
		if (this.connections[id].expired(this.config))
			this.deleteClient(id);

	setTimeout(this.clearHttpClients.bind(this), 1000);
};

Yamugase.prototype.websocketClientDropped = function(websocket)
{
console.log('websocketClientDropped');
	for (var id in this.connections)
		if (websocket === this.connections[id].websocket)
			this.deleteClient(id);
};

Yamugase.prototype.deleteClient = function(id)
{
console.log('dropped client', id);
	var player = this.connections[id];
	if (player.currentGame) player.currentGame.dropPlayer(player); // drop player from game
	
	if (player.websocket) try { 
		player.websocket.player = null; // remove double link reference
		player.websocket.close(); // try closing the socket
	} catch(e) {};

	player.websocket = null; // websocket connection
//	if (player.currentGame) player.currentGame.dropPlayer(player); // drop player from game
	player.events = null; // for http pooling
	player.currentGame = null;
	delete this.connections[id];
};

Yamugase.prototype.addClient = function(player)
{
	if(this.connections[player._internal_id]) return player.send(GameError.createErrorMessage(GameError.PLAYER_DUPLICATE));
	this.connections[player._internal_id] = player;
};



/************
 * Cleaning *
 ************/
 
Yamugase.prototype.clearEmptyGames = function()
{
	var game, gameTypeIndex;
	for(var id in this.games)
	{
		game = this.games[id];
		gameTypeIndex = game.getGameTypeIndex();
		if (game.expired())
		{

			// delete reference from gameTypes
			var gamesByType = this.gameTypes[gameTypeIndex];
			if (gamesByType)
			{
console.log('clearEmptyGames', gameTypeIndex, gamesByType);
				var gameTypeIndexPosition = gamesByType.indexOf(this.game);
				if (gameTypeIndexPosition > -1)
				{
					this.gameTypes[gameTypeIndex] = array_contract(gamesByType, gameTypeIndexPosition);
				}
			}

			// delete reference from friendGames
			var room = this.friendGames.indexOf(this.game);
			if (room > -1)
			{
				this.friendGames[room] = null;
				delete this.friendGames[room];
			}
			
			delete this.games[id];
		}
	}
	setTimeout(this.clearEmptyGames.bind(this), 10000);
};



/**
 * game modes
 */
//Yamugase.prototype.startSinglePlayerGame = function(cardSetId, boardType, player)
Yamugase.prototype.startSinglePlayerGame = function(player, params)
{
//	var cardSetId = params.shift();
//	var boardType = params.shift();
	var game = new Game(params);
	game.addPlayer(player);
	game.start();
	this.games[game.id] = game;

//	(cardSet, playerName, numberOfPlayers, boardType, roomNo = null)
	return player.sendImmediate(game.createCharacteristicsMessage(player));
};

Yamugase.prototype.joinGame = function(gameTypeIndex, player, params)
{
console.log('join game', gameTypeIndex, params);
	var gameTypeIndex = Yamugase.getGameTypeIndex(params),
		games = this.gameTypes[gameTypeIndex];

	if (!games) games = this.gameTypes[gameTypeIndex] = [];
	if (!games.length)
		return this.joinNewGame(gameTypeIndex, player, params);

	var lastGame = games[games.length-1];
	if (lastGame.started) return this.joinNewGame(gameTypeIndex, player, params);

	lastGame.addPlayer(player);
	return player.sendIdentification();
};

Yamugase.prototype.joinNewGame = function(gameTypeIndex, player, params)
{
console.log('joinNewGame', gameTypeIndex, params);
	var game = new Game(params);
	game.addPlayer(player);
	this.gameTypes[gameTypeIndex].push(game);
console.log('no games found, current games:', this.gameTypes);

	return player.sendIdentification();
};

Yamugase.prototype.joinFriendGame = function(roomNo, player, params)
{
	var game = this.friendGames[roomNo];
	if (!game)
	{
		game = new Game(params);
		game.addPlayer(player);
		this.friendGames[roomNo] = game;
		return player.sendIdentification();
	}
	else if (game.started) return player.sendImmediate(GameError.createErrorMessage(GameError.GAME_ALREADY_STARTED));

	game.addPlayer(player);
	return player.sendIdentification();
};

Yamugase.getGameTypeIndex = function(params)
{
	//override
	return 'default';
};
