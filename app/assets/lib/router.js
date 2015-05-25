define(['jquery', 'underscore', 'backbone', 'lib/views/map_view', 'lib/views/navbar_view',
				'lib/views/login_view',
				'lib/views/watch_view',
				'lib/views/user_view',
				'lib/user',
				'lib/api',
				'lib/views/create_yep_view',
				'lib/views/not_found_view',
				'text!lib/templates/download_app_modal.html'
],

	function($, _, Backbone, MapView, NavbarView, LoginView, WatchView, UserView, User, API, CreateYepView, NotFoundView, DownloadAppTpl){

	var AppRouter = Backbone.Router.extend({
		routes:{
			'watch/:yepId' : 'watch',
			'user/:userId' : 'user',
			'': 'root',
			'me': 'me',
			'_=_': 'facebookRedirect',
			'new': 'new',
			'settings': 'settings',
			'logout': 'logout',
			'login': 'login',
			'404': '404',
			'*notFound': 'notFound'
		}
	});

	var currentView;
	var navbarView;

	function cleanView(){
		if(currentView && currentView.close){
			currentView.close();
		}
	}


	var initialize = function(){

		var appRouter = new AppRouter;

			var ua = navigator.userAgent.toLowerCase();

		$(document).click("a[href^='/']", function(event){

			var href = $(event.target).attr('href');	
			if(! href){
				var href = $(event.target).parent().attr('href');
			}
			if(!href) return;

			var passThrough = [
				'https://play.google.com',
				'/auth/facebook',
				'/auth/google',
				'/auth/twitter',
				'/user/',
				'/',
				'/watch/'
			];


			for(var i = 0; i< passThrough.length; i++){

				var currentPassThrough = passThrough[i];
				console.log(currentPassThrough);
				console.log(href);
				if(href.search(currentPassThrough) >= 0){
					href = href.slice(0, currentPassThrough.length);
					break;
				}
			}

			console.log(href);

			if(passThrough.indexOf(href) === -1){
				event.preventDefault();

				var url = href.replace(/^\//,'').replace('\#\!\/','')

				appRouter.navigate(url, { trigger: true })

				return false
			}
			else {
		
			}
		});

		var showMobile = function(){
			if(navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("android") != -1 || ua.indexOf("ipod") != -1 || ua.indexOf("windows ce") != -1 || ua.indexOf("windows phone") != -1){
				$('#main').append(DownloadAppTpl);
				$('#login-appstore-prompt').modal('show');
			}
		};

		var loaderInit = function(){
			$('div#main').css('opacity', '0.2');
			$('div#load-boy').append('<img class="loading" src="/img/loading.gif" />');
		};

		appRouter.on('route:login', function(actions){
			return window.location.replace("http://yeplive.com");
			cleanView();
			if(navbarView){
				navbarView.remove();
			} currentView = new LoginView({el: '#main'});
		});

		appRouter.on('route:user', function(userId){
			cleanView();
			if(! User.authed){
				return appRouter.navigate("/login", {trigger:true})
			}
			navbarView = new NavbarView({el: '#navbar'});
			currentView = new UserView({el: '#main', userId : userId});
			showMobile();
		});

		appRouter.on('route:logout', function(actions){
			cleanView();
			if(navbarView){
				navbarView.remove();
			}
			$.post('/api/logout').then(function(){
				window.localStorage.setItem('token','');
				appRouter.navigate("/login", true);
			});
		});

		appRouter.on('route:root', function(actions){
			cleanView();
			if(! User.authed){
				return appRouter.navigate("/login", {trigger:true})
			}
			loaderInit();
			currentView = new MapView({el:'#main'});
			navbarView = new NavbarView({el:'#navbar'});
			showMobile();
		});

		appRouter.on('route:404', function(){
			cleanView();
			currentView = new NotFoundView({el:'#main'});
			navbarView = new NavbarView({el:'#navbar'});
			showMobile();
		});

		appRouter.on('route:notFound', function(actions){
			cleanView();
			return appRouter.navigate('404', true);
			appRouter.navigate("#login", true)
			return console.log('not found');
			$.get('/api/users?name='+actions).then(function(res){
					App.events.trigger('route:user', res);
			}, function(err){
			});
		});	

		appRouter.on('route:new', function(){
			cleanView();
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
			cleanView();
			appRouter.navigate("#login", true)
			
		});

		appRouter.on('route:settings', function(actions){
			cleanView();
		});

		appRouter.on('route:watch', function(yepId){
			cleanView();
			currentView = new WatchView({ el: '#main', yepId: yepId});
			navbarView = new NavbarView({el: '#navbar'});
			showMobile();
		});
	};

	return {
		initialize: initialize
	};

});
