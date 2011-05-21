NoBarrierOSC
============
#### Everyone interact!

`NoBarrierOSC` is a Node.js / Websocket server (using a a set of projects mangled together) that allows all users on arbitrary webpage send OSC messages to any listening application, and each other via any modern browser including iOS/iPhone.

## Demo
[http://vimeo.com/17356351](http://vimeo.com/17356351)
##Usage 
### Starting the server
`node js/demo/server.js`

### Communication via browser
##### Although the current system seems convoluted and overly complex - it's designed so that users also stay in sync between one another:

		///// Implement these functions in your delegate, or look at the demo and steal from those
		netChannelDidConnect: function() {},
		netChannelDidReceiveMessage: function( aMessage ) {},
		netChannelDidDisconnect: function() {},
		parseEntityDescriptionArray: function(){},
		log: function() {},
		getGameClock: function() {}


		///// Initialize the ClientNetChannel which will communicate with the Node.js server on your behalf
		this.netChannel = new RealtimeMultiplayerGame.ClientNetChannel( this );

		///// Send it messages whenever you want
		this.netChannel.addMessageToQueue( false, RealtimeMultiplayerGame.Constants.CMDS.PLAYER_UPDATE, {
							x: Math.round(this._mousePosition.x*100), y:  Math.round(this._mousePositionNormalized.y*100) } );
### Credits

Mario Gonzalez &lt;mariogonzalez@gmail.com&gt;

### License
Whatever license any of the technologies used is carried over.
This project itself is released under Creative Commons Attribution 2.0 license       