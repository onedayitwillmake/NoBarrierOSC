/**
File:
	ServerNetChannel.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	-> Clientside NetChannel talks to this object
	<--> This object talks to it's GameController
 	  <-- This object broadcast the message to all clients
Basic Usage:
*/


require('../lib/jsclass/core.js');
require('../lib/SortedLookupTable.js');
require('./Client.js');
var ws = require('./ws.js');

ServerNetChannel = (function()
{
	return new JS.Class(
	{
		initialize: function(aDelegate, config)
		{
			// Delegation pattern, avoid subclassing ServerNetChannel
			this.delegate = aDelegate;
			this.config = config;

			// Connection options
			this.maxChars = config.maxChars || 128;
			this.maxClients = config.maxClients || 64;
			this.port = config.PORT || 8000;
			this.showStatus = config.status === false ? false : true;

			this.bytes = {
				sent: 0,
				received: 0
			};



		    // Connections
		    this.clients = new SortedLookupTable();		// Everyone connected
		    this.clientCount = 0;	// Length of above
		    this.nextClientID = 1;		// UUID for next client - ZERO IS RESERVED FOR THE SERVER

		    // Recording
		    this.record = config.record || false;
		    this.recordFile = config.recordFile || './record[date].js';
		    this.recordData = [];


		    // Map CMD values to functions to avoid a giant switch statement as this expands
		    this.CMD_TO_FUNCTION = {};

		    this.CMD_TO_FUNCTION[config.CMDS.SERVER_CONNECT] = this.onClientConnected;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_JOINED] = this.onPlayerJoined;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_DISCONNECT] = this.removeClient;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_MOVE] = this.onPlayerMoveCommand;
		    this.CMD_TO_FUNCTION[config.CMDS.PLAYER_FIRE] = this.genericCommand;

		    this.initAndStartWebSocket(config);
		},

		/**
		 * Initialize and start the WebSocket server.
		 * With this set up we should be abl to move to Socket.io easily if we need to
		 */
		initAndStartWebSocket: function(options)
		{
			// START THE WEB-SOCKET
			var that = this;
			var aWebSocket = this.$ = new ws.Server( null);

			aWebSocket.onConnect = function(connection)
			{
				console.log("(ServerNetChannel) UserConnected:", SYS.inspect(arguments[0]) );
			};

			/**
			* Received a message from a client/
			* Messages can come as a single message, or grouped into an array of commands.
			*/
			aWebSocket.onMessage = function(connection, encodedMessage )
			{
//				console.log( '(ServerNetChannel) : onMessage', connection, SYS.inspect( BISON.decode(encodedMessage) ) );
				try
				{
					that.bytes.received += encodedMessage.length;

					var decodedMessage = BISON.decode(encodedMessage);


					if(decodedMessage.cmds instanceof Array == false)
					{
						// Call the mapped function, always pass the connection. Also pass data if available
						that.CMD_TO_FUNCTION[decodedMessage.cmds.cmd].apply(that, [connection, decodedMessage]);
					}
					else // An array of commands
					{
//						for(var singleCommand in decodedMessage.cmds){
//							that.CMD_TO_FUNCTION[singleCommand.cmd].apply(that, singleCommand.data);
//						}
					}
				}
				catch (e)
				{ // If something went wrong, just remove this client and avoid crashign

					console.log(e.stack);
//					console.log('!! Error: ' + e);
					connection.close();
				}
			};

			aWebSocket.onClose = function(connection) {
				that.removeClient(connection);
			};
		},

		// Create a callback to call 'start' on the next event loop
		start: function()
		{
			var that = this;
			process.nextTick(function() {
				that.startInternal();
			});
		},

		// Start the server
		startInternal: function()
		{
			var that = this;
			this.startTime = this.delegate.gameClock;
			this.time = this.startTime;

			// Start the websocket
			console.log('(ServerNetChannel) Started listening...');
			this.$.listen(this.port);

			// Listen for process termination
			process.addListener('SIGINT', function(){that.shutdown()});
		},

		/**
		 * Checks all the clients to see if its ready for a new message.
		 * If they are, have the client perform delta-compression on the worldDescription and send it off.
		 * @param gameClock		   The current (zero-based) game clock
		 * @param worldDescription A description of all the entities currently in the world
		 */
		tick: function( gameClock, worldDescription )
		{
			this.gameClock = gameClock;

			// Send client the current world info
			this.clients.forEach( function(key, client)
			{
				// Collapse delta - store the world state
				var deltaCompressedWorldUpdate = client.compressDeltaAndQueueMessage( worldDescription, gameClock );

				// Ask if enough time passed
				if ( client.shouldSendMessage(gameClock) )
					client.sendQueuedCommands(gameClock);

			}, this );
		},

		/**
		 * Message Sending
		 * @param originalClientID		The connectionID of the client this message originated from
		 * @param anUnencodedMessage	Human readable message data
		 * @param sendToOriginalClient	If true the client will receive the message it sent. This should be true for 'reliable' events such as joining the game
		 */
		broadcastMessage: function(originalClientID, anUnencodedMessage, sendToOriginalClient)
		{
			var encodedMessage = BISON.encode(anUnencodedMessage);
			console.log('Init Broadcast Message From:' + originalClientID, SYS.inspect(anUnencodedMessage));

			// Send the message to everyone, except the original client if 'sendToOriginalClient' is true
			for( var clientID in this.clients )
			{
				// Don't send to original client
				if( sendToOriginalClient == false && clientID == originalClientID )
					continue;

				this.clients.objectForKey([clientID]).sendMessage(encodedMessage);
				this.bytes.sent += encodedMessage.length;
			}
		},

		// Shut down the server
		shutdown: function()
		{
			// Tell all the clients then close
			var that = this;
			setTimeout(function() {
				for(var aClient in that.clients)
				{
					try { that.clients[aClient].close(); } catch( e ) { }                              
				}

				// that.saveRecording();
				console.log('>> Shutting down...');
				process.exit(0);
			}, 100);
		},

		removeClient: function(connection)
		{
			var clientID = connection.$clientID;
			var aClient = this.clients.objectForKey(clientID);

			// This client is not in our client-list. Throw warning, something has probably gone wrong.
			if(aClient == undefined)
			{
				console.log("(ServerNetChannel) Attempted to disconnect unknown client!:" + clientID );
				return;
			}


			console.log("(ServerNetChannel) Disconnecting client: " + clientID );

			// if this client is mid game playing then we need to tell the other players to remove it
			if(aClient.enabled)
			{
				// before we actually remove this guy, make tell everyone else
				this.delegate.onClientRemoved( clientID );
				// this.relayMessage(connection.$clientID, MESSAGES.REMOVE_FOREIGN_CHARACTER, { clientID: connection.$clientID });
			}

			// Free the slot
			this.clients.remove(clientID);
			this.clientCount--;
		},

		/**
		 * Client Addition -
		 * Added client to connected users - player is not in the game yet
		 */
		addClient: function(connection)
		{
			var clientID = this.nextClientID++;
			this.clientCount++;

			connection.$clientID = clientID;
			var aClient = new Client(this, connection, this.config);
			// Add to our list of connected users
			this.clients.setObjectForKey( aClient, clientID);

			return clientID;
		},
		// player is now in the game after this

		onPlayerJoined: function(connection, aDecodedMessage)
		{
//			console.log( SYS.inspect(decodedMessage) );
			console.log('(ServerNetChannel) Player joined from connection #' + connection.$clientID);

			var entityID = this.delegate.getNextEntityID();
			this.delegate.shouldAddPlayer(entityID, connection.$clientID);

			console.log("Sending:",BISON.encode(aDecodedMessage));
			connection.send( BISON.encode(aDecodedMessage) );
//			this.delegate.setNickNameForClientID(aDecodedMessage.cmds.data.nickName, connection.$clientID);

			// Tell all the clients that a player has joined
//			this.broadcastMessage(connection.$clientID, aDecodedMessage, true);
		},

		/**
		 * CONNECTION EVENTS
		 * User has connected, give them an ID, tell them - then tell all clients
		 */
		onClientConnected: function(connection, aDecodedMessage)
		{
			var data = aDecodedMessage.cmds.data;

			// Create a new client, note UUID is incremented
			var newClientID = this.addClient(connection);
			aDecodedMessage.id = newClientID;
			aDecodedMessage.gameClock = this.delegate.gameClock;

			console.log('(ServerNetChannel) Adding new client to listeners with ID: ' + newClientID );

			// Send only the connecting client a special connect message by modifying the message it sent us, to send it - 'SERVER_CONNECT'
			// console.log( aDecodedMessage );
			connection.send( BISON.encode(aDecodedMessage) );
			this.delegate.onClientJoined(newClientID);
		},

		/**
		 * Send this to all clients, and let the gamecontroller do what it should with the message
		 */
		onGenericPlayerCommand: function(connection, aDecodedMessage)
		{
			throw("ERROR"); // This is deprecated
//			this.delegate.onGenericPlayerCommand(connection.$clientID, aDecodedMessage);
//			this.broadcastMessage(connection.$clientID, aDecodedMessage, false);
		},

		onPlayerMoveCommand: function(connection, aDecodedMessage)
		{
//			console.log(this.delegate)
//			BISON.encode(aDecodedMessage)
//			connection.send( BISON.encode(aDecodedMessage) )
			this.delegate.onPlayerMoveCommand(connection.$clientID, aDecodedMessage);
		},
		 
		/**
		 * SETTING CLIENT PROPERTIES
		 * Called by clients to modify a property, if the server accepts the change (it is within bounds, name contains valid string, etc)
		 * The clients property is updated
		 */
		//Set the clients 'nickName' as defined by them
		setClientPropertyNickName: function(connection, aDecodedMessage)
		{
			var nickname = aDecodedMessage.cmds.data.nickname;
			this.console.log('(ServerNetChannel) Setting nickname for ' + connection.$clientID + ' to ' +  nickname);
//			var client = this.clients.objectForKey( connection.$clientID );
//			this.clients[connection.$clientID].enabled = true;
//			this.clients[connection.$clientID].nickname = nickname;
		}

		// Close prototype object
	});// Close .extend
})(); // close init()


