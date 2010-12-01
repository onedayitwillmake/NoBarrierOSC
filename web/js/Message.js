/**
File:
	Message.js
Created By:
	Mario Gonzalez
Project	:
	Ogilvy Holiday Card 2010
Abstract:
	A common class for sending messages to the server.
	Contains aSequence number, and clientID
Basic Usage:
	// Create the data that will live in the message
	var command = {};
	// Fill in the data
	command.cmd = aCommandConstant;
	command.data = {x:1, y:1};

	// Create the message
	var message = new Message(this.outgoingSequence, true, command)

	// Send the message (can happen later on)
	message.messageTime = this.realTime; // Store to determin latency

	(from netchannel)
	this.connection.send(message.encodedSelf());
*/

var init = function()
{
	return new JS.Class(
	{
		/**
		* A message is a small value-object wrapper
		* @param aSequenceNumber 	Ties us to an array by the owning class
		* @param isReliable		This message MUST be sent if it is 'reliable' (Connect / Disconnect). If not it can be overwritten by newer
		  messages (for example moving is unreliable, because once it's outdates its worthless if new information exist)
		* @param anEncodedMessage	The actualMessage that will be sent. Already encoded
		**/
		initialize: function(aSequenceNumber, isReliable, anUnencodedMessage)
		{
			// Info
			this.sequenceNumber = aSequenceNumber;
			this.clientID = -1; // Some kind of hash value returned to the NetChannel from the server on connect

			// Data
			this.unencodedMessage = anUnencodedMessage;

			// State
			this.messageTime = -1;
			this.isReliable = isReliable;
		},
		/**
		* Encode data to send using BISON
		*/
		encodedSelf: function()
		{
			if(this.clientID == -1) {
				console.log("(Message) Sending message without clientID. Note this is ok, if it's the first message to the server.");
			};

			if(this.messageTime == -1) {
				console.log("(Message) Sending message without messageTime. Expected result is undefined");
			}

			return BISON.encode({id:this.clientID, seq:this.sequenceNumber, cmds:this.unencodedMessage, t:this.messageTime});
		}
	});
};

if (typeof window === 'undefined') {
	require('./lib/bison.js');
	Message = init();
} else {

	define(['lib/jsclass/core', 'lib/bison'], init);
}