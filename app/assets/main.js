requirejs.config({
	baseUrl: '/',
	paths:{
		jquery: 'vendor/jquery/dist/jquery',
		liveQuery: 'vendor/livequery/livequery',
		helper: 'lib/helper',
		underscore: 'vendor/underscore/underscore',
		backbone: 'vendor/backbone/backbone',
		text: 'require/text',
		async: 'require/async',
		asyncJS: 'vendor/async/lib/async',
		gmap3: 'vendor/gmap3/dist/gmap3',
		markerWithLabel: 'vendor/markerwithlabel/markerwithlabel',
		bootstrap: 'vendor/bootstrap/dist/js/bootstrap',
		swfobject: 'vendor/swfobject/swfobject/swfobject',
		videojs: 'vendor/videojs/dist/video-js/video',
		videojsMedia: 'vendor/videojs-contrib-media-sources/src/videojs-media-sources',
		videojsHLS: 'vendor/videojs-contrib-hls/dist/videojs.hls.min',
		videojsZoomRotate: 'vendor/videojs-zoomrotate/videojs.zoomrotate',
		socketio: 'vendor/socket.io-client/socket.io',
		swal: 'vendor/sweetalert/lib/sweet-alert.min',
		facebook: '//connect.facebook.net/en_US/sdk',
		twitter: 'vendor/twitter-share/twitter-share'
	},
	shim:{
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},
		liveQuery: {
			deps: ['jquery']
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
		videojsZoomRotate:{
			deps: ['videojs', 'videojsMedia']
		},
		gmap3:{
			deps: ['jquery']
		},
		facebook: {
			exports: 'FB'
		},
		markerWithLabel:{
			deps: ['gmap3', 'lib/map']
		}
	}
});

requirejs(['lib/app'], function(App){
	App();
});
