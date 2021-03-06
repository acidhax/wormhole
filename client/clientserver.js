var MatBee = {

};
MatBee.WormholeServer = function (socket) {
	var self = this;
	var connected = false;
	var executeQueue = [];
	var _tables = [];
	this.executeQueue = executeQueue;
	this.Execute = function (method, parameters, callback) {
		if (connected) {
			var callbackId = __randomString();
			window.socket.on(callbackId, function (parameters) {
				if (parameters.duplicate === true) {
					self.Execute(method, parameters, callback);
				}
				else {
					callback.apply(null, parameters);
				}
			});
			window.socket.emit('WormholeServer.Methods', {callbackId:callbackId, method: method, parameters: parameters});
		}
		else {
			executeQueue.push({callback:callback, method: method, parameters: parameters});
		}
	};
	
	__randomString = function() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 64;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	};

	if (!socket) {
		if (window.socket) {
			connected = true;
		}
		else {
			window.socket = io.connect();
			window.socket.on('connect', function () {
				connected = true;
				for (var k in executeQueue) {
					self.Execute(executeQueue[k].method, executeQueue[k].parameters, executeQueue[k].callback);
					delete executeQueue[k];
				};
			});
		}
	}
	else  {
		connected = true;
		window.socket = socket;
	}

	window.socket.on('javascript', function (data) {
		if (!$.isArray(data.arguments))
		data.arguments = [data.arguments];
		executeJavascript(data);
	});

	window.socket.on('get', function (data) {
		var result = executeJavascript(data);
		if (!$.isArray(result)) {
			result = [result];
		}
		window.socket.emit(data.callbackId, result);
	});

	window.socket.on('hook', function (args) {
		var event = args.event;
		var callbackId = args.callbackId;
		var selector = args.selector;
		$('body').on(event, selector, function (ev) {
			window.socket.emit(callbackId, event);
		})
	});

	var executeJavascript = function (data) {
		var f = eval("("+data.func+")");
		return f.apply(null, data.arguments);
	}

	return this;
};

var Table = Backbone.Model.extend({
	defaults: {
		name: 'noname'
	},
	initialize: function () {
		//Initializing code.
	}
});

var TableList = Backbone.Collection.extend({

});

var TableEntry = Backbone.Model.extend({

});