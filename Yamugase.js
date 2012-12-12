
var http = require('http');
var ws = require('./websocket/websocket_server');


require('./utils/XML');
require('./utils/UUID');
require('./utils/error');


/** @constructor */
Yamugase = function(){ this.init(); };

require('./Config');
require('./Player');
require('./Game');

Yamugase.prototype.className = 'Yamugase';
Yamugase.prototype.httpServer = null;
Yamugase.prototype.websocketServer = null;
Yamugase.prototype.connections = {};
Yamugase.prototype.games = {};

Yamugase.prototype.init = function()
{
	this.httpServer = http.createServer(this.httpRequestHandler.bind(this));
	this.httpServer.listen(Yamugase.Config.WEBSERVER_PORT);

	this.websocketServer = WebSocketServer.createServer(this.websocketConnected.bind(this));
	this.websocketServer.listen(Yamugase.Config.WEBSOCKET_PORT);

	this.clearHttpClients(); // cycle checking clients for timeout events
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
	if (request.url.match(/\?xml$/))
	{
		contentType = 'text/xml';
		if (action == 'pull') events = Yamugase.XML.convertFromJSO(player.getEvents());
		else events = Yamugase.XML.convertFromJSO(res);
	}
	else
	{
		contentType = 'application/json‎';
		if (action == 'pull') events = JSON.stringify(player.getEvents());
		else events = JSON.stringify(res);
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
	websocket.addListener('close', this.websocketCloseHandler.bind(this));
	websocket.addListener('error', this.websocketErrorHandler.bind(this));
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
{
	for(var id in this.connections)
		if (this.connections[id].expired())
			this.deleteClient(id);

	setTimeout(this.clearHttpClients.bind(this), 1000);
};

Yamugase.prototype.websocketClientDropped = function(websocket)
{
console.log('websocketClientDropped');
	for (var id in this.clients)
		if (websocket === this.connections[id].websocket)
			this.deleteClient(id);
};

Yamugase.prototype.deleteClient = function(id)
{
console.log('dropped client', id);
	var player = this.connections[id];
	if (player.websocket) try { 
		player.websocket.player = null; // remove double link reference
		player.websocket.close(); // try closing the socket
	} catch(e) {};

	player.websocket = null; // websocket connection
	player.events = null; // for http pooling
	if (player.currentGame) player.currentGame.dropPlayer(player); // drop player from game
	player.currentGame = null;
	delete this.connections[id];
};

Yamugase.prototype.addClient = function(player)
{
	if(this.connections[player._internalId]) return player.send(game_error('DuplicatePlayer'));
	this.connections[player._internalId] = player;
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
	return player.sendImmediate(game.createCharacteristicsMessage(player.id));
};

