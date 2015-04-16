(function(App){
	App = App || {};

	App.mainView = new App.Views.LoadingView({ el: '#main' });
	
	App.yepsCollection = new App.Collections.YepsCollection();
	App.yepsCollection.fetch().then(function(){
		App.Map.populate(App.yepsCollection.getMapData());
	});

	App.events.on('yep:clicked', function(data){
		var chatData = {
			room: data	
		};

		App.events.trigger('chat:join',chatData);
		
		var yep = App.yepsCollection.find(function(currentYep){
			return currentYep.get('id') === data;
		});
		App.yepModalView = new App.Views.YepModalView({ model: yep, el: '#modal-div' });
	});
	
	App.events.on('loaded', function(){
		App.mainView = new App.Views.MainView({ el: '#main' });
		App.navbarView = new App.Views.NavbarView({ el: '#navbar-div' });
	});



//VOD SOURCE
//rtmp://54.149.106.109/vods3/_definst_/&mp4:amazons3/dev-wowza/foneeggb.mp4"
//STREAM SOURCE
//rtmp://54.149.106.109:1935/test/&mp4:NAME
	
}(window.App));
