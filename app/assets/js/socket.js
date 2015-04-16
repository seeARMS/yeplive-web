(function(App){
	App = App || {};
	//App.socket = io.connect('ebdev.elasticbeanstalk.com:3000/');
	/*
	try{
	App.socket = io.connect('http://localhost:3001');
	} catch(e){
		console.log('socket error');
	}

	App.socket.on('server:error', function(err){
		alert("Error with socket");
		console.log(err);
	});

	App.socket.on('server:messages', function(data){
		console.log(data);
		data.messages.forEach(function(message){
			App.events.trigger('chat:message', message);
		});
	});

	App.socket.on('server:message', function(data){
		App.events.trigger('chat:message', data);
	}); 

	App.events.on('chat:send', function(data){
		App.socket.emit('client:message', data);
	});

	App.events.on('chat:join', function(data){
		data.token = App.Auth.token;
		App.socket.emit('client:join', data);
	});

	App.events.on('chat:leave', function(data){
		App.socket.emit('client:leave');
	});

	*/
}(window.App));
