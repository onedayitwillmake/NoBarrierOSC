(function(){
    JoystickDemo.namespace("JoystickDemo.controls");

	/**
	 * Creates a new ButtonController, if shouldCatchOwnEvents it can handle its own touch events
	 * @param anHTMLElement
	 * @param shouldCatchOwnEvents
	 */
    JoystickDemo.controls.ButtonController = function( anHTMLElement, shouldCatchOwnEvents ){
        JoystickDemo.controls.ButtonController.superclass.constructor.call(this);
		if(!anHTMLElement) {
			throw new Error("anHTMLElement cannot be null!");
		}

        this._htmlElement = anHTMLElement;
		this._catchOwnEvents = shouldCatchOwnEvents;
        this.setup();
    };

    JoystickDemo.controls.ButtonController.prototype = {
        /**
         * @type {Boolean}
         */
        _isDown         : false,

        /**
         * @type {HTMLElement}
         */
        _htmlElement    : null,

        /**
         * Hit area padding
         * @type {Number}
         */
        _buffer         : 20,

        /**
         * Setup event listeners and etc
         */
        setup: function( ) {
			if(!this._catchOwnEvents) return;

			var that = this;
            this.addListener( this._htmlElement, 'mousedown', function(e){ that.onMouseDown(e);} );
            this.addListener( this._htmlElement, 'touchstart', function(e){ that.ontouchstart(e);} );
        },

		onMouseDown: function(e) {
			this.ontouchstart(e);

			var that = this;
			this.addListener( document, 'mouseup', function(e){ that.ontouchend(e);} );
		},

        /**
         * Mousedown callback
         * @param {MouseEvent} e
         */
        ontouchstart: function(e) {
            this._isDown = true;
            this._htmlElement.style.opacity = (this._isDown) ? 1 : 0.25;

			var that = this;
			if(this._catchOwnEvents) {
				this.addListener( document, 'touchend', function(e){ that.ontouchend(e);} );
			}
        },

        /**
         * Set angle based on nub location
         * @param {MouseEvent} e
         */
        ontouchmove: function(e) {
            this._isDown = this.hitTest(e);
            this._htmlElement.style.opacity = (this._isDown) ? 1 : 0.25;
        },

        /**
         * Reset the nub
         * @param {MouseEvent} e
         */
        ontouchend: function(e) {
            this._isDown = false;
            this._htmlElement.style.opacity = 0.25;

			if(this._catchOwnEvents) {
				this.removeListener( document, 'mouseup' );
				this.removeListener( document, 'touchend' );
			}

			console.log("touchup")
        },

        /**
         * Hit test against touch
         * @param {Touch} e
         * @return Boolean
         */
        hitTest: function( e ) {
            var radius = this._htmlElement.offsetWidth/2;

            // Get the offset of our element
            var offset = this.getOffset(this._htmlElement);

            // Offset it by the stage position
            var layerX = e.screenX - offset.left;
            var layerY = e.screenY - offset.top;

            // Convert to center based
            var x = Math.round(layerX - radius);
            var y = Math.round(layerY - radius);

            var dist = Math.sqrt(x*x + y*y);

            return dist < (radius+this._buffer);
        },

        ///// ACCESSORS
        getIsDown: function() {
            return this._isDown;
        }
    };

    JoystickDemo.extend( JoystickDemo.controls.ButtonController, JoystickDemo.controls.Controller )

})();