/**
File:
	serverside.js
Created By:
	Mario Gonzalez
Project:
	NoBarrierOSC
Abstract:
	Server starting point
Basic Usage:
 	node server.js
Version:
	1.0
*/
require("../lib/SortedLookupTable.js");
require("../core/RealtimeMutliplayerGame.js");
require("../model/Point.js");
require("../model/Constants.js");
require("../model/NetChannelMessage.js");
require("../core/EntityController.js");
require("../network/Client.js");
require("../network/ServerNetChannel.js");
require("../model/GameEntity.js");

require("./JoystickNamespace.js");
require("./JoystickConstants.js");
require("./JoystickGameEntity.js");
require("./JoystickWorldEntityDescription.js");
require("./ServerApp.js");

var serverApp = new JoystickDemo.ServerApp();
serverApp.startGameClock();
