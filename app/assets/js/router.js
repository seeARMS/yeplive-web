(function(App){
	App = App || {};
	var Router = Backbone.Router.extend({
		routes:{
			'': 'root',
			'me': 'me',
			'_=_': 'facebookRedirect',
			'*notFound': 'notFound'
		}
	});

	App.Router = new Router;

	App.Router.on('route:root', function(actions){
		App.events.trigger('route:root');	
	});

	App.Router.on('route:notFound', function(actions){
		console.log(actions);
		App.events.trigger('route:404');
	});	

	App.Router.on('route:facebookRedirect', function(actions){
		App.Router.navigate('',true);
	});

	App.Router.on('route:me', function(actions){
		App.events.trigger('route:me');
		
	});

}(window.App));
