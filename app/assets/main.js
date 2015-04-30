requirejs.config({
	baseUrl: '',
	paths:{
		jquery: 'vendor/jquery/dist/jquery',
		underscore: 'vendor/underscore/underscore',
		backbone: 'vendor/backbone/backbone',
		text: 'require/text',
		async: 'require/async',
		gmap3: 'vendor/gmap3/dist/gmap3',
		bootstrap: 'vendor/bootstrap/dist/js/bootstrap',
		swfobject: 'vendor/swfobject/swfobject/swfobject'
	},
	shim:{
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},
		bootstrap:{
			deps: ['jquery']
		}
	}
});

requirejs(['lib/app'], function(App){
	App();
});
