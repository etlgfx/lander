define(function (require, exports, module) {
	"use strict";

	var config = {
		gravity: 9.81,
		unitModifier: 1000,
	};

	function len(v) {
		return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
	}

	function ePhysObj(config) {
		this.m = config.m ? config.m : 1;
		this.pos = {x: 0, y: 0};
		this.pos.x = config.x ? config.x : 0;
		this.pos.y = config.y ? config.y : 0;
		this.w = 0; //omega, rotational velocity
		this.a = 0; //current rotation angle alpha
		this.vel = {x: 0, y: 0};

		this.thrust = config.thrust ? config.thrust : 0;

		this.control = {
			thrust: false
		};
	}

	ePhysObj.prototype.applyThrust = function (onoff) {
		this.control.thrust = onoff;
	};

	function ePhysGroup() {
		this.children = [];

		this.m = 0;
		this.pos = {x: 0, y: 0};
		this.vel = {x: 0, y: 0};
		this.w = 0; //omega, rotational velocity
		this.a = 0; //current rotation angle alpha
		this.cg = {x: 0, y: 0};
	}

	ePhysGroup.prototype.appendChild = function (obj) {
		this.children.push(obj);
		obj.parentObj = this;
		this.m += obj.m;
		this.updateCG();
	};

	ePhysGroup.prototype.updateCG = function () {
		var x = 0, y = 0;

		this.children.forEach(function (c) {
			x += c.m * c.pos.x;
			y += c.m * c.pos.y;
		});

		this.cg = {
			x: x / this.m,
			y: y / this.m
		};
	};

	ePhysGroup.prototype.physics = function () {
		var ts = 1/60;

		this.a += this.w * ts;
		this.pos = {
			x: this.pos.x + this.vel.x * ts,
			y: this.pos.y + this.vel.y * ts,
		};

		var vy = this.vel.y;

		this.children.forEach(function (c) {
			if (c.control.thrust) {
				var rv = [c.pos.x - this.cg.x, c.pos.y - this.cg.y]; //displacement vector r
				var r = len(rv);

				var f = [0, c.thrust];

				var a1 = Math.atan2(rv[1], rv[0]);
				var a2 = Math.atan2(f[1], f[0]);
				var theta = Math.PI + a1 - a2;

				var t = Math.sin(theta) * c.thrust * r; //torque

				var I = r * r * this.m; //m * r^2 = moment of inertia

				var aa = t / I; //angular acceleration is torque div inertia

				//var td = Math.sin(theta) * c.thrust; //rotational force debug
				var fa = Math.cos(theta) * c.thrust; //resulting non-rotational force
				var fv = [-Math.cos(this.a + a1) * fa, -Math.sin(this.a + a1) * fa]; //force vectors, rotated

				/*
				console.log(
						'rv', rv,
						'r', r,
						'f', f,
						'a1', a1,
						'a2', a2,
						'theta', theta,
						'cos', Math.cos(theta),
						'sin', Math.sin(theta),
						'tau', t,
						'I', I,
						'aa', aa,
						'fv', fv
						);
				*/
				this.w += aa * ts;

				this.vel.x += fv[0] * ts / this.m;
				this.vel.y += fv[1] * ts / this.m;

				c.phys = {
					rv: rv,
					r: r,
					f: f,
					a1: a1,
					a2: a2,
					theta: theta,
					cos: Math.cos(theta),
					sin: Math.sin(theta),
					tau: t,
					I: I,
					aa: aa,
					fv: fv
				};

				//console.log(this.vel, this.w);
				//vy += c.thrust * ts;
			}
		}, this);

		this.vel.y += config.gravity * ts;
	};

	return {
		init: function (c) {
			for (i in c)
				if (config[i] !== undefined)
					config[i] = c[i];
		},
		ePhysObj: ePhysObj,
		ePhysGroup: ePhysGroup,
	};
});
