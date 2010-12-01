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
		console.log('ClientGameController.netChannelDidReceiveMessage', messageData);
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