(function() {
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.Controller = function() {
        this._closures = {};
        this._touchIdentifier = 0;
    };

    JoystickDemo.controls.Controller.prototype = {
        /**
         * @type {Number} Unique ID of the touch we're tracking
         */
        _touchIdentifier        : 0,

        /**
         * Hit area padding
         * @type {Number}
         */
        _hitAreaBuffer         : 20,

        /**
         * Helper function for states to create a removable event binding
         * @param {String} eventName Name of the event to assign the listener to
         * @param {Function} listener Function to be executed when the specified event is emitted
         */
        addListener: function( target, eventName, listener ) {
			//console.log("Adding Listener:", eventName);

            listener.eventName = eventName;
            listener.target = target;

            target.addEventListener(eventName, listener, false);

            // TODO: THROW ERROR IF NOT NULL
            this._closures[ eventName ] = listener;
        },

        /**
         * Helper function for states to remove an event binding.
         * Assumes this._closures[eventName] is a valid object.
         * @param eventName
         */
        removeListener: function( target, eventName ) {
            if( !this._closures[eventName] ) return;
            
            target.removeEventListener(eventName, this._closures[eventName], false);
            this._closures[eventName] = null;
        },

		/**
		 * Removes all listeners
		 */
		removeAllListeners: function() {
			for( var eventName in this._closures ) {
                var listener = this._closures[eventName];
				this.removeListener( listener.target, listener.eventName );
			}
		},

        //http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript
        getOffset: function(el) {
            var _x = 0;
            var _y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.parentNode;
            }
            return { top: _y, left: _x };
        },


        /**
         * Checks all touches in the event and returns an array of ones which pass our hitTest
         * @param {TouchList} touchList A list of touches to check. Usually pass in - event.changedTouches or event.touches
         */
        getValidTouches: function( touchList ) {
            var validTouches = [];
            for(var i = 0; i < touchList.length; i++) {
                if( this.hitTest( touchList[i] ) ) {
                    validTouches.push( touchList[i] );
                }
            }

            return validTouches;
        },

        /**
         * Loops through the touches to check if any of the touches in the touchlist match our touchIdentifier
         * @param {Array}   A touch list from the event - e.changedTouches | e.touches | e.targetedTouches
         * @return {Touch} A touch event that matches our identifier
         */
        getTouchOfInterest: function(touchList) {
            for(var i = 0; i < touchList.length; i++) {
                if( touchList[i].identifier === this._touchIdentifier )
                    return touchList[i];
            }

            return null;
        },

        /**
         * Hit test against touch
         * @param {Touch} e
         * @return Boolean
         */
        hitTest: function( e ) {
            if( !this._touchAreaHtmlElement ) {
                throw new Error("This controller doesn't have an '_touchAreaHtmlElement' set! hitTest aborted...");
            }
            var radius = this._touchAreaHtmlElement.offsetWidth/2;

            // Get the offset of our element
            var offset = this.getOffset(this._touchAreaHtmlElement);

            // Offset it by the stage position
            var layerX = e.screenX - offset.left;
            var layerY = e.screenY - offset.top;

            // Convert to center based
            var x = Math.round(layerX - radius);
            var y = Math.round(layerY - radius);

            var dist = Math.sqrt(x*x + y*y);

            return dist < (radius+this._hitAreaBuffer);
        },

        /**
		 * Convert touch to mouse events
		 * @param event
		 */
		touchHandler: function( event ) {
			var touches = event.changedTouches,
			first = touches[0],
			type = "";

			event.preventDefault();
			switch(event.type) {
				case "touchstart": type = "mousedown"; break;
				case "touchmove":  type ="mousemove"; break;
				case "touchend":   type ="mouseup"; break;
				default: return;
			}

			// Pass off as mouse event
			var fakeMouseEvent = document.createEvent("MouseEvent");
			fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
									  first.screenX, first.screenY,
									  first.clientX, first.clientY, false,
									  false, false, false, 0, null);

			first.target.dispatchEvent(fakeMouseEvent);
		}

    }

})();