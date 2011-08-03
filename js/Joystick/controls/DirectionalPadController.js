/**
File:
	DirectionalPadController.js
Created By:
	Mario Gonzalez
Project	:
	ChuClone
Abstract:
 	Captures touch events and passes them to the four ButtonController instances representing Up, Down, Left, Right
 Basic Usage:
    Create a DOMTree such that:
        // 1 Div container, 4 button containers, and 1 toucharea that (which should encompass all 4 button elements)
        <div id="dpad">
            <div id="dpad_up" class="dpad_button"></div>
            <div id="dpad_down" class="dpad_button"></div>
            <div id="dpad_left" class="dpad_button"></div>
            <div id="dpad_right" class="dpad_button"></div>
            <div id="dpad_touch_area"></div>
        </div>

    Initiate it in javascript:
        this._dpad = new JoystickDemo.controls.DirectionalPadController();
 
 License:
    Creative Commons Attribution-NonCommercial-ShareAlike
    http://creativecommons.org/licenses/by-nc-sa/3.0/
 */
(function(){
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.DirectionalPadController = function(){
        JoystickDemo.controls.DirectionalPadController.superclass.constructor.call(this);
        this.setup();
    };

    JoystickDemo.controls.DirectionalPadController.prototype = {

        /**
         * Object containing 4 'ButtonControllers' one per direction
         * @type {Object}
         */
        _buttons    : {},

        /**
         * @type {HTMLElement}
         */
        _touchAreaHtmlElement: null,

        /**
         * @type {HTMLElement}
         */
        _touchAreaHtmlElement   : null,
        
        _touchIdentifier: -1,


        setup: function( ) {
            var prefix = "dpad";
            this._htmlElement = document.getElementById(prefix);
            this._touchAreaHtmlElement = document.getElementById(prefix + "_touch_area");

            // Create 4 buttons
            for(var i = 0; i < this._htmlElement.children.length; i++) {
                var dpadElement = this._htmlElement.children[i];
                if(dpadElement == this._touchAreaHtmlElement) continue; // Don't add touch area as one of the controls

                var type = this._htmlElement.children[i].id.substr(prefix.length+1);
                this._buttons[type] = new JoystickDemo.controls.ButtonController( dpadElement, false )
            }


            // Listen for mouse events
            var that = this;
            this.addListener( this._touchAreaHtmlElement, "touchstart", function(e){ that.onTouchStart(e);} );
        },

        /**
         * Called on 'touchstart' - Grabs the first touch, stores the identifier and starts listening for 'touchmove', 'touchend'
         * @param {TouchEvent} e
         */
        onTouchStart: function(e) {
            this._touchIdentifier = e.touches[0].identifier;

            // Inform all buttons
            this.relayTouchToButtons( e.touches[0], e.type );

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

            // Inform all buttons
            this.relayTouchToButtons( touchOfInterest, e.type );
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

            // Inform all buttons
            this.relayTouchToButtons( touchOfInterest, e.type );

            // Clean up event listeners
            this.removeListener( document, "touchmove" );
            this.removeListener( document, "touchend" );
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
         * Retuns the status of the up button
         */
        getUp: function() { return this._buttons['up'].getIsDown(); },

        /**
         * Retuns the status of the down button
         */
        getDown: function() { return this._buttons['down'].getIsDown(); },

        /**
         * Retuns the status of the left button
         */
        getLeft: function() { return this._buttons['left'].getIsDown(); },

        /**
         * Retuns the status of the right button
         */
        getRight: function() { return this._buttons['right'].getIsDown(); },

        /**
         * Returns the state of all 4 directional buttons
         * @example
         *  {up: true, down: false, left: true, right: false}
         *  
         * @return {Object}
         */
        getAll: function() {
            return { up: this.getUp(), down: this.getDown(), left: this.getLeft(), right: this.getRight() };
        }
    }

    JoystickDemo.extend( JoystickDemo.controls.DirectionalPadController, JoystickDemo.controls.Controller )
})();