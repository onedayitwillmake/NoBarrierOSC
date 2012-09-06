
(function(){
	var OSC = require('../lib/osc');

	Demo.ServerApp = function() {
		this.playerInfoBuffer = new SortedLookupTable();
		this.setupCmdMap();
	};

	Demo.ServerApp.prototype = {
		gameClockReal  			: 0,					// Actual time via "new Date().getTime();"
		gameClock				: 0,					// Seconds since start
		gameTick				: 0,					// Ticks/frames since start

		speedFactor				: 1,					// Used to create Framerate Independent Motion (FRIM) - 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
		targetFramerate			: 60,					// Try to call our tick function this often, intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
		intervalGameTick		: null,					// setInterval reference

		positionBuffer			: null,
		netChannel				: null,
		oscClient				: null,
		cmdMap					: {},					// Map the CMD constants to functions
		nextEntityID			: 0,					// Incremented for everytime a new object is created

		startGameClock: function() {

			this.entityController = new RealtimeMultiplayerGame.Controller.EntityController();
			this.setupNetChannel();
			this.oscClient = new OSC.Client(Demo.Constants.OSC_CONFIG.PORT, Demo.Constants.OSC_CONFIG.ADDRESS);
			this.gameClockReal = new Date().getTime();

			var that = this;
			this.intervalGameTick = setInterval( function(){ that.update() }, Math.floor( 1000/this.targetFramerate ));
		},

		// Methods
		setupNetChannel: function() {
			this.netChannel = new RealtimeMultiplayerGame.network.ServerNetChannel( this );
		},

		/**
		 * Map RealtimeMultiplayerGame.Constants.CMDS to functions
		 * If ServerNetChannel does not contain a function, it will check to see if it is a special function which the delegate wants to catch
		 * If it is set, it will call that CMD on its delegate
		 */
		setupCmdMap: function() {
			this.cmdMap[RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE] = this.shouldUpdatePlayer;
		},

		/**
		 * Updates the gameworld
		 * Creates a WorldEntityDescription which it sends to NetChannel
		 */
		update: function() {
			this.updateClock();

			// Allow all entities to update their position
			this.entityController.getEntities().forEach( function(key, entity){
				entity.updatePosition(this.speedFactor, this.gameClock, this.gameTick );
			}, this );

			this.sendBufferedOSCMessages();

			// Create a new world-entity-description,
			var worldEntityDescription = new RealtimeMultiplayerGame.model.WorldEntityDescription( this, this.entityController.getEntities() );
			this.netChannel.tick( this.gameClock, worldEntityDescription );
		},

		/**
		 * Sends all queued OSC messages for each client connected
		 */
		sendBufferedOSCMessages: function() {
			// For each player, send their messages
			this.playerInfoBuffer.forEach( function(key, clientMessageBuffer) {
				var i = clientMessageBuffer.length;
				while (i--) {
					// This entity is not active - remove
					var oscMessage = clientMessageBuffer[i];
					this.oscClient.send(oscMessage);
				}

				// Reset buffer array
				this.playerInfoBuffer.setObjectForKey([], key);
			}, this );
		},

		/**
		 * Updates the gameclock and sets the current
		 */
		updateClock: function() {
			// Store previous time and update current
			var oldTime = this.gameClockReal;
			this.gameClockReal = new Date().getTime();

			// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
			var delta = this.gameClockReal - oldTime;
			this.gameClock += delta;
			this.gameTick++;

			// Framerate Independent Motion -
			// 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
			this.speedFactor = delta / ( 1000/this.targetFramerate );
			if (this.speedFactor <= 0) this.speedFactor = 1;
		},


		shouldAddPlayer: function( aClientid, data ) {
			var playerEntity = new RealtimeMultiplayerGame.model.GameEntity( this.getNextEntityID(), aClientid );
			this.playerInfoBuffer.setObjectForKey([], aClientid);

			this.entityController.addEntity( playerEntity );
		},

		shouldUpdatePlayer: function( client, data ) {
			var oscMessage = new OSC.Message("/nodejs/" + client.clientid);
				oscMessage.append([data.payload.x, data.payload.y]);

			this.playerInfoBuffer.objectForKey(client.clientid).push(oscMessage);
		},

		shouldRemovePlayer: function( clientid ) {
			this.playerInfoBuffer.remove( clientid );
			this.entityController.removePlayer( clientid );
		},

		shouldEndGame: function() {
			console.log("(DemoApp)::shouldEndGame");
		},

	   	log: function() { console.log.apply(console, arguments); },

		///// Accessors
		getNextEntityID: function() {
			return ++this.nextEntityID;
		},
		getGameClock: function() {
			return this.gameClock;
		},
		getGameTick: function() {
			return this.gameTick;
		}
	};
})();