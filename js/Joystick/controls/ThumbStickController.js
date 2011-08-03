(function(){
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.ThumbStickController = function( elementSuffix ){
        JoystickDemo.controls.ThumbStickController.superclass.constructor.call(this);


		this.elementSuffix = elementSuffix;
        this._hitAreaBuffer *= 3;
        this.setup();
    }; 

    JoystickDemo.controls.ThumbStickController.prototype = {
        /**
         * @type {HTMLElement}
         */
        _nub : null,

        /**
         * Range of the nub can move
         * @type {Number}
         */
        _radius: 0,
        /**
         * Radius of the 'nub' element that represents the users press
         */
        _nubRadius : 0,

        /**
         * @type {Number}
         */
        _angle      : 0,

        _mouseIsDown: false,

        /**
         * @type {HTMLElement}
         */
        _touchAreaHtmlElement: null,

        _closures   : {},

        setup: function( ) {
            this._touchAreaHtmlElement = document.getElementById("thumb_stick_touch_area_" + this.elementSuffix);
            this._radius = this._touchAreaHtmlElement.offsetWidth/2;
            this._nub = document.getElementById("thumb_stick_nub_" + this.elementSuffix);
            this._nubRadius = this._nub.offsetWidth/2;

            this.onMouseUp(null); // reset the mouse

            var that = this;


            // Listen for mouse events
            var that = this;
            //this.addListener( this._touchAreaHtmlElement, "mousedown", function(e){ that.onMouseDown(e);} );
            this.addListener( this._touchAreaHtmlElement, "touchstart", function(e){ that.onTouchStart(e);} );
        },

        /**
         * Called on 'touchstart' - Grabs the first touch, stores the identifier and starts listening for 'touchmove', 'touchend'
         * @param {TouchEvent} e
         */
        onTouchStart: function(e) {
            console.log("TOUCH")
            if( this._touchIdentifier !== 0 ) {
                console.log("ThumbStickController::onTouchStart - Already have a touch '"+this._touchIdentifier+"' - Aborting...");
                return;
            }
            
            var validTouches  = this.getValidTouches(e.touches);

            if( validTouches[0] ) {
                this._touchIdentifier = validTouches[0].identifier;
            } else {
                console.log("ThumbstickController::onTouchStart - No valid touches found!");
                return;
            }


            console.log( validTouches.length);
            console.log( this._touchIdentifier );

            // Inform all buttons
            //this.relayTouchToButtons( e.touches[0], 'touchmove' );
			this.onTouchMove(e);

            var that = this;
            this.addListener( document, "touchmove", function(e){ that.onTouchMove(e);} );
            this.addListener( document, "touchend", function(e){ that.onTouchEnd(e);} );
        },

        /**
         * Called on 'touchmove' - Checks to see if the touch we're interested in is in the list of changed touches.
         * If it is, relayTouchToButtons is called
         * @param {TouchEvent} e
         */
        onTouchMove: function(e) {
            if(this._touchIdentifier === 0) return;

            // See if it was the one we're interested in
            var touchOfInterest = this.getTouchOfInterest(e.changedTouches);
            if(!touchOfInterest) return;


			this.setAngle(touchOfInterest);
            // Inform all buttons
//            this.relayTouchToButtons( touchOfInterest, e.type );
        },

        /**
         * Called on 'touchmove' - Checks if the touch we're interested in is in the list of changed touches.
         * If it is, relayTouchToButtons is called, and event listeners are cleaned up
         * @param e
         */
        onTouchEnd: function(e) {
            if(this._touchIdentifier === 0) return;

            // See if it was the one we're interested in
            var touchOfInterest = this.getTouchOfInterest(e.changedTouches);
            if(!touchOfInterest) return;


			this._angle = 0;
            this._touchIdentifier = 0;

            // Clean up event listeners
            this.removeListener( document, "touchmove" );
            this.removeListener( document, "touchend" );

			 // Recenter nub
            this._nub.style.top = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
            this._nub.style.left = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
        },

        /**
         * Dispatches a touch event to all attached buttons
         * @param {Touch} touchOfInterest
         * @param {String} type A type string, can be 'touchstart', 'touchmove', 'touchend'
         */
        relayTouchToButtons: function( touchOfInterest, type ) {
            if( !touchOfInterest ) {
                console.error("relayTouchToButtons: - Error, no 'touchOfInterest' supplied");
            }

//            console.log('on'+type)
//            return;
            // Relay touch
            for(var prop in this._buttons) {
                if( !this._buttons.hasOwnProperty(prop) ) return;
                this._buttons[prop]['on'+type]( touchOfInterest );
            }
        },

        /**
         * Mousedown callback
         * @param {MouseEvent} e
         */
        onMouseDown: function(e) {
            this._mouseIsDown = true;

            var that = this;

            // Remove event listeners
            this.removeListener(document, 'mousemove');
            this.removeListener(document, 'mouseup');
            this.removeListener(document, "touchmove");
			this.removeListener(document, "touchend");

            // Add event listeners
            this.addListener( document, 'mousemove', function(e){ that.onMouseMove(e);} );
            this.addListener( document, 'mouseup', function(e){ that.onMouseUp(e);} );
            this.addListener( document, "touchmove", that.touchHandler);
			this.addListener( document, "touchend", that.touchHandler);
        },

        /**
         * Set angle based on nub location
         * @param {MouseEvent} e
         */
        onMouseMove: function(e) {
            if(!this._mouseIsDown) return;
			this.setAngle(e);
        },

        /**
         * Reset the nub
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._mouseIsDown = false;
			this._angle = 0;

            // Remove listeners
            var that = this;
            this.removeListener(document, 'mousemove');
            this.removeListener(document, 'mouseup');
            this.removeListener(document, "touchmove");
            this.removeListener(document, "touchend");
            
            // Recenter nub
            this._nub.style.top = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
            this._nub.style.left = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
        },

		/**
		 * TouchEvent or mouseevent
		 * @param e
		 */
		setAngle: function( e ) {
			// Get the offset of our element
			var offset = this.getOffset(this._touchAreaHtmlElement);
			// Offset it by the stage position
			var layerX = e.clientX - offset.left;
			var layerY = e.clientY - offset.top;
			// Offset it by our radius
			var x = this._radius-layerX;
			var y = this._radius-layerY;
			this._angle = Math.atan2(y, x);

			var top = (Math.sin(-this._angle)*this._radius/2) + this._radius - this._nub.offsetWidth/2;
			var left = (Math.cos(this._angle)*-this._radius/2) + this._radius - this._nub.offsetWidth/2;
			this._nub.style.top = Math.round(top) + "px";
			this._nub.style.left = Math.round(left) + "px";
		},
        ///// ACCESSORS
        getAngle: function() {
			return this.angle;
		},

		/**
		 * Returns the angle between 0-360 degrees
		 */
		getAngle360: function() {
			if(this._angle === 0) return 0;

			var angle = (this._angle-1.57079633) * 180/Math.PI;
			while(angle < 0)
				angle += 360;

			return angle;
		}
    };

    JoystickDemo.extend( JoystickDemo.controls.ThumbStickController, JoystickDemo.controls.Controller );
})();