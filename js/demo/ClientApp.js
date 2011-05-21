
(function(){

	Demo.ClientApp = function() {
		this.gameClockReal = new Date().getTime();
		this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel( this );
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


		update: function() {
			this.updateClock();
//			this.netChannel.a
//			this.fieldController.tick(this.speedFactor, this.gameClockReal, this.gameTick);
		},

		/**
		 * Updates the gameclock and sets the current
		 */
		updateClock: function() {
			//this.netChannel.addMessageToQueue( false, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE, { x: aMouseEvent.point.x, y: aMouseEvent.point.y } );
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
			this.log("Connected!");
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


		// Display messages some fancy way
		log: function() { console.log.apply(console, arguments); },



		initMouseEvents: function() {
			var that = this;
//			document.addEventListener('mousedown', function(e) { that.onMouseDown(e) }, false);
//			document.addEventListener('mousemove', function(e) { that.onMouseMove(e) }, false);
//			document.addEventListener('mouseup', function(e) { that.onMouseUp(e) }, false);
//
//			addEventListener('mousemove', function(e) { that.onMouseMove(e) }, false);
//			$.(document).mousemove(function(event) {
//				netChannelDelegate.send(CMDS.MOVE, {x:event.pageX/self.bounds.right, y: event.pageY/self.bounds.bottom});
//				event.preventDefault();
//			});
//
//			// Convert iphone touchevent to mouseevent
//			function touchHandler(event) {
//			    var touches = event.changedTouches,
//			        first = touches[0],
//			        type = "";
//
//				event.preventDefault(); // Stop overscroll
//			    switch(event.type)
//			    {
//			        case "touchstart": type = "mousedown"; break;
//			        case "touchmove":  type="mousemove"; break;
//			        case "touchend":   type="mouseup"; break;
//			        default: return;
//			    }
//
//			    var fakeMouseEvent = document.createEvent("MouseEvent");
//			    fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
//			                              first.screenX, first.screenY,
//			                              first.clientX, first.clientY, false,
//			                              false, false, false, 0, null);
//
//			    first.target.dispatchEvent(fakeMouseEvent);
//			}
//
//			document.addEventListener("touchstart", touchHandler, true);
//			document.addEventListener("touchmove", touchHandler, true);
//			document.addEventListener("touchend", touchHandler, true);
//			document.addEventListener("touchcancel", touchHandler, true);
		}
	};
}());