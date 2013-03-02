define(function (require, exports, module) {
	var ejs = require('ejs');

	var canvas = null,
	    context = null;

	function line(o, t, style) {
		if (style)
			context.strokeStyle = style;

		context.beginPath();
		context.moveTo(o[0], o[1]);
		context.lineTo(t[0], t[1]);
		context.closePath();
		context.stroke();
	}

	return {
		init: function(config) {
			canvas = document.getElementById(config.canvasId);
			context = canvas.getContext(config.mode);
		},

		draw: function (obj) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			//console.log(obj);

			context.fillStyle = 'rgba(255, 0, 0, 0.2)';
			context.fillRect(0, 0, 300, 300);

			context.fillStyle = 'rgba(0, 255, 0, 0.2)';
			context.fillRect(300, 0, 300, 300);

			context.fillStyle = 'rgba(0, 0, 255, 0.2)';
			context.fillRect(0, 300, 300, 300);

			context.save();

			context.translate(obj.pos.x, obj.pos.y);
			context.translate(obj.cg.x, obj.cg.y);
			context.rotate(obj.a);
			context.translate(-obj.cg.x, -obj.cg.y);

			context.fillStyle = 'rgba(0, 0, 0, 0.2)';
			context.fillRect(-obj.m / 2, -obj.m / 2, obj.m, obj.m);

			context.fillStyle = 'rgba(0, 0, 0, 0.5)';
			if (obj.children)
				obj.children.forEach(function (c) {

					if (c.control.thrust)
						context.fillStyle = 'rgba(0, 255, 0, 1)';
					else
						context.fillStyle = 'rgba(0, 0, 0, 0.5)';

					context.fillRect(c.pos.x - c.m / 2, c.pos.y - c.m / 2, c.m, c.m);

					if (c.phys) {
						line([c.pos.x, c.pos.y], [c.pos.x - c.phys.rv[0], c.pos.y - c.phys.rv[1]], 'rgba(0, 0, 255, 0.5)');
						line([c.pos.x, c.pos.y], [c.pos.x - c.phys.fv[0] / 10, c.pos.y - c.phys.fv[1] / 10], 'rgba(0, 255, 0, 0.5)');
						line([c.pos.x, c.pos.y], [c.pos.x - Math.sin(c.phys.a1) * c.phys.tau / 100, c.pos.y + Math.cos(c.phys.a1) * c.phys.tau / 100], 'rgba(255, 0, 0, 0.5)');
						//line([c.pos.x, c.pos.y], [c.pos.x - c.phys.rv[0], c.pos.y - c.phys.rv[1]], 'rgba(0, 0, 255, 0.5)');
						//line([c.pos.x, c.pos.y], [c.pos.x - c.phys.rv[0], c.pos.y - c.phys.rv[1]], 'rgba(0, 0, 255, 0.5)');
						//line([c.pos.x, c.pos.y], [c.pos.x - c.phys.rv[0], c.pos.y - c.phys.rv[1]], 'rgba(0, 0, 255, 0.5)');
					}
				});

			context.fillStyle = 'rgba(0, 255, 0, 1)';
			context.fillRect(obj.cg.x - 1, obj.cg.y - 1, 2, 2);

			context.restore();
		}
	};
});
