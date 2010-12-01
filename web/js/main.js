/**
	  ####  #####  ##### ####    ###  #   # ###### ###### ##     ##  #####  #     #      ########    ##    #  #  #####
	 #   # #   #  ###   #   #  #####  ###    ##     ##   ##  #  ##    #    #     #     #   ##   #  #####  ###   ###
	 ###  #   #  ##### ####   #   #   #   ######   ##   #########  #####  ##### ##### #   ##   #  #   #  #   # #####
 -
 File:
 	main.js
 Created By:
 	Mario Gonzalez
 Project	:
 	None
 Abstract:
 	A CirclePack.js example
 Basic Usage:
	http://onedayitwillmake.com/CirclePackJS/
*/
//require(['js/lib/Vector.js', 'js/lib/SortedLookupTable.js', 'js/PackedCircle.js', 'js/PackedCircleManager.js', 'js/lib/Stats.js'], function() {
require(["NetChannel", "config"], function(NetChannel) // Make Require load NetChannel for us
{
	NetChannelDelegate = function(DOM)
	{
		// The node server IP
		var HOST = "10.29.145.48",/*'localhost',*/
			PORT = 28785;

		this.netChannel = new NetChannel(HOST, PORT, this);

		// intervalFramerate, is used to determin how often to call settimeout - we can set to lower numbers for slower computers
		// this.targetDelta, Milliseconds between frames 16ms means 60FPS - it's the framerate the game is designed against
		this.intervalFramerate = 60; // Try to call our tick function this often
		this.targetDelta = Math.floor( 1000/this.intervalFramerate );

		// Loop
		this.clockActualTime = new Date().getTime();
		this.gameClock = 0;									// Our game clock is relative
		this.gameTick = 0;

		var that = this;
		this.gameTickInterval = setInterval(function(){that.tick()}, this.targetDelta);
	};

	NetChannelDelegate.prototype.tick = function ()
	{
		// Store the previous clockTime, then set it to whatever it is no, and compare time
		var oldTime = this.clockActualTime;
		var now = this.clockActualTime = new Date().getTime();
		var delta = ( now - oldTime );			// Note (var framerate = 1000/delta);

		// Our clock is zero based, so if for example it says 10,000 - that means the game started 10 seconds ago
		this.gameClock += delta;
		this.gameTick++;

		// Framerate independent motion
		// Any movement should take this value into account,
		// otherwise faster machines which can update themselves more accurately will have an advantage
		var speedFactor = delta / ( this.targetDelta );
		if (speedFactor <= 0) speedFactor = 1;

		this.netChannel.tick(this.gameClock);
	};

	/**
	 * These methods When netchannel recieves and validates a message
	 * Anything we receive we can assume is valid
	 * This should be left more "low level" - so logic should not be added here other than mapping messages to functions
	 **/
	NetChannelDelegate.prototype.netChannelDidConnect = function (messageData)
	{
		console.log("ClientGameController.netChannelDidConnect ID:", messageData);
	};

	NetChannelDelegate.prototype.netChannelDidReceiveMessage = function (messageData)
	{
		// TODO: Handle array of 'cmds'
		console.log('ClientGameController.netChannelDidReceiveMessage', messageData);
//		this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this, [messageData]);
	};

	NetChannelDelegate.prototype.send = function(aCommandConstant, commandData) {
		var composedMessage = this.netChannel.composeCommand(aCommandConstant, commandData);
		this.netChannel.addMessageToQueue(false, composedMessage);

		console.log('(NetChannelDelegate).send', commandData.x, commandData.y);
	};
	
	NetChannelDelegate.prototype.netChannelDidDisconnect = function (messageData)
	{
		console.log('ClientGameController.netChannelDidDisconnect', messageData);
//		this.view.serverOffline();
	};
//
//
//
//	/**
//	 * These methods When netchannel recieves and validates a message
//	 * Anything we receive we can assume is valid
//	 * This should be left more "low level" - so logic should not be added here other than mapping messages to functions
//	 **/
//	this.netChannelDidConnect = function (messageData)
//	{
//		//			console.log("ClientGameController.prototype.netChannelDidConnect ID:", this.netChannel.clientID, messageData);
//		// Having some problems with the CSS for now - create the player automatically, instead of waiting for
//		// The view to tell us - this would be the same as if a user clicked 'Join'
//		if (this.clientCharacter == null)
//			this.view.joinGame();
//	};
//
//	this.netChannelDidReceiveMessage = function (messageData)
//	{
//		// TODO: Handle array of 'cmds'
//		this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this, [messageData]);
//	};
//
//	this.netChannelDidDisconnect = function (messageData)
//	{
//		console.log('ClientGameController.prototype.netChannelDidDisconnect', messageData);
//		this.view.serverOffline();
//	};
	
	/**
	 * Create N Circles, and add them to a div you already created (in thise case, #touchArea)
	 */
	var container = document.getElementById("touchArea");
//			var amountOfCircles = 45;
//
//			// Define the bounding box where the circles will live
//			//(Note: im not updating bounds for you on resize, just update the .bounds property inside PackedCircleManager)
//			this.bounds= {left: 0, top: 0, right: $(window).width(), bottom: $(window).height()}; // Use the whole window size for my case
//
//			// Initialize the PackedCircleManager
//			this.circleManager = new PackedCircleManager();
//			this.circleManager.setBounds(this.bounds);
//
//			// Create N circles
//			for(var i = 0; i < amountOfCircles; i++)
//			{
//				var radius = Math.floor(Math.random() * 50) + 20;
//				var diameter = radius*2;
//
//				var aCircleDiv = document.createElement('div');
//          		aCircleDiv.className = 'packedCircle';
//				aCircleDiv.id = 'circ_'+i;
//				aCircleDiv.style.width = diameter+"px";
//				aCircleDiv.style.height = diameter+"px";
//
//				$(aCircleDiv).css('background-image', "url(./images/circle-"+Math.floor(Math.random() * 7)+".png)");
//				$(aCircleDiv).css('background-position', 'center');
//
//				// [Mozilla] : Scale the background width
//				$(aCircleDiv).css('-moz-background-size', (radius*2) + "px" + " " + (radius*2) + "px");
//
//				// Create the packed circle, and add it to our lists
//				var aPackedCircle = new PackedCircle(aCircleDiv, radius);
//				this.circleManager.addCircle(aPackedCircle);
//				container.appendChild(aCircleDiv);
//			}
//
//			/**
//			 * Updates the positions of the circles divs and runs the collision & target chasing
//			 */
//			function updateCircles()
//			{
//				this.circleManager.pushAllCirclesTowardTarget(this.circleManager.desiredTarget); // Push all the circles to the target - in my case the center of the bounds
//				this.circleManager.handleCollisions();    // Make the circles collide and adjust positions to move away from each other
//
//				// Position circles based on new position
//				var circleArray = this.circleManager.allCircles;
//				var len = circleArray.length;
//
//				for(var i = 0; i < len; i++)
//				{
//					var aCircle = circleArray[i];
//					this.circleManager.handleBoundaryForCircle(aCircle); // Wrap the circles packman style in my case. Look in the function to see different options
//
//					// Get the position
//					var xpos = aCircle.position.x - aCircle.radius;
//					var ypos = aCircle.position.y - aCircle.radius;
//
//					var delta = aCircle.previousPosition.distanceSquared(aCircle.position);
//
//					// Anything else we won't bother asking the browser to re-render
//					if(delta > -0.01) // bug - for now we always re-render
//					{
//						var circleDiv = document.getElementById("circ_"+i);
//
//						// Matrix translate the position of the object in webkit & firefox
//						circleDiv.style.webkitTransform ="translate3d("+xpos+"px,"+ypos+"px, 0px)";
//						circleDiv.style.MozTransform ="translate("+xpos+"px,"+ypos+"px)";
//
//						// [CrossBrowser] : Use jQuery to move the object - uncomment this if all else fails. Very slow.
//						//$(aCircle.div).offset({left: xpos, top: ypos});
//
//						// [Mozilla] : Recenter background
//						if(aCircle.radius > aCircle.originalRadius)
//						{
//							var backgroundPostionString = (aCircle.radius*2) + "px" + " " + (aCircle.radius*2) + "px";
//							$(circleDiv.div).css('-moz-background-size', backgroundPostionString);
//						}
//					}
//
//					// Store the old position for next time
//					aCircle.previousPosition = aCircle.position.cp();
//				}
//			}
//
//			/**
//			 * We're all set to start.
//			 * Let's randomize the circle positions, and call handleCollisions one time manually to push the circles away from one another.
//			 *
//			 * Finally lets call the index.html 'onCirclePackingInitComplete'
//			 */
//			this.circleManager.randomizeCirclePositions();
//			this.circleManager.handleCollisions();
//
//			setInterval(function(){ updateCircles();}, 1000/30);  // 30 is the framerate



	require.ready(function() // wait for requires 'ready' to be called, once all dependencies have been loaded
	{
		// Catch 'console = undefined' errors in firefox
		var console = window['console'];
		var $ = this['$'];
		

		// Call the fake onDocumentComplete inside index.html
		if(onNoBarrierOSCInitComplete)
			onNoBarrierOSCInitComplete();
	})
});