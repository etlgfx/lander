var io = require('socket.io').listen(8046);

var game = (function () {
	var players = [];

	function Player() {
		this.x = Math.random() * 640;
		this.y = Math.random() * 200;
		this.vx = 0;
		this.vy = 0;
		this.throttle = 0;
		this.alive = true;
	}

	function loop() {
		players.forEach(function (p) {
			p.vy += (p.throttle ? -1 : 1);
			p.y += p.vy * 0.010;
		});

		setTimeout(loop, 10);
	}

	function getState() {
		return players;
	}

	function control(player, throttle) {
		console.log(players[player]);
		players[player].throttle = throttle;
	}

	return {
		'addPlayer': function () {
			return players.push(new Player()) - 1;
		},
		'init': function () {
			setTimeout(loop, 0);
		},
		'control': control,
		'getState': getState,
	};
})();

game.init();

io.sockets.on('connection', function (socket) {
	var player = game.addPlayer();

	socket.on('message', function (msg) {
		console.log(msg);
		msg = JSON.parse(msg);
		game.control(player, msg.throttle ? true : false);
	});

	socket.on('disconnect', function () { });
});

setInterval(function () {
	io.sockets.emit('state', JSON.stringify(game.getState()));
}, 50);

io.set('transports', ['websocket']);
