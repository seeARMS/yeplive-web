(function(App){
	App = App || {};
	var Router = Backbone.Router.extend({
		routes:{
			'': 'root',
			'me': 'me',
			'_=_': 'facebookRedirect',
			'new': 'new',
			'settings': 'settings',
			'watch/:yepId' : 'watch',
			'*notFound': 'notFound'
			
		}
	});

	App.Router = new Router;

	App.Router.on('route:root', function(actions){
		App.events.trigger('route:root');	
	});

	App.Router.on('route:notFound', function(actions){
		$.get('/api/users?name='+actions).then(function(res){
				App.events.trigger('route:user', res);
		}, function(err){
				App.events.trigger('route:404');
		});
	});	

	App.Router.on('route:new', function(){
		App.events.trigger('route:new');
	});

	App.Router.on('route:facebookRedirect', function(actions){
		App.Router.navigate('',true);
	});

	App.Router.on('route:me', function(actions){
		App.events.trigger('route:me');
		
	});

	App.Router.on('route:settings', function(actions){
		App.events.trigger('route:settings');	
	});

	App.Router.on('route:watch', function(yepId){
		App.events.trigger('route:watch', yepId);
	});

}(window.App));
