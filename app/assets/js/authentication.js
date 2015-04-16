(function(App){
	App = App || {};
	App.Auth = {};

	$.get('/auth').then(function(response){
		if(response.error){
			App.Auth.authed = false;
		} else {
			App.Auth.authed = true;
			App.Auth.token = response.token;
		}
		App.events.trigger('loaded');
	}, function(err){
		alert(err);
	});

}(window.App));
