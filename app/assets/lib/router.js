define(['jquery', 'underscore', 'backbone', 'lib/views/map_view', 'lib/views/navbar_view',
				'lib/views/login_view',
				'lib/views/watch_view',
				'lib/user',
				'lib/api',
				'lib/views/create_yep_view'
],
	function($, _, Backbone, MapView, NavbarView, LoginView, WatchView, User, API, CreateYepView){

	var AppRouter = Backbone.Router.extend({
		routes:{
			'': 'root',
			'me': 'me',
			'_=_': 'facebookRedirect',
			'new': 'new',
			'settings': 'settings',
			'watch/:yepId' : 'watch',
			'logout': 'logout',
			'login': 'login',
			'*notFound': 'notFound'
		}
	});

	var currentView;
	var navbarView;

	var initialize = function(){
		var appRouter = new AppRouter;

		appRouter.on('route:login', function(actions){
			if(navbarView){
				navbarView.remove();
			}
			currentView = new LoginView({el: '#main'});
		});

		appRouter.on('route:logout', function(actions){
			$.post('/api/logout').then(function(){
				window.localStorage.setItem('token','');
				appRouter.navigate("login", true);
			});
		});

		appRouter.on('route:root', function(actions){
			if(! User.authed){
				return appRouter.navigate("#login", true)
			}
			currentView = new MapView({el:'#main'});
			navbarView = new NavbarView({el:'#navbar'});
		});

		appRouter.on('route:notFound', function(actions){
			appRouter.navigate("#login", true)
			return console.log('not found');
			$.get('/api/users?name='+actions).then(function(res){
					App.events.trigger('route:user', res);
			}, function(err){
			});
		});	

		appRouter.on('route:new', function(){
			if(! User.authed){
				return appRouter.navigate("#login", true)
			}
			if(! navbarView){
				navbarVIew = new NavbarView({el: '#navbar'});	
			}
			currentView = new CreateYepView({el:'#main'});
			
		});

		appRouter.on('route:facebookRedirect', function(actions){
			appRouter.navigate("", true)
		});

		appRouter.on('route:me', function(actions){
			appRouter.navigate("#login", true)
			
		});

		appRouter.on('route:settings', function(actions){
		});

		appRouter.on('route:watch', function(yepId){
			currentView = new WatchView({ el: '#main', yepId: yepId});
			//navbarVIew = new NavbarView({el: '#navbar'});
		});
	};

	return {
		initialize: initialize
	};

});
