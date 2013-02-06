
GameError = {};
GameError.ACTION_NOT_IMPLEMENTED = 'ActionNotImplemented';
GameError.GAME_ALREADY_STARTED = 'GameAlreadyStarted';
GameError.GAME_NOT_STARTED = 'GameNotStarted';
GameError.PLAYER_DUPLICATE = 'DuplicatePlayer';
GameError.PLAYER_INVALID = 'InvalidPlayer';
GameError.PLAYING_ALREADY = 'AlreadyPlaying';
GameError.PLAYING_NOT_PLAYING = 'NotCurrentlyPlaying';

GameError.createErrorMessage = function(errorCode, params)
{
	return JSON.stringify({action: "Error", error: errorCode, params: params});
};
