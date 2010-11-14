var HOST = 'localhost', PORT = 28785;
var DEBUG_MODE = true;
var COMMANDS = {
	SERVER_CONNECT		: 0x02, // When the server says gives the client an ID - this is the first communication from ServerNetChannel
	PLAYER_JOINED		: 0x01,	// When a new player has joined
	PLAYER_DISCONNECT	: 0x04,
	PLAYER_MOVE			: 0x08,
	PLAYER_FIRE			: 0x16
};

// Tell Node
if (typeof window === 'undefined') {
	exports.COMMANDS = COMMANDS;
}