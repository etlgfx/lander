var ejs = (function() {

	"use strict";

	function debugAll() {
		var ret = [];

		for (var i = 0; i < arguments.length; i++)
			ret[i] = debug(arguments[i]);

		return ret.join(', ');
	}

	function debug(obj) {
		console.log(obj.toSource());
		var str = '';

		if (obj === null) {
			str = 'null';
		}
		else {
			switch (typeof(obj)) {
				case 'undefined':
					str = 'undefined';
					break;

				case 'boolean':
					str = obj ? 'true' : 'false';
					break;

				case 'number':
				case 'string':
					str = obj;
					break;

				case 'function':
					str = 'function()';
					break;

				default:
					if (obj instanceof Array) {
						str = obj.toSource();
					}
					else {
						for (var a in obj) {
							try {
								if (obj[a] instanceof Function) {
									str += a +'()\n';
								}
								else {
									str += a +': '+ obj[a] +'\n';
								}
							}
							catch (e) {
								str += a +': unknown\n';
							}
						}
					}
			}
		}

		return str;
	}

	function xhr() {
		var args = Array.prototype.slice.call(arguments);

		if (!args.length)
			throw "Invalid Request";

		/*
		if (args[0] instanceof Element) {
			var node = args.shift();

			node.addEventListener('click', function
		}
		*/

		var method = args.shift();

		if (method.toUpperCase)
			method = method.toUpperCase();
		else
			throw "method must be a string";

		switch (method) {
			case 'GET': case 'PUT': case 'POST': case 'DELETE': case 'PATCH': case 'TRACE': case 'HEAD':
				this.method = method;
				break;

			default:
				throw "Invalid Request Method";
		}

		this.xhr = new XMLHttpRequest();
	};

	xhr.prototype.load = function(id) {
		this.id = id;

		return this;
	};

	xhr.prototype.callback = function(cb) {
		if (!cb instanceof Function) {
			throw "Not a Function";
		}

		this.cb = cb;

		return this;
	};

	xhr.prototype.send = function(uri, data) {
		var xhr = this.xhr;

		xhr.open(this.method, uri);

		if (this.params) {
			for (var header in this.params) {
				xhr.setRequestHeader(a, this.params[header]);
			}
		}
		else {
			if (data) {
				data = JSON.stringify(data);

				xhr.setRequestHeader('Content-type', 'application/json');
				//xhr.setRequestHeader('Content-length', data.length); //This is now considered a dangerous header, so ignore
			}
			else {
				//xhr.setRequestHeader('Content-length', 0);
			}

			xhr.setRequestHeader('Connection', 'close');
		}

		var self = this;

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				switch (xhr.status) {
					case 200:
						if (xhr.getResponseHeader('content-type') == 'application/json' && self.cb) {
							self.cb(xhr, JSON.parse(xhr.responseText));
						}
						else {
							if (self.cb) {
								self.cb(xhr);
							}
							else if (self.id) {
								document.getElementById(self.id).innerHTML = xhr.responseText;
							}
						}
						break;

					default:
						if (self.error_cb)
							this.error_cb(xhr);
						break;
				}
			}
		}

		xhr.send(this.data);

		return this;
	};

	xhr.prototype.error = function(cb) {
		if (cb instanceof Function)
			this.error_cb = cb;
	};

	var form = {
		serialize:
			function(id) {
				var form = document.getElementById(id);
				var formdata = {};

				for (var i = 0; i < form.elements.length; i++) {
					var cur = form.elements[i];
					if (!cur.name) {
						continue;
					}

					if (cur.nodeName.toLowerCase() == 'select' && cur.multiple) {
						formdata[cur.name] = [];

						for (var j = 0; j < cur.options.length; j++) {
							if (cur.options[j].selected) {
								formdata[cur.name].push(cur.options[j].value);
							}
						}
					}
					else if (cur.type.toLowerCase() == 'checkbox') {
						if (cur.checked) {
							if (formdata[cur.name]) {
								formdata[cur.name].push(cur.value);
							}
							else {
								formdata[cur.name] = [cur.value];
							}
						}
						else if (!formdata[cur.name]) {
							formdata[cur.name] = [];
						}
					}
					else {
						formdata[cur.name] = cur.value;
					}
				}

				return formdata;
			}
	};

	return {
		'form': { serialize: form.serialize },
		'debug': debugAll,
		'xhr': function (method, params) { return new xhr(method, params); }
	};
})();

