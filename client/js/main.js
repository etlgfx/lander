require.config({
	baseUrl: 'js/modules',
	paths: {
		klass: '../libs/klass.min',
		ejs: '../libs/ejs',
	}
});

require(['ephys', 'egame'], function (ePhys, eGame) {
	eGame.init({
		mode: '2d',
		canvasId: 'game',
	})

	var g = new ePhys.ePhysGroup();
	var mainModule = new ePhys.ePhysObj({x: 0, y: 10, m: 30});
	var thruster1 = new ePhys.ePhysObj({x: -20, y: -5, m: 10, thrust: 1000});
	var thruster2 = new ePhys.ePhysObj({x: 20, y: -5, m: 10, thrust: 1000});
	var thruster3 = new ePhys.ePhysObj({x: 0, y: -10, m: 20, thrust: 6000});

	g.appendChild(mainModule);
	g.appendChild(thruster1);
	g.appendChild(thruster2);
	g.appendChild(thruster3);

	g.pos.x = 500;
	g.pos.y = 500;
	g.a = Math.PI;

	eGame.draw(g);

	(function() {
		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.requestAnimationFrame = requestAnimationFrame;
	})();

	var looping = true;

	window.addEventListener('keydown', function (evt) {
		switch (evt.which) {
			//case 38:
			case 37:
				//looping = false;
				evt.preventDefault();
				thruster1.applyThrust(true);
				break;

			case 39:
				evt.preventDefault();
				thruster2.applyThrust(true);
				break;

			case 40:
				evt.preventDefault();
				thruster3.applyThrust(true);
				break;
		}
	}, true);

	window.addEventListener('keyup', function (evt) {
		switch (evt.which) {
			//case 38:
			case 37:
				evt.preventDefault();
				thruster1.applyThrust(false);
				break;

			case 39:
				evt.preventDefault();
				thruster2.applyThrust(false);
				break;

			case 40:
				evt.preventDefault();
				thruster3.applyThrust(false);
				break;
		}
	}, true);

	function loop () {
		eGame.draw(g);
		g.physics();
		//console.log(g);

		//if (i++ < 10)
		if (looping)
			requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
});
