/**
File:
	GameEntity.js
Created By:
	Mario Gonzalez
Project:
	RealtimeMultiplayerNodeJS
Abstract:
	This class is the base GameEntity class in JoystickDemo, it contains a position rotation, health
Basic Usage:

 	var badGuy = new JoystickDemo.GameEntity();
 	badGuy.position.x += 1;

Version:
	1.0
*/
(function(){
	JoystickDemo.namespace("JoystickDemo");

	JoystickDemo.JoystickGameEntity= function( anEntityid, aClientid ) {
        JoystickDemo.JoystickGameEntity.superclass.constructor.call( this, anEntityid, aClientid );
	};

	JoystickDemo.JoystickGameEntity.prototype = {
        _up_: false,
        _down: false,
        _left: false,
        _right: false,
        _angle: false,
		/**
		 * Update the view's position
		 */
		updateView: function() {
			// OVERRIDE
		},

		/**
		 * Updates the position of this GameEntity based on it's movement properties (velocity, acceleration, damping)
		 * @param {Number} speedFactor	A number signifying how much faster or slower we are moving than the target framerate
		 * @param {Number} gameClock	Current game time in seconds (zero based)
		 * @param {Number} gameTick		Current game tick (incrimented each frame)
		 */
		updatePosition: function( speedFactor, gameClock, gameTick ) {
			// OVERRIDE
		},

        /**
         *
         * @param entityDescription
         */
        parseJoystickData: function( entityDescription ) {
            this._analog = entityDescription.analog;
            this._button = entityDescription.button;
        },

		/**
		 * Construct an entity description for this object, it is essentually a CSV so you have to know how to read it on the receiving end
		 * @param wantsFullUpdate	If true, certain things that are only sent when changed are always sent
		 */
		constructEntityDescription: function(gameTick, wantsFullUpdate) {
			// Note: "~~" is just a way to round the value without the Math.round function call
			var returnString = this.entityid;
				returnString += "," + this.clientid;
				returnString += "," + this.entityType;
				returnString += "," + ~~this._analog;
				returnString += "," + ~~this._button;

			return returnString;
		}
	};

    JoystickDemo.extend( JoystickDemo.JoystickGameEntity, RealtimeMultiplayerGame.model.GameEntity );
})();