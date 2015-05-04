define(['jquery',
		'lib/helper',
		'lib/user',
		'asyncJS',
		'underscore',
		'backbone',
		'text!lib/templates/discover.html',
		'lib/api',
		'videojs',
		'lib/socket'
	],
	function($, helper, User, async, _, Backbone, discoverTpl, Api, vj, socket){

		var WatchView = Backbone.View.extend({

			tpl: _.template(discoverTpl),

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
					var video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
					var playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';

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
						if(val.picture_path === ''){
							array[index].picture_path = '/img/user.png';
						}
						array[index].created_at = helper.timeElapsedCalculator((new Date).getTime()/1000 - val.created_time);
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
						//self.render({success : 0});
						self.$el.html(self.tpl());
					}
					var data = {
						video : results['one'],
						comments : results['two'],
						user : User.authed ? User.user.attributes : "",
						success : 1
					}
					//self.render(data, options);
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

			},
			addCommentListener: function(options){
				$('button.user-comment-button').on('click', function(){

					if (User.authed){

						var comment = $('textarea.user-comment-area').val();
						var user = User.user.attributes;
						var created_time = Math.ceil((new Date).getTime()/1000)

						Api.post('/comments/' + options.yepId, 
									{
										created_time: created_time,
										comment: comment
									},
									window.localStorage.getItem('token'),
									function(err, res){
										if(err){
											console.log(err);
											return;
										}
										var newComment = '<div class="row comments">';
										newComment += '<div class="col-xs-4"></div><div class="col-xs-4">';
										newComment += '<img class="commenter-picture" src="' + user.picture_path + '" />';
										newComment += '<div>' + user.display_name + '<i> Just Now</i></div>';
										newComment += '<div>' + comment + '</div>';
										newComment += '</div><div class="col-xs-4"></div></div><hr />';

										$('div.comment-container').prepend(newComment);
									}
						);

					}
					else{
						$('#login-modal').modal('show');
					}

				});
			},

			addVoteListener: function(options, yep){
				console.log(yep);
				if(User.authed){
					var currentVotes = yep.vote_count;
					$('i.watch-vote').on('click', function(){
						Api.post('/yeps/' + options.yepId + '/votes', {},
								window.localStorage.getItem('token'),
								function(err, res){
									if(err){
										console.log(err);
										return;
									}
									if(res.vote){
										$('i.watch-vote').attr('class', 'fa fa-thumbs-up watch-vote');
										$('i.watch-vote').html(' ' + (res.vote + currentVotes).toString());
										currentVotes++;
									}
									else{
										$('i.watch-vote').attr('class', 'fa fa-thumbs-o-up watch-vote');
										$('i.watch-vote').html(' ' + (currentVotes - 1).toString());
										currentVotes--;
									}
								}
						);
					});
				}
			},

			addViewCount: function(options){
				Api.post('/yeps/' + options.yepId + '/views', {},
							window.localStorage.getItem('token'),
							function(err, res){
								if(err){
									console.log(err);
									return;
								}
								$('div.watch-view-count').html('Views: ' + res.views);
								return;
							}
				);
			},

			render: function(data, options){
				this.$el.html(this.tpl(data));
				this.setupVideo();
				this.addCommentListener(options);
				this.addVoteListener(options, data.video.yep);
				this.addViewCount(options);
			}
		});

		return WatchView;
	}

);
