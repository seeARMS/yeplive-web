define(['jquery',
		'helper',
		'asyncJS',
		'underscore',
		'backbone',
		'text!lib/templates/watch.html',
		'lib/api',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'lib/socket'
	],
	function($, helper, async, _, Backbone, watchTpl, Api, vj, vjm, vjh, socket){

		var WatchView = Backbone.View.extend({

			tpl: _.template(watchTpl),

			getYepInfo: function(options, cb){

				Api.get('/yeps/' + options.yepId, function(err, yep){

					if( err ){
						var data = { success : 0 };
						cb(404, data)
					}
					
					var video_path;
					var playback_type;
				
					if(yep.is_web){
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_hls;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					} else {
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';
					}

					// If we get VOD, we directly stream from cloudfront
					// If we get LIVE, we stream using rtmp
					var thumbnail_path = yep.image_path;

					var data = {
						el : '#main',
						video_path : video_path,
						thumbnail_path : thumbnail_path,
						playback_type : playback_type,
						yep : yep,
						success : 1
					};

					cb(null, data);
				});
			},

			getCommentInfo: function(options, cb){

				Api.get('/comments/' + options.yepId, function(err, results){

					if( err ){
						var data = { success : 0 };
						cb(404, data);
					}

					results.forEach(function(val, index, array){
						array[index].created_at = helper.timeElapsedCalculator((new Date).getTime()/1000 - val.created_at);
					});

					var data = results;

					cb(null, data);

				});
			},

			initialize: function(options){
				var self = this;
				async.parallel({
					one: self.getYepInfo.bind(null, options),
					two: self.getCommentInfo.bind(null, options) 
				}, function(err, results){
					if(err){
						self.render({success : 0});
					}
					var data = {
						video : results['one'],
						comments : results['two'],
						success : 1
					}
					self.render(data);
				});

			},
			
			setupVideo: function(){
				var videoEl = document.getElementById('playVideo');
				vj(videoEl, {}, function(){
					console.log('VideoJS successfully loaded')
				});
			},

			render: function(data){
				console.log(data);
				this.$el.html(this.tpl(data));
				this.setupVideo();
			},

			listen: function(){
			}
		});

		return WatchView;
	}

);
