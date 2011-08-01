(function(){
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.ThumbStickController = function(){
        JoystickDemo.controls.ThumbStickController.superclass.constructor.call(this);
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
        _htmlElement: null,

        _closures   : {},

        setup: function( ) {
            this._htmlElement = document.getElementById("thumb_stick_mouse");
            this._radius = this._htmlElement.offsetWidth/2;
            this._nub = document.getElementById("thumb_stick_nub");
            this._nubRadius = this._nub.offsetWidth/2;

            this.onMouseUp(null); // reset the mouse

            var that = this;


            this.addListener( this._htmlElement, 'mousedown', function(e){ that.onMouseDown(e);} );
            this.addListener( this._htmlElement, 'touchstart', that.touchHandler );
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

            // Get the offset of our element
            var offset = this.getOffset(this._htmlElement);
            // Offset it by the stage position
            var layerX = e.clientX - offset.left;
            var layerY = e.clientY - offset.top;
            // Offset it by our radius
            var x = layerX - this._radius;
            var y = layerY - this._radius;
            this._angle = Math.atan2(y, x);

            var top = (Math.sin(this._angle)*this._radius/2) + this._radius - this._nub.offsetWidth/2;
            var left = (Math.cos(this._angle)*this._radius/2) + this._radius - this._nub.offsetWidth/2;
            this._nub.style.top = Math.round(top) + "px"
            this._nub.style.left = Math.round(left) + "px"
        },

        /**
         * Reset the nub
         * @param {MouseEvent} e
         */
        onMouseUp: function(e) {
            this._mouseIsDown = false;

            // Remove listeners
            var that = this;
            this.removeListener(document, 'mousemove');
            this.removeListener(document, 'mouseup');
            this.removeListener(document, "touchmove");
            this.removeListener(document, "touchend");
            
            // Recenter nub
            this._nub.style.top = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
            this._nub.style.left = Math.round(this._radius - this._nub.offsetWidth/2) + "px"
        }
    };

    JoystickDemo.extend( JoystickDemo.controls.ThumbStickController, JoystickDemo.controls.Controller );
})();