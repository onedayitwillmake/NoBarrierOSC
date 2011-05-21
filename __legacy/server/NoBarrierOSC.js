/**
 * IMPORTS
 */
SYS 		= require('sys');
BISON 		= require('./lib/bison.js');

var http 	= require('http'),
	url 	= require('url'),
	fs 		= require('fs'),
ArgHelper 	= require('./lib/ArgHelper.js'),
osc 	= require('./lib/osc');
require('./lib/SortedLookupTable');
//	httpServer = require('./lib/SimpleHTTPServer.js' );
	require('./network/ServerNetChannel.js');
	require('../web/js/config.js');

// Closure
var that = this;
// Http Server
//httpServer.setPrefix('/../../web');  // Where the web files are, for example you might put it in "./webserver" - here they're just in the same directory
//httpServer.listen( 8888 );

// Create the OSCClient, it will be sending messages to anything listening on the ports below
this.oscClient = new osc.Client(8889, '127.0.0.1');
this.clients = new SortedLookupTable();

// Prevent flooding by allowing X time to pass before sending messages again
var timeBetweenMessages = 50;
this.currentTime = new Date().getTime();
this.lastSentTime = this.currentTime;

// Start!
this.tickInterval = setInterval(function(){that.tick()}, 1000/60);

this.tick = function ()
{
	var prevTime = this.currentTime;
	this.currentTime = new Date().getTime();


//	if((this.currentTime - this.lastSentTime) >= timeBetweenMessages) // To early
//		return;

	// For everyone connected, send their queued messages out via OSC
	this.clients.forEach( function(key, clientMessageBuffer)
	{
		var i = clientMessageBuffer.length;
		while (i--)
		{
			// This entity is not active - remove
			var oscMessage = clientMessageBuffer[i];
			this.oscClient.send(oscMessage);

			// remove from mem
			clientMessageBuffer[i] = null;
			delete clientMessageBuffer[i];
		}

		// Clear the array
		this.clients.setObjectForKey([], key);
	}, this );
//	this.oscClient.sendSimple('/nodejs', this.touchPositionBuffer);
	this.lastSentTime = this.currentTime;
//	this.touchPositionBuffer = [];
}

/**
 * ServerNetChannelDelegate protocol
 * It will call these functions on us
 */
this.netChannelDelegate = {};
this.netChannelDelegate.nextEntityID = 0;
this.netChannelDelegate.runningClock = this.currentTime;
this.netChannelDelegate.getNextEntityID = function () { return this.netChannelDelegate.nextEntityID++ }; // incriment each time we add something
this.netChannelDelegate.onClientRemoved = function( aClientID )
{

};

this.netChannelDelegate.onClientJoined = function( aClientID )
{
	that.clients.setObjectForKey([], aClientID);
	console.log("Clients!", that.clients);
}
this.netChannelDelegate.shouldAddPlayer = function( entityID, aClientID )
{
	console.log("Clients!", that.clients);
//	this.clients.setObjectForKey(aClientID, []);
};
this.netChannelDelegate.onPlayerMoveCommand = function( aClientID, aDecodedMessage)
{
	var data = aDecodedMessage.cmds.data;
	var oscMessage = new osc.Message("/nodejs/"+aClientID);
		oscMessage.append([data.x, data.y]);

	that.clients.objectForKey(aClientID).push(oscMessage);
	console.log('p')
//	that.touchPositionBuffer.push(oscMessage)
//	that.touchPositionBuffer.push(data.x);
//	that.touchPositionBuffer.push(data.y);
//	var message = new osc.Message('/nodejs/'+client.sessionId);
//		      	message.append(messageArray[1], 'd'); // D is for double/float/number
//		      	message.append(messageArray[2], 'd');
};

// Create the NetChannel, it will be listening for messages from the browser
this.netChannel = new ServerNetChannel(this.netChannelDelegate, GAMECONFIG);
this.netChannel.start();


//console.log(httpServer);
// socket.io, I choose you
// simplest chat application evar
//var io = io.listen(httpServer);
//var buffer = [];
//var touchPositionBuffer = [];
////client.sendSimple('/oscAddress', [200]);
//io.on('connection',
//function(client)
//{
//	client.send({ buffer: buffer });
//	client.broadcast({ announcement: client.sessionId + ' connected' });
//
//	client.on('message',
//		function(message)
//		{
//			//sys.puts("RecievedMsg: " + message);
//		    if(message.indexOf("[*p*]") > -1)
//		    {
//		        var messageArray = message.split(",");
//		        touchPositionBuffer.push(messageArray[1], messageArray[2]);
//
//		        if (touchPositionBuffer.length > 10)
//		            touchPositionBuffer.shift();
//
//		      	var message = new osc.Message('/nodejs/'+client.sessionId);
//		      	message.append(messageArray[1], 'd'); // D is for double/float/number
//		      	message.append(messageArray[2], 'd');
//		      	oscClient.send(message);
//
//
//
//		        //oscClient.sendSimple('/nodejs/'+client.sessionId, touchPositionBuffer);
//		    }
//		    else
//		    {
//		        var msg = { message: [client.sessionId, message] };
//		        buffer.push(msg);
//
//		        if (buffer.length > 15) buffer.shift();
//
//
//		        client.broadcast(msg);
//
//		    }
//		});
//
//	client.on('disconnect',
//		function()
//		{
//			client.broadcast({ announcement: client.sessionId + ' disconnected' });
//		});
//});
//
//
//send404 = function(res)
//{
//	res.writeHead(404);
//	res.write('404');
//	res.end();
//};

