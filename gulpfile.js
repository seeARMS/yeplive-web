var gulp = require('gulp');

var minifyCss = require('gulp-minify-css');

var concat = require('gulp-concat');

var rjs = require('gulp-requirejs');


var AWS_KEY = "AKIAJ6Z73EB6WOT4G2CA";
var AWS_SECRET = "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";


var s3 = require('gulp-s3-upload')({
		accessKeyId:        AWS_KEY,
		secretAccessKey:    AWS_SECRET
});

gulp.task('build-js', function(){
	 rjs({
			baseUrl:'./app/assets',
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
				}
			},
				name:'main',
				out:'build.js'
		})
	.pipe(gulp.dest('./dist'))
});

gulp.task('build-css', function(){
	 return gulp.src('./app/assets/css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(concat('build.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('upload-assets', function(){

});

gulp.task('build', function(){

});
