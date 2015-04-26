(function(App){
	App = App || {};
	
	App.location = new App.Models.Location();

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
		App.mainView = new App.Views.UserView({ el:'#main', model: App.User });
	});

	App.events.on('route:new', function(){
		console.log('new yep route');
		if(! App.User ||  ! App.location || ! App.location.get('latitude')){
			return;
		}
		App.postAPI('/api/yeps', {
			'latitude': App.location.get('latitude'),
			'longitude': App.location.get('longitude')
		}, function(data){
			console.log(data);
			var yepName = data.stream_name;
			App.mainView = new App.Views.NewYepView({ el:'#main', yepName:yepName, yepId: data.id });	
		})
	});
	App.events.on('route:user', function(data){
		var user = new App.Models.User(data);
		App.mainView = new App.Views.UserView({ el:'#main', model: user});
	});
	App.events.on('route:404', function(){
		console.log('404');
	});
	App.events.on('route:settings', function(){
		if(! App.User){
			window.location.href="";
		} else {
			App.mainView = new App.Views.SettingsView({ el: '#main', model: App.User});
		}
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

	App.events.on('yep:record', function(data){
		console.log('toggle recording');	
		console.log(data);
		App.postAPI('/api/yeps/'+data+'/unstage', {},
			function(response){
				console.log(response);
				document.VideoRecorder.record();
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
		var currentRoute = Backbone.history.getFragment();
		if(currentRoute === 'settings'){
			window.location.href="#";
		}
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
	Backbone.history.start();
	
}(window.App));
