requirejs.config({
	baseUrl: 'lib',
	paths:{
		jquery: 'vendor/jquery/dist',
		underscore: 'vendor/underscore',
		backbone: 'vendor/backbone',
		gmap3: 'vendor/gmap3/dist/gmap3'
	}
});

requirejs(['app'], function(App){
	App.initialize();
});
