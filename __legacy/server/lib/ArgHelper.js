/**
File:
	ArgHelper.js
Created By:
	Mario Gonzalez
Project:
	Ogilvy Holiday Card 2010
Abstract:
	Allows accessing of process argument as name value pairs.
Basic Usage: 
	var ArgHelper 	= require('./argHelper.js');
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 3.0); // returns 3.0
	
	// ...inside some other file
	var movespeed = ArgHelper.getArgumentByNameOrSetDefault(movespeed, 1000); // returns 3.0
	
Version:
	1.0
*/
// Make argument name value pairs, and defualts globally accessable
if(global.__ARGHELPER == undefined)
{
	global.__ARGHELPER = this;
	this.nameValuePairs = {};
}
	
var that = global.__ARGHELPER;
that.outputAllArgumentsToConsole = function()
{
	console.log('(ArgHelper) Node created with process arguments:');
	process.argv.forEach(function(val, index, array)
	{
		console.log("\t"+index+" : '"+val+"'");
	});
}

that.getArgumentByNameOrSetDefault = function(anArgumentName, defaultValue)
{
	// No needle supplied
	if(anArgumentName == undefined) {
		console.log("(ArgHelper) Cannot 'getArgumentByName' with undefined argument!' ");
		return;
	};
	
	// Already previously set return default
	if(that.nameValuePairs[anArgumentName] != undefined) {
		return that.nameValuePairs[anArgumentName];
	}
	var returnValue = undefined;
	
	process.argv.forEach(function(val, index, array)
	{
		// not a name-value pair?
		if(val.indexOf("=") == -1)
			return;
		
		// Convert to name-value pair
		var nameValuePair = val.split('=');
		
		// See if name = anArgumentNAme
		if(nameValuePair[0] != anArgumentName)
			return;
			
		// set that as returnValue, if dupes last one overrides previous 
		returnValue = nameValuePair[1];
	});
	
	// Check if match found, otherwise set to default
	if(returnValue == undefined) {
		console.log("(ArgHelper) No match found for '"+anArgumentName+"'" + " in process arguments. Setting value to "+ defaultValue +"");
		
		returnValue = defaultValue;
	}	
	
	// Convert string based Booleans - This is not the fastest, but it doesn't matter
	// On subsequent calls we never get this far as the value is already set
	if(returnValue == 'true' || returnValue == '1') returnValue = true;
	else if(returnValue == 'false' || returnValue == '0') returnValue = false;
		
	// Store
	that.nameValuePairs[anArgumentName] = returnValue;
	return returnValue;
}

// Trace out on first one
if(this == that)
	this.outputAllArgumentsToConsole();