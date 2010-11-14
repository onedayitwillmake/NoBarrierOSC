// Node
var http 	= require('http'),
	url 	= require('url'),
	fs 		= require('fs'),
	sys 	= require('sys');
// NoBarrierOSC
var ArgHelper 	= require('./lib/ArgHelper.js');
var osc 	= require('./lib/osc');
var httpServer = require('./lib/SimpleHTTPServer.js' );
var ServerNetChannel = require('./ServerNetChannel.js').Class;


/**
 * Create our objects
 */
var oscPort = 12345;
var httpPort = ArgHelper.getArgumentByNameOrSetDefault('port', 12345);

// OSC Client
var oscClient = new osc.Client(123456, '127.0.0.1');

// Http Server
httpServer.setPrefix('/../../web');  // Where the web files are, for example you might put it in "./webserver" - here they're just in the same directory
httpServer.listen( httpPort );

// Websocket NetChannel
this.netChannel = new ServerNetChannel({
	'delegate': this,
	'port': httpPort,
	'status': false,
	'recordFile': './../record[date].js',
	'record': false,
	'server': null
});


var that = this;
var timeBetweenMessages = 50;
this.currentTime = new Date().getTime();
this.lastSentTime = this.currentTime - timeBetweenMessages;

this.tickInterval = setInterval(function(){that.tick()}, 1000/60);

this.tick = function ()
{
	this.sendQueuedOSCMessages();
}

this.sendQueuedOSCMessages = function()
{
	var prevTime = this.currentTime;

	if((this.currentTime - this.lastSentTime) >= timeBetweenMessages) return;  // To early

//	oscClient.sendSimple('/nodejs', touchPositionBuffer);
	this.lastSentTime = this.currentTime;
	touchPositionBuffer = [];
}

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

/**
* Send OSC messages this often of whatever we happen to have
*/
//setInterval(function()
//{
//	oscClient.sendSimple('/nodejs', touchPositionBuffer);
//	touchPositionBuffer = [];				
//}, 100);