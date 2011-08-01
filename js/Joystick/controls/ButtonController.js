(function(){
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.ButtonController = function( anHTMLElement ){
        JoystickDemo.controls.ButtonController.superclass.constructor.call(this);
        
        this._htmlElement = anHTMLElement;
        this.setup();
    };

    JoystickDemo.controls.ButtonController.prototype = {
        /**
         * @type {Boolean}
         */
        _isDown: false,

        /**
         * @type {HTMLElement}
         */
        _htmlElement: null,

        /**
         * Setup event listeners and etc
         */
        setup: function( ) {
                      var that = this;
            this.addListener( document, 'mousemove', function(e){ that.onMouseMove(e);} );
            this.addListener( document, "touchmove", that.touchHandler);

//            this.addListener( this._htmlElement, 'mousedown', function(e){ that.onMouseDown(e);});
//            this.addListener( this._htmlElement, 'touchstart', that.touchHandler );
        },

        /**
         * Mousedown callback
         * @param {MouseEvent} e
         */
        onMouseDown: function(e) {
            this._isDown = true;

            // remove event listeners
            this.removeListener( document, 'mouseup' );
            this.removeListener( document, 'mousemove' );
            this.removeListener(document, "touchmove");
			this.removeListener(document, "touchend");

            // add event listeners
            var that = this;
            this.addListener( document, 'mousemove', function(e){ that.onMouseMove(e);} );
            this.addListener( document, 'mouseup', function(e){ that.onMouseUp(e);} );
            this.addListener( document, "touchmove", that.touchHandler);
			this.addListener( document, "touchend", that.touchHandler);

            this._htmlElement.style.opacity = 1;

        },

        /**
         * Set angle based on nub location
         * @param {MouseEvent} e
         */
        onMouseMove: function(e) {

            var radius = this._htmlElement.offsetWidth/2 + 1;

            // Get the offset of our element
            var offset = this.getOffset(this._htmlElement);

            // Offset it by the stage position
            var layerX = e.clientX - offset.left;
            var layerY = e.clientY - offset.top;

            // Convert to center based
            var x = Math.round(layerX - radius);
            var y = Math.round(layerY - radius);

            var dist = Math.sqrt(x*x + y*y);
            this._isDown = dist < radius;

            this._htmlElement.style.opacity = (this._isDown) ? 1 : 0.25;
        },


        /**
         * Reset the nub
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._isDown = false;

            this.removeListener( document, 'mouseup' );
            this.removeListener( document, 'mousemove' );
            this.removeListener( document, "touchmove");
			this.removeListener( document, "touchend");

            this._htmlElement.style.opacity = 0.25;
        },

        ///// ACCESSORS
        getIsDown: function() {
            return this._isDown;
        }
    }

    JoystickDemo.extend( JoystickDemo.controls.ButtonController, JoystickDemo.controls.Controller )

})();