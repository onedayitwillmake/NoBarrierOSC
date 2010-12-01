NoBarrierOSC
============
#### Everyone interact!

`NoBarrierOSC` is a Node.js / Websocket server (using a a set of projects mangled together) that allows all users on arbitrary webpage send OSC messages to any listening application, and each other via any modern browser including iOS/iPhone.

##Usage 
###(Browser)
`
var self = this;

			var HOST = "10.29.145.48"; // Where node.js is running
			var PORT = 28785;
			var netChannelDelegate = new NetChannelDelegate(HOST, PORT);

			$(document).mousemove(function(event)
			{
				//1 is a 'CMD'
				netChannelDelegate.send(CMDS.MOVE, {x:event.pageX/self.bounds.right, y: event.pageY/self.bounds.bottom});
				event.preventDefault();
			});
`
### Credits

Mario Gonzalez &lt;mariogonzalez@gmail.com&gt;

### License
Whatever license any of the technologies used is carried over.
This project itself is released under Creative Commons Attribution 2.0 license       
