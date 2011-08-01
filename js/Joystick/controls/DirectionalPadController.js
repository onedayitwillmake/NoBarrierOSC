(function(){
    JoystickDemo.namespace("JoystickDemo.controls");
    JoystickDemo.controls.DirectionalPadController = function(){
//        JoystickDemo.controlls.Controller.superclass.constructor.call(this);
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
        _htmlElement: null,


        setup: function( ) {
            var prefix = "dpad";
            this._htmlElement = document.getElementById(prefix);
            
            for(var i = 0; i < this._htmlElement.children.length; i++) {
                var dpadElement = this._htmlElement.children[i];
                var type = this._htmlElement.children[i].id.substr(prefix.length);
                this._buttons[type] = new JoystickDemo.controls.ButtonController( dpadElement )
            }
        },

        /**
         * Retuns the status of the up button
         */
        getUp: function() {
            return this._buttons['up'].getIsDown();
        },

        /**
         * Retuns the status of the down button
         */
        getDown: function() {
            return this._buttons['down'].getIsDown();
        },

        /**
         * Retuns the status of the left button
         */
        getLeft: function() {
            return this._buttons['left'].getIsDown();
        },

        /**
         * Retuns the status of the right button
         */
        getRight: function() {
            return this._buttons['right'].getIsDown();
        }
    }

})();