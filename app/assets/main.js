requirejs.config({
	baseUrl: '/',
	paths:{
		jquery: 'vendor/jquery/dist/jquery',
		helper: 'lib/helper',
		underscore: 'vendor/underscore/underscore',
		backbone: 'vendor/backbone/backbone',
		text: 'require/text',
		async: 'require/async',
		asyncJS: 'vendor/async/lib/async',
		gmap3: 'vendor/gmap3/dist/gmap3',
		bootstrap: 'vendor/bootstrap/dist/js/bootstrap',
		swfobject: 'vendor/swfobject/swfobject/swfobject',
		videojs: 'vendor/videojs/dist/video-js/video',
		videojsMedia: 'vendor/videojs-contrib-media-sources/src/videojs-media-sources',
		videojsHLS: 'vendor/videojs-contrib-hls/dist/videojs.hls.min',
		socketio: 'vendor/socket.io-client/socket.io',
		swal: 'vendor/sweetalert/lib/sweet-alert.min'
	},
	shim:{
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},
		bootstrap:{
			deps: ['jquery']
		},
		videojsMedia:{
			deps:['videojs']
		},
		videojsHLS:{
			deps: ['videojs','videojsMedia']
		},
		gmap3:{
			deps: ['jquery']
		}
	}
});

requirejs(['lib/app'], function(App){
	App();
});
