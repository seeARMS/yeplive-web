(function(App){
	App = App || {};
	App.Auth = {};

	$.get('/api/auth').then(function(response){
		if(response.error){
			App.Auth.authed = false;
				App.events.trigger('loaded');
		} else {
			App.Auth.authed = true;
			App.Auth.token = response.token;
			$.ajax(
				{
					url:"/api/me",
					type: "GET",
					beforeSend: function(xhr){
						xhr.setRequestHeader('Authorization', 'Bearer '+App.Auth.token);
					}
				}).then(function(response){
				App.User = new App.Models.User(response);
				App.events.trigger('loaded');
			});
		}
	}, function(err){
		alert(err);
	});

}(window.App));
