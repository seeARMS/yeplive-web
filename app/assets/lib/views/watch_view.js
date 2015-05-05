define(['jquery',
		'lib/helper',
		'asyncJS',
		'underscore',
		'backbone',
		'text!lib/templates/watch.html',
		'lib/api',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'lib/socket',
		'lib/user',
		'text!lib/templates/chat_message.html',
		'text!lib/templates/video_overlay.html',
	],

	function($, helper, async, _, Backbone, watchTpl, Api, vj, vjm, vjh, socket, User, messageTpl,
		overlayTpl){

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

					console.log("YEP:");
					console.log(yep);
					
					if(yep.is_web){
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_hls;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					} else {
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_hls;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';
					}


					// If we get VOD, we directly stream from cloudfront
					// If we get LIVE, we stream using rtmp
					var thumbnail_path = yep.image_path;
//					var video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
//					var playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';

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
				
				return cb(null, true);

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
				console.log('test');
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
						user : User.authed ? User.user.attributes : "",
						success : 1
					}
					self.render(data, options);
				});

			},
			
			setupVideo: function(data){
				var videoEl = document.getElementById('playVideo');
				var self = this;
				vj(videoEl, {}, function(player){
					this.play();
					console.log(data.video);
					if(data.video.yep.portrait){
						self.rotateVideo();
					}
					console.log(overlayTpl);
//					$('#recorder').append(overlayTpl);
					console.log('VideoJS successfully loaded')
				});
			},

			render: function(data){
				console.log(data);
				this.$el.html(this.tpl(data));
				this.setupVideo(data);
			},


			listen: function(){
					
				socket.emit('join_room', {
					user_id: 123,
					display_name: 'mock',
					yep_id: '7',
					picture_path: 'something'
				});

				socket.on('server:error', function(data){
					console.log(data);

				});

				socket.on('yep:connection', function(data){
					console.log(data);

				});
				$chat = $('#chat');
				message = _.template(messageTpl);
				socket.on('chat:history', function(data){
					$chat.append(message(data));
				});

				socket.emit('message', {
					message: 'Test',
					user_id: 123
				});

				socket.on('chat:message', function(data){
					console.log(data);

				});

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

										var newComment = '<div class="row comments new-comment">';
										newComment += '<div class="col-xs-4"></div><div class="col-xs-4">';
										newComment += '<img class="commenter-picture" src="' + user.picture_path + '" />';
										newComment += '<div>' + user.display_name + '<i> Just Now</i></div>';
										newComment += '<div>' + comment + '</div>';
										newComment += '</div><div class="col-xs-4"></div></div><hr />';

										$('div.comment-container').prepend(newComment);

										$('html,body').animate({scrollTop: $('div.new-comment').offset().top},'slow');
										$('div.comment-area').html('<h3 class="text-center">Thank you!</h3>');
									}
						);

					}
					else{
						$('#login-modal').modal('show');
					}

				});
			},

			addVoteListener: function(options, yep){
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
										$('i.watch-vote').attr('class', 'fa fa-thumbs-up fa-large watch-vote');
										$('i.watch-vote').html(' ' + (res.vote + currentVotes).toString());
										currentVotes++;
									}
									else{
										$('i.watch-vote').attr('class', 'fa fa-thumbs-o-up fa-large watch-vote');
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
								$('div.watch-view-count').html('<i class="fa fa-eye fa-2x" > ' + res.views + '</i>');
								return;
							}
				);
			},

			render: function(data, options){
				this.listen();
				this.$el.html(this.tpl(data));
				this.setupVideo(data);
				this.addCommentListener(options);
				this.addVoteListener(options, data.video.yep);
				this.addViewCount(options);
				
			},

			rotateVideo: function(){
				console.log('rotating');	
				$('#playVideo').css({  
					'-webkit-transform': 'rotate(90deg)',  //Safari 3.1+, Chrome  
					'-moz-transform': 'rotate(90deg)',     //Firefox 3.5-15  
					'-ms-transform': 'rotate(90deg)',      //IE9+  
					'-o-transform': 'rotate(90deg)',       //Opera 10.5-12.00  
					'transform': 'rotate(90deg)'
				})
				$('#main').css({
					'margin-top': '125px'
				});
				$('.vjs-control-bar').css({
					'display':'none'
				});
			}
		});

		return WatchView;
	}

);
