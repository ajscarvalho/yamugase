
game_error = function(errorCode, params)
{
	return JSON.stringify({action: "Error", error: errorCode, params: params});
};
