
(function(){

	Demo.ClientApp = function() {
		this.gameClockReal = new Date().getTime();
		this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel( this );

		this.initMouseEvents();
	};

	Demo.ClientApp.prototype = {

		gameClockReal  			: 0,											// Actual time via "new Date().getTime();"
		gameClock				: 0,											// Seconds since start
		gameTick				: 0,											// Ticks/frames since start

		speedFactor				: 1,											// Used to create Framerate Independent Motion (FRIM) - 1.0 means running at exactly the correct speed, 0.5 means half-framerate. (otherwise faster machines which can update themselves more accurately will have an advantage)
		targetFramerate			: 60,											// Try to call our tick function this often, intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers

		netChannel				: null,											// ClientNetChannel instance
		fieldController			: null,											// FieldController
		cmdMap					: {},											// Map some custom functions if wnated


		_mouseIsDown			: false,
		_mousePosition			: {},		// Actual mouse position
		_mousePositionNormalized: {},		// Mouse position 0-1

		/**
		 * Initialize mouse/touch events
		 */
		initMouseEvents: function() {
			var that = this;
			document.addEventListener('mousedown', function(e) { that.onMouseDown(e) }, false);
			document.addEventListener('mousemove', function(e) { that.onMouseMove(e) }, false);
			document.addEventListener('mouseup', function(e) { that.onMouseUp(e) }, false);
			document.addEventListener("touchstart", that.touchHandler, true);
			document.addEventListener("touchmove", that.touchHandler, true);
			document.addEventListener("touchend", that.touchHandler, true);
			document.addEventListener("touchcancel", that.touchHandler, true);
		},


		update: function() {
			this.updateClock();
			if(this._mouseIsDown) {
				this.netChannel.addMessageToQueue( false, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE, {
					x: (this._mousePositionNormalized.x*100) << 0, y:  (this._mousePositionNormalized.y*100) << 0 } );
			}
			this.netChannel.tick();
//			this.fieldController.tick(this.speedFactor, this.gameClockReal, this.gameTick);
		},

		/**
		 * Updates the gameclock and sets the current
		 */
		updateClock: function() {
			//
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

		netChannelDidConnect: function() {
			this.joinGame( "user" + this.netChannel.getClientid() );
		},

		netChannelDidReceiveMessage: function( aMessage ) {
			this.log("RecievedMessage", aMessage);
		},
		netChannelDidDisconnect: function() {
			this.log("netChannelDidDisconnect", arguments);
		},
		parseEntityDescriptionArray: function(){
			this.log("parseEntityDescriptionArray", arguments);
		},
		getGameClock: function() {
		   return this.gameClock;
		},


		onMouseDown: function(event) {
			this._mouseIsDown = true;
		},

		onMouseMove: function(e) {
			var x, y;

			// Get the mouse position relative to the canvas element.
			if (e.layerX || e.layerX == 0) { // Firefox
				x = e.layerX;
				y = e.layerY;
			} else if (e.offsetX || e.offsetX == 0) { // Opera
				x = e.offsetX;
				y = e.offsetY;
			}

			this._mousePosition.x = x;
			this._mousePosition.y = y;

			// Clamp between 0-1 of window size
			this._mousePositionNormalized.x = Math.max(0.0, Math.min(1.0, this._mousePosition.x / window.innerWidth));
			this._mousePositionNormalized.y = Math.max(0.0, Math.min(1.0, this._mousePosition.y / window.innerHeight));
		},

		onMouseUp: function(event) {
		   this._mouseIsDown = false;
		},

		/**
		 * Called when the user has entered a name, and wants to join the match
		 * @param aNickname
		 */
		joinGame: function(aNickname)
		{
			this.nickname = aNickname;
			// Create a 'join' message and queue it in ClientNetChannel
			this.netChannel.addMessageToQueue( true, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_JOINED, { nickname: this.nickname } );
		},

		// Display messages some fancy way
		log: function() { console.log.apply(console, arguments); },

		/**
		 * Convert touch to mouse events
		 * @param event
		 */
		touchWrapper: function( event ) {
			var touches = event.changedTouches,
			first = touches[0],
			type = "";

			event.preventDefault();
			switch(event.type) {
				case "touchstart": type = "mousedown"; break;
				case "touchmove":  type ="mousemove"; break;
				case "touchend":   type ="mouseup"; break;
				default: return;
			}

			// Pass off as mouse event
			var fakeMouseEvent = document.createEvent("MouseEvent");
			fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
									  first.screenX, first.screenY,
									  first.clientX, first.clientY, false,
									  false, false, false, 0, null);

			first.target.dispatchEvent(fakeMouseEvent);
		}
	};
}());