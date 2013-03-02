var vf = (function () {
	var canvas, context, mouse = [0, 0];
	var ts = null;
	var start_ts = null;

	var g = 400, //gravity constant, 9.81 ms2, but this is pixels
		magF = 400000; //magnetic force

	var falloff = function(d) {
		return Math.max(magF / d - d, 0); //local magnetic force scalar assuming cubic dropoff
	};

	function len(v) {
		return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
	}

	function dangle(x, y, r) {
		this.x = x;
		this.y = y;

		this.r = r;
		this.va = 0;

		this.a = 2 * Math.PI * Math.random();
	}

	function drawNaive(context, frame_ts, elapsed_ts) {
		this.va = 0;

		var dx = this.x - mouse[0];
		var dy = this.y - mouse[1];
		var a;

		if (dx == 0) {
			a = dy > 0 ? -0.5 * Math.PI : 0.5 * Math.PI;
		}
		else {
			a = Math.atan(dy / dx);

			if (dx > 0)
				a += Math.PI;
		}

		var d = Math.sqrt(dx * dx + dy * dy);

		if (d > 300) {
			var mix = Math.min(d - 300, 100) / 100;

			a = (0.5 * Math.PI) * mix + a * (1 - mix);
		}

		this.a = a;

		var x1 = Math.cos(a) * this.r + this.x;
		var y1 = Math.sin(a) * this.r + this.y;

		context.strokeStyle = 'rgba(0, 0, 0, 0.3)';

		context.beginPath();
		context.moveTo(this.x, this.y);
		context.lineTo(x1, y1);
		context.closePath();

		context.stroke();

		context.beginPath();
		context.arc(x1, y1, 3, 0, Math.PI * 2, true);
		context.closePath();

		context.fill();

	}

	function drawPhysics(context, frame_ts, elapsed_ts) {
		//mass = 1
		//length of displacement vector = r
		var r = [Math.cos(this.a) * this.r, Math.sin(this.a) * this.r]; //displacement vector r
		var f = [0, g]; //mass = 1 F = ma
		var mag = [mouse[0] - (this.x + r[0]), mouse[1] - (this.y + r[1])]; //displacement vector of magnetic field - taking into account displacement vector of dangle

		var d = len(mag);

		mag[0] /= d;
		mag[1] /= d; //make unit vector

		var magF_l = falloff(d);

		mag[0] *= magF_l;
		mag[1] *= magF_l;

		f = [f[0] + mag[0], f[1] + mag[1]];

		var F = len(f); // scalar Force

		var a1 = Math.atan2(r[1], r[0]);
		var a2 = Math.atan2(f[1], f[0]);
		var theta = Math.PI + a1 - a2;

		var t = Math.sin(theta) * F * this.r; //torque

		var I = this.r * this.r * 1; //m * r^2 = moment of inertia

		var aa = t / I; //angular acceleration is torque div inertia

		this.va += aa * frame_ts;

		this.a += frame_ts * this.va;

		this.va *= 0.99; //naive friction

		context.strokeStyle = 'rgba(0, 0, 0, 0.3)';

		context.beginPath();
		context.moveTo(this.x, this.y);
		context.lineTo(this.x + r[0], this.y + r[1]);
		context.closePath();

		context.stroke();

		context.beginPath();
		context.arc(this.x + r[0], this.y + r[1], 3, 0, Math.PI * 2, true);
		context.closePath();

		context.fill();

		/*
		 * debug mag force rendering
		context.strokeStyle = 'rgba(255, 0, 0, 0.1)';

		context.beginPath();
		context.moveTo(this.x + r[0], this.y + r[1]);
		context.lineTo(this.x + r[0] + mag[0], this.y + r[1] + mag[1]);
		context.closePath();

		context.stroke();
		 */
	};

	dangle.prototype.draw = drawPhysics; //default draw prototype function

	var dangles = [];

	function changeAlg(alg) {
		switch (alg) {
			case 'naive':
				dangle.prototype.draw = drawNaive;
				break;

			case 'linear':
				dangle.prototype.draw = drawPhysics;
				falloff = function(d) {
					return magF / d; //local magnetic force scalar assuming linear dropoff
				};
				break;

			case 'cubic':
				dangle.prototype.draw = drawPhysics;
				falloff = function(d) {
					d /= 3; //modifier to 'equalize' the magnitude of force a bit between linear and cubic
					return magF / (d * d); //local magnetic force scalar assuming cubic dropoff
				};
				break;

			case 'mix':
				dangle.prototype.draw = drawPhysics;
				falloff = function(d) {
					return Math.max(magF / d - d, 0);
				};
				break;
		}
	}

	function init(id) {
		canvas = document.getElementById(id);
        context = canvas.getContext('2d');

		(function() {
			var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
			window.requestAnimationFrame = requestAnimationFrame;
		})();

		document.forms[0].update.addEventListener('click', function (evt) { 
			var alg = evt.target.form.alg
			var node = null;
			for (var i = 0; i < alg.length; i++) {
				if (alg[i].checked) {
					node = alg[i];
					break;
				}
			}

			changeAlg(node.value);
		}, true);

		window.addEventListener('mousemove', function (evt) {
			mouse[0] = evt.clientX - canvas.offsetLeft;
			mouse[1] = evt.clientY - canvas.offsetTop;
		}, true);

		for (var i = 0; i < canvas.width / 40; i++)
			for (var j = 0; j < canvas.height / 40; j++)
				dangles.push(new dangle(i * 40 + 20, j * 40 + 20, 15));

		requestAnimationFrame(setupTimer);
	}

	function setupTimer(newts) {
		ts = newts;
		start_ts = newts;

		requestAnimationFrame(draw);
	}

	function draw(newts) {
		var frame_ts = (newts - ts) / 1000;
		var elapsed_ts = (newts - start_ts) / 1000;
		ts = newts;

        context.clearRect(
			0, 0,
			canvas.width, canvas.height);

		//dangles[0].draw(context, frame_ts, elapsed_ts);
		dangles.forEach(function (d) {
			d.draw(context, frame_ts, elapsed_ts);
		});

		//if (elapsed_ts < 20)
			requestAnimationFrame(draw);
	}

	return {
		'init': init,
	};
})();

vf.init('vf');
