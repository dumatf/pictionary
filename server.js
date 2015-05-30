var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var WORDS = require('./words');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
var word, drawer, clients = [];

var getRandomWord = function() {
	return word = WORDS[Math.floor(Math.random() * WORDS.length)];
}

io.on('connection', function(socket) {
	if (clients.length === 0) {
		socket.emit('set user', getRandomWord());
		socket.emit('wait', 'Waiting for guessers...');
		drawer = socket;
	} else if (clients.length === 1) {
		// start the game
		io.emit('reset');
		io.emit('guess', 'Starting new game!');
		socket.emit('set user');
	} else {
		socket.emit('set user');
	}
	clients.push(socket);

	socket.on('draw', function(position) {
		socket.broadcast.emit('draw', position);
	});

	socket.on('guess', function(guess) {
		if (guess.toUpperCase() === word.toUpperCase()) {
			socket.emit('guess', 'Correct!');
			socket.emit('set user', getRandomWord());
			drawer.emit('set user');
			io.emit('reset');
			drawer = this;
		} else {
			socket.emit('guess', 'Wrong!');
			socket.broadcast.emit('guess', guess);	
		}
	});

	socket.on('disconnect', function() {
		var index = clients.indexOf(socket);
		if (index != -1 ) {
			clients.splice(index, 1);
			console.log('removed client', clients.length);
		}

		// Randomly select new drawer
		if (socket === drawer) {
			drawer = clients[Math.floor(Math.random() * clients.length)];
			drawer.emit('set user', getRandomWord());
			io.emit('guess', 'Drawer left! Starting new game..');
			io.emit('reset');
		}

		if (clients.length === 1) {
			io.emit('wait', 'Waiting for guessers...');
		}
	});
});

server.listen(8080);

// hide full ui panel until we know the client is the drawer
// then render the drawer elements and the pictionary board