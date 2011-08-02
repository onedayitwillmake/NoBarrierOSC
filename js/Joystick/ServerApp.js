
(function(){
	var OSC = require('../lib/osc');

	JoystickDemo.ServerApp = function() {
		this.playerInfoBuffer = new SortedLookupTable();
		this.setupCmdMap();
	};

	JoystickDemo.ServerApp.prototype = {
        gameClockReal  			: 0,											// Actual time via "new Date().getTime();"
		gameClock				: 0,											// Seconds since start
		gameTick				: 0,											// Ticks/frames since start

		targetFramerate			: 60,											// Try to call our tick function this often, intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
		intervalGameTick		: null,											// setInterval reference

		netChannel				: null,
		oscClient				: null,
		cmdMap					: {},					// Map the CMD constants to functions
		nextEntityID			: 0,					// Incremented for everytime a new object is created

		startGameClock: function() {
			this.entityController = new RealtimeMultiplayerGame.Controller.EntityController();
			this.setupNetChannel();
			this.oscClient = new OSC.Client(JoystickDemo.Constants.OSC_CONFIG.PORT, JoystickDemo.Constants.OSC_CONFIG.ADDRESS);
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
			// Create a new world-entity-description,
			var worldEntityDescription = new JoystickDemo.WorldEntityDescription( this, this.entityController.getEntities() );
			this.netChannel.tick( this.gameClock, worldEntityDescription );
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

        /**
         * Called after a connection has been established
         * @param {String} aClientid
         * @param data
         */
		shouldAddPlayer: function( aClientid, data ) {
			var playerEntity = new JoystickDemo.JoystickGameEntity( this.getNextEntityID(), aClientid );
            playerEntity.entityType = data.payload.type;
			this.playerInfoBuffer.setObjectForKey([], aClientid);
			this.entityController.addPlayer( playerEntity );
		},

        /**
         * Called continuously by a connected joystick - contains information about the state of the joystick
         * @param {RealtimeMultiplayerGame.network.Client} client
         * @param {Object} data
         */
		shouldUpdatePlayer: function( client, data ) {
			var player = this.entityController.getPlayerWithid( client.clientid );
            player.parseJoystickData( data.payload );
		},

        /**
         * Called when a connected client has disconnected
         * @param {String} clientid Id of the disconnected client
         */
		shouldRemovePlayer: function( clientid ) {
			var oscMessage = new OSC.Message("/nodejs/" + clientid);
				oscMessage.append(["drop", String(clientid)]);
			this.oscClient.send(oscMessage);

			this.playerInfoBuffer.remove( clientid );
			this.entityController.removePlayer( clientid );
		},

	   	log: function() { console.log.apply(console, arguments); },

		///// Accessors
		getNextEntityID: function() { return ++this.nextEntityID; },
		getGameClock: function() { return this.gameClock; },
		getGameTick: function() { return this.gameTick; }
	};
})();