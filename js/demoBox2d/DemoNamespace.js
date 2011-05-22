/**
File:
	DemoNamespace.js
Created By:
	Mario Gonzalez
Project:
	NoBarrierOSC
Abstract:
	This file contains the namespace for NoBarrierOSC demo and a few helper functions for namespaces/inheritance

Basic Usage:
 	This class is not instantiated
Version:
	1.0
*/
Demo = (typeof Demo === 'undefined') ? {} : Demo;
/**
 * Allows a package to create a namespace within Demo
 * From Javascript Patterns book
 * @param ns_string
 */
Demo.namespace = function(ns_string)
{
	var parts = ns_string.split('.'),
		parent = Demo,
		i = 0;

	// strip redundant leading global
	if (parts[0] === "Demo") {
		parts = parts.slice(1);
	}

	var len = parts.length,
		aPackage = null;
	for (i = 0; i < len; i += 1) {
		var singlePart = parts[i];
		// create a property if it doesn't exist
		if (typeof parent[singlePart] === "undefined") {
		   parent[singlePart] = {};
		}
		parent = parent[singlePart];

	}
	return parent;
};

/**
 * Allows a simple inheritance model
 * based on http://www.kevs3d.co.uk/dev/canvask3d/scripts/mathlib.js
 */
Demo.extend = function(subc, superc, overrides)
{
   /**
	* @constructor
	*/
	var F = function() {};
	var i;

	if (overrides) {
		F.prototype = superc.prototype;
		subc.prototype = new F();
		subc.prototype.constructor = subc;
		subc.superclass = superc.prototype;
		if (superc.prototype.constructor == Object.prototype.constructor)   {
		   superc.prototype.constructor = superc;
		}
	   for (i in overrides) {
		  if (overrides.hasOwnProperty(i)) {
			 subc.prototype[i] = overrides[i];
		  }
	   }
	} else {

		subc.prototype.constructor = subc;
		subc.superclass= superc.prototype;
		if (superc.prototype.constructor == Object.prototype.constructor)   {
		   superc.prototype.constructor = superc;
		}
		for( i in superc.prototype ) {
			if ( false==subc.prototype.hasOwnProperty(i)) {
				subc.prototype[i]= superc.prototype[i];
			}
		}

	}
}
