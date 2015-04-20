(function(App){
	App = App || {};

	App.yepsCollection = new App.Collections.YepsCollection();
	App.events.on('route:root', function(){
		App.mainView = new App.Views.LoadingView({ el: '#main' });	
		App.mainView = new App.Views.MainView({ el: '#main' });
		App.footerView = new App.Views.FooterView({ el: '#footer-div' });
		App.yepsCollection.fetch().then(function(){
			App.Map.populate(App.yepsCollection.getMapData());
		});
	});
	App.events.on('route:me', function(){
		console.log('user route');
		App.mainView = new App.Views.LoadingView({ el: '#main' });	
		App.mainView = new App.Views.UserView({ el:'#main' });
	});

	App.events.on('yep:liked', function(data){
		if(! App.Auth.authed){
			return App.toggleLoginModal();
		}
		var id = data.id;
		App.postAPI('/like', {
				id: id
			}, function(res){
				console.log(res);
			});
		});	

	App.toggleLoginModal = function(){
		$('#login-modal').modal();
	};

	App.events.on('yep:clicked', function(data){
		var chatData = {
			room: data	
		};

		App.events.trigger('chat:join',chatData);
		
		var yep = App.yepsCollection.find(function(currentYep){
			return currentYep.get('id') === data;
		});
		App.currentModal= new App.Views.YepModalView({ model: yep, el: '#modal-div' });
	});
	
	App.events.on('loaded', function(){
		App.navbarView = new App.Views.NavbarView({ el: '#navbar-div' });
	});

	App.events.on('showUserModal', function(){
		App.currentModal = new App.Views.UserModalView({ model: App.User, el: '#modal-div'});
	});

	App.events.on('logout', function(){
		App.Auth.authed = false;
		App.navbarView.render();	
	});

	App.events.on('user:follow', function(data){
		App.postAPI('/follow/'+data.id,{},function(res){
			console.log(res);
		});
	});




//VOD SOURCE
//rtmp://54.149.106.109/vods3/_definst_/&mp4:amazons3/dev-wowza/foneeggb.mp4"
//STREAM SOURCE
//rtmp://54.149.106.109:1935/test/&mp4:NAME
	Backbone.history.start({pushState: true});
	
}(window.App));
