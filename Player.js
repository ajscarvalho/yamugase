
/** @constructor */
Yamugase.Player = function(name) { this.init(name); };

Yamugase.Player.prototype.className = 'Yamugase.Player';
Yamugase.Player.prototype._internal_id = null;
Yamugase.Player.prototype.id = null;
Yamugase.Player.prototype.name = null;

Yamugase.Player.prototype.connectionType = null; // http/ws
Yamugase.Player.prototype.websocket = null; // websocket connection
Yamugase.Player.prototype.events; // for http pooling
Yamugase.Player.prototype.currentGame = null; // game being played

Yamugase.Player.prototype.lastActionTimestamp = 0; // last interaction with player
Yamugase.Player.prototype.lastPullTimestamp = 0; // last interaction with player

Yamugase.Player.prototype.registered = false;

Yamugase.Player.prototype.getId = function() { return this.id; };
Yamugase.Player.prototype.setName = function(name) { this.name = name; };

Yamugase.Player.prototype.init = function(name)
{
	this._internal_id = 'ip_' + Yamugase.UUID.generate();
	this.id = 'p_' + Yamugase.UUID.generate();
	this.name = name;
	this.events = [];
	this.lastPullTimestamp = this.lastActionTimestamp = now();
};

Yamugase.Player.prototype.getEvents = function() { return this.events; };
Yamugase.Player.prototype.setCurrentGame = function(game) { this.currentGame = game; };

Yamugase.Player.prototype.leaveGame = function()
{
	if (!this.currentGame) return;
	this.currentGame.dropPlayer(this);
};

Yamugase.Player.prototype.updateLastAction = function()
{
	this.lastActionTimestamp = now();
};

/* TODO move to server? */
Yamugase.Player.prototype.expired = function(config)
{
	var t = now();

	if (!this.websocket && (t - this.lastPullTimestamp > config.PULL_TIMEOUT)) 
{
console.log('pull expired', this.id,  this.lastPullTimestamp);
		return true; // 3s without pull requests - dropped
}
//	if (!this.currentGame) return t - this.lastActionTimestamp > 30000; // 30s inactivity (main screen)
if (t - this.lastActionTimestamp > config.INACTIVITY_TIMEOUT)
console.log('inactivity expire', this.id, t, this.lastActionTimestamp, config.INACTIVITY_TIMEOUT);

	return (t - this.lastActionTimestamp > config.INACTIVITY_TIMEOUT); // 5s inactivity in a game will kill ya!
};

Yamugase.Player.prototype.send = function(data)
{
	if (this.websocket) return this.websocket.write(data);
	if (this.events) this.events.push(data); // player might have dropped
};

Yamugase.Player.prototype.sendImmediate = function(data)
{
console.log('Replying: ', data);
	if (this.websocket) return this.websocket.write(data);
	return data;
};

Yamugase.Player.prototype.sendIdentification = function(data)
{
	return this.sendImmediate(
		JSON.stringify({action: "UserId", data: this._internal_id})
	);
};

Yamugase.Player.prototype.pull = function()
{
	var res = '{"action": "pull", "data": ['+ this.events.join(',') + ']}';
	this.events = [];
	this.lastPullTimestamp = now();
	return res;
};

Yamugase.Player.prototype.serialize = function()
{
	return '{"id": ' + JSON.stringify(this.id) + 
		',"name": ' + JSON.stringify(this.name) +
	'}';
};

Player = Yamugase.Player; // override
