var pictionary = function() {
	var canvas, context, drawing = 0, guessBox;
	var socket = io();

	// Draw black circle with 6px radius
	var draw = function(position) {
		context.beginPath();
		context.arc(position.x, position.y, 6, 0, 2 * Math.PI);
		context.fill();
	};

	// Create click and drag drawing canvas
	canvas = $('canvas');
	context = canvas[0].getContext('2d');
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
	canvas.on('mousedown', function(event) { drawing = 1; });
	canvas.on('mouseup', function(event) { drawing = 0; });

	var clearCanvas = function() {
		context.clearRect (0, 0, canvas[0].width, canvas[0].height);
	};

	// Submit a guess 
	var onKeyDown = function(event) {
		if (event.keyCode != 13) { // Enter
			return;
		}

		socket.emit('guess', guessBox.val());
		guessBox.val('');
	};

	guessBox = $('#guess input');
	guessBox.on('keydown', onKeyDown);

	// Display guess to other clients
	var addGuess = function(guess) {
		$('#guesses').text(guess).show();
		setTimeout(function() {
			$('#guesses').fadeOut();
		}, 2000);
	};

	// Set client as drawer or guesser
	var setUser = function(word) {
		if (word) {
			$('#guess').hide();
			$('#word').show();
			$('#word b').text(word);	
		} else {
			$('#word').hide();
			$('#guess').show();
		}
	};

	// Display waiting message to drawer
	var waitingForPlayers = function(message) {
		$('#guesses').text(message).show();
	}

	// Receive events from server
	socket.on('draw', draw);
	socket.on('guess', addGuess);
	socket.on('set user', setUser);
	socket.on('reset', clearCanvas);
	socket.on('wait', waitingForPlayers);
};

$(document).ready(function() {
	pictionary();
});