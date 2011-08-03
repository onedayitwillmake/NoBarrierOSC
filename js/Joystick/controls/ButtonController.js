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

        this._touchAreaHtmlElement = this._htmlElement = anHTMLElement;
		this._catchOwnEvents = shouldCatchOwnEvents;
        this.setup();
        this.id == 1;
    };

    JoystickDemo.controls.ButtonController.prototype = {
        /**
         * @type {Boolean}
         */
        _isDown         : false,
        id:1,

        /**
         * @type {HTMLElement}
         */
        _htmlElement    : null,

        /**
         * @type {HTMLElement}
         */
        _touchAreaHtmlElement    : null,

        /**
         * Setup event listeners and etc
         */
        setup: function( ) {
			if(!this._catchOwnEvents) return;

			var that = this;
            //this.addListener( this._touchAreaHtmlElement, 'mousedown', function(e){ that.onMouseDown(e);} );
            this.addListener( this._touchAreaHtmlElement, 'touchstart', function(e){ that.ontouchstart(e);} );
        },

		onMouseDown: function(e) {
			this.ontouchstart(e);


            if(this._)

			var that = this;
			this.addListener( document, 'mouseup', function(e){ that.ontouchend(e);} );
		},

        /**
         * Mousedown callback
         * @param {MouseEvent} e
         */
        ontouchstart: function(e) {

            // If catchOwnEvents - verfiy that the touch was over over us - and store the identifier
			if(this._catchOwnEvents) {

                var validTouches  = this.getValidTouches(e.touches);
                if( validTouches[0] ) this._touchIdentifier = validTouches[0].identifier;
                else {
                    console.log("ThumbstickController::onTouchStart - No valid touches found!");
                    return;
                }

                var that = this;
                this.ontouchmove(validTouches[0]);
				this.addListener( document, 'touchend', function(e){ that.ontouchend(e);} );
			}

            this._isDown = true;
            this._htmlElement.style.opacity = (this._isDown) ? 1 : 0.25;
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

            // If catching own events - verify that this touch was ours
            if( this._catchOwnEvents && !this.getTouchOfInterest(e.changedTouches)) {
                console.log("ButtonController::ontouchend - Touch ignored" + String(this.getTouchOfInterest(e.changedTouches)));
                return;
            }
            
            this._isDown = false;
            this._htmlElement.style.opacity = 0.25;

			if(this._catchOwnEvents) {
				this.removeListener( document, 'mouseup' );
				this.removeListener( document, 'touchend' );
			}

			//console.log("touchup")
        },

        ///// ACCESSORS
        getIsDown: function() {
            return this._isDown;
        }
    };

    JoystickDemo.extend( JoystickDemo.controls.ButtonController, JoystickDemo.controls.Controller )

})();