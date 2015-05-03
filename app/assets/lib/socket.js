define(['jquery', 'underscore', 'backbone', 
				'socketio'
],
	function($, _, Backbone, io){
	
	var url = 'http://52.11.161.208:80';

	var instance = null;

	function Socket(data){
		this.initialize(data);
	}

	Socket.prototype.initialize = function(data){
		this.socket = io.connect(url);
	}

	Socket.prototype.on = function(event, cb){
		this.socket.on(event, cb);
	}

	Socket.prototype.emit = function(event, data){
		this.socket.emit(event, data);
	}

	Socket.getInstance = function(data){
		if(instance === null){
			instance = new Socket(data);
		}
		return instance;
	}

	console.log(Socket.getInstance());

	return Socket.getInstance();

});