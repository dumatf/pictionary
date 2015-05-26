var pictionary = function() {
	var canvas, context, drawing = 0;
	var socket = io();

//draw solid black circle with 6px radius
	var draw = function(position) {
		context.beginPath();
		context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
		context.fill();
	};

	canvas = $('canvas');
	context = canvas[0].getContext('2d'); //create drawing context for canvas
	canvas[0].width = canvas[0].offsetWidth;
	canvas[0].height = canvas[0].offsetHeight;
	canvas.on('mousemove', function(event) {
		if (drawing) {
			var offset = canvas.offset();
			var position = {x: event.pageX - offset.left,
											y: event.pageY - offset.top};
			draw(position);
			socket.emit('draw', position);
		}
	});

	canvas.on('mousedown', function(event) {
		drawing = 1;
	});

	canvas.on('mouseup', function(event) {
		drawing = 0;
	});

	socket.on('draw', draw);
};

$(document).ready(function() {
	//should the socket functionality be inside this block?
	pictionary();
});