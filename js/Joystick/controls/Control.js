(function() {
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.Controller = function() {
        this._closures = {};
    };

    JoystickDemo.controls.Controller.prototype = {

        /**
         * Helper function for states to create a removable event binding
         * @param {String} eventName Name of the event to assign the listener to
         * @param {Function} listener Function to be executed when the specified event is emitted
         */
        addListener: function( target, eventName, listener ) {
			console.log("Adding Listener:", eventName);

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