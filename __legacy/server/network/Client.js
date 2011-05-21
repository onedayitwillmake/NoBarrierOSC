/**
File:
	Client.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	Stores information about a connection to a client
Basic Usage: 
	var aNewClient = new Client(this, connection, false);
	
	// Add to our list of connected users
	this.clients[clientID] = aNewClient;
	
	// broadcast message to all clients
	for( var clientID in this.clients ) {
		this.clients[clientID].sendMessage(encodedMessage);
	}
	
*/
var init = function()
{
	return new JS.Class(
	{
		initialize: function( aServer, aConnection, config )
		{
			this.conn = aConnection;
			this.nickname = '';
			this.enabled = true; // Old property, leaving it in  for now 

//			this.record = aRecord;
			this.$ = aServer;

			this.commandTypes = config.CMDS;

			this.updaterate = config.CLIENT_SETTING.updaterate; 	// Send user info this ofte
			this.cmdrate =  config.CLIENT_SETTING.cmdrate;			// Receive user info this often
			this.rate =  config.CLIENT_SETTING.rate;				// Cap bandwidth/sec 

			//
			this.incomingSequenceNumber = 0;
			this.outgoingSequenceNumber = 0;

			// array of the last 31 messages sent/received
			this.MESSAGE_BUFFER_MASK = 31; // This is used in the messageBuffer bitmask - It's the sequence number - store
			this.outgoingMessageBuffer = [];
			this.incommingMessageBuffer = [];


			// Every tick store the queued commands here, every CLIENT_CONFIG.updateRate, send the queue
			this.cmdBuffer = [];

			// This is used to see if we should send a client a new world state, or should accept a msg from the client (prevent flooding)
			// Note both are set to -updaterate so next tick garantees a msg send
			this.lastSentMessageTime = -this.updaterate;
			this.lastReceivedMessageTime = -this.updaterate;
		},

		onMessage: function( anEncodedMessage ) 
		{

		},

		/**
		 * Send an encoded (and delta compressed) message to the connection
		 * @param anEncodedMessage Bison Encoded message
		 * @param gameClock		   The current (zero-based) game clock 
		 */
		sendMessage: function( anEncodedMessage, gameClock )
		{
			this.lastSentMessageTime = gameClock;

			// Store inside our outgoingMessageBuffer - which holds 'MESSAGE_BUFFER_MASK' lerped number of messages
			var messageIndex = this.outgoingSequenceNumber & this.MESSAGE_BUFFER_MASK;
			this.outgoingMessageBuffer[messageIndex] = anEncodedMessage

			// Send and increment our message count
			this.conn.send( anEncodedMessage );
			this.outgoingSequenceNumber++;
		},


		/**
		 * Sends the current cmdBuffer
		 */
		sendQueuedCommands: function( gameClock )
		{
			var messageContent = {gameClock: gameClock, id:1, seq: this.outgoingSequenceNumber, cmds:{cmd:this.commandTypes.fullupdate}, data:this.cmdBuffer};
			var encodedMessage = MBISON.encode(messageContent);

			this.sendMessage(encodedMessage, gameClock);

			this.cmdBuffer = [];
		},

		/**
		 * Compares the worldDescription to the last one we sent - removes unchanged values
		 * @param worldDescription A description of all the entities currently in the world
		 * @param gameClock		   The current (zero-based) game clock
		 */
		compressDeltaAndQueueMessage: function( worldDescription, gameClock )
		{
			var entityDescriptionObject = worldDescription.entities._data;
			entityDescriptionObject.gameClock = worldDescription.gameClock;
			entityDescriptionObject.gameTick = worldDescription.gameTick;

			this.cmdBuffer.push( entityDescriptionObject )
			return worldDescription;
		},

		/**
		 * Returns true if its ok to send this client a new message
		 * @param gameClock
		 */
		shouldSendMessage: function( gameClock ) {
			return (gameClock - this.lastSentMessageTime) > this.updaterate;
		}

	}); // close extend
}; // close anon function

require('../lib/jsclass/core.js');
require('../lib/bison.js');
Client = init();
	