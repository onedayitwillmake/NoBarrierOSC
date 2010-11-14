var requiredModules = [];

//requiredModules.push('NetChannel');
//requiredModules.push('js/lib/config.js');

require(['NetChannel'], function(NetChannel)
{
//    console.log('Main.js Arguments: ', arguments);          
//
//
    var NetChannelDelegate = function(){};


	NetChannelDelegate.prototype.init = function(DOM)
	{
		this.$ = DOM;
		var HOST = 'localhost', PORT = 28785;
		this.netChannel = new NetChannel(HOST, PORT, this);
	}

	/**
	 * These methods When netchannel recieves and validates a message
	 * Anything we receive we can assume is valid
	 * This should be left more "low level" - so logic should not be added here other than mapping messages to functions
	 **/
	NetChannelDelegate.prototype.netChannelDidConnect = function (messageData)
	{
		//			console.log("ClientGameController.prototype.netChannelDidConnect ID:", this.netChannel.clientID, messageData);
		// Having some problems with the CSS for now - create the player automatically, instead of waiting for
		// The view to tell us - this would be the same as if a user clicked 'Join'
		if (this.clientCharacter == null)
			this.view.joinGame();
	};

	NetChannelDelegate.prototype.netChannelDidReceiveMessage = function (messageData)
	{
		// TODO: Handle array of 'cmds'
		this.COMMAND_TO_FUNCTION[messageData.cmds.cmd].apply(this, [messageData]);
	};

	NetChannelDelegate.prototype.netChannelDidDisconnect = function (messageData)
	{
		console.log('ClientGameController.prototype.netChannelDidDisconnect', messageData);
		this.view.serverOffline();
	};
	
	// Everything ready - start the game client
    require.ready(function()
    {
        this.netChannel = new NetChannelDelegate(this);
		this.netChannel.init(this);
	  // var gameController = new ClientGameController(HOST, PORT);
    });
}, null, '/js/');
