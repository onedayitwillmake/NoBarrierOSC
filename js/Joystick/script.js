/**
 * Created by IntelliJ IDEA.
 * User: onedayitwillmake
 * Date: 5/20/11
 * Time: 9:37 PM
 * To change this template use File | Settings | File Templates.
 */
(function(){
	var onLoad = function( event ) {
		var app = new JoystickDemo.ClientApp();


//         document.getElementById("controller_container").style.width = window.innerWidth + "px";
//         document.getElementById("controller_container").style.height = window.innerHeight + "px";
		// Loop
		(function loop() {
//			app.update();
			window.requestAnimationFrame( loop, null );
		})();
	};



	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
						window.setTimeout(callback, 1000 / 60);
					};
		})();
	}
	window.addEventListener('DOMContentLoaded', onLoad, true);
}());