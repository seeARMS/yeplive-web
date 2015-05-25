define(['jquery',
		'lib/helper',
		'asyncJS',
		'swal',
		'underscore',
		'backbone',
		'text!lib/templates/watch.html',
		'lib/api',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'videojsZoomRotate',
		'lib/socket',
		'lib/user',
		'text!lib/templates/chat_message.html',
		'text!lib/templates/video_overlay.html',
		'facebook',
		'twitter'
	],

	function($, helper, async, Swal, _, Backbone, watchTpl, Api, vj, vjm, vjh, vjRoomRotate, socket, User, chatMessageTpl, overlayTpl, FB, Twitter){

		var currentVoteCount;

		var WatchView = Backbone.View.extend({

			tpl: _.template(watchTpl),

			getYepInfo: function(options, cb){

				Api.get('/yeps/' + options.yepId, window.localStorage.getItem('token'), function(err, yep){

					if( err ){
						var data = { success : 0 };
						window.location.href='/404';
						cb(404, data)
					}
					
					var video_path;
					var playback_type;
					
					if(yep.is_web){
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					} else {
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					}


					// If we get VOD, we directly stream from cloudfront
					// If we get LIVE, we stream using rtmp
					var thumbnail_path = yep.image_path;
//					var video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
//					var playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';
					var currentTime = (new Date).getTime()/1000;
					var timeDiff = currentTime - yep.start_time;

					var data = {
						timeElapsed: helper.timeElapsedCalculator(timeDiff),
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

			/*
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
			*/

			initialize: function(options){

				var self = this;
				async.parallel({
					one: self.getYepInfo.bind(null, options)
					//two: self.getCommentInfo.bind(null, options) 
				}, function(err, results){
					if(err){
						self.render({success : 0});
					}
					var data = {
						video : results['one'],
						//comments : results['two'],
						user : User.authed ? User.user.attributes : "",
						success : 1
					}

					if(User.authed) {

						data.followButtonClass = data.video.yep.user.is_following ? 'btn btn-xs btn-danger' : 'btn btn-xs btn-primary';
						data.followButtonValue = data.video.yep.user.is_following ? 'unfollow' : 'follow';
						data.followButtonContent = data.video.yep.user.is_following ? 'unfollow' : 'follow';

						var logedInUserId = User.user.get('user_id');

						data.followButtonClass += logedInUserId == data.video.yep.user.user_id ? ' disabled' : '';
					}

					self.render(data, options);
				});

			},

			registerFollowAction: function(userId){

				$('button#watch-follow-button').on('click', function(e){

					var self = $(this);
					e.preventDefault();

					var current = self.attr('value');

					if(current === 'follow'){

						Api.post('/users/' + userId + '/following', {}, window.localStorage.getItem('token'),

							function(err, res){

								if( err ){
									return Swal("Warning", "Something is wrong", "warning");
								}
								
								if(res.success){
									self.attr('value', 'unfollow');
									self.attr('class', 'btn btn-xs btn-danger');
									self.html('unfollow');
								}

							}
						);
					}
					else if(current === 'unfollow'){

						Api.delete('/users/' + userId + '/following', {}, window.localStorage.getItem('token'),

							function(err, res){

								if( err ){
									return Swal("Warning", "Something is wrong", "warning");
								}
								
								if(res.success){
									self.attr('value', 'follow');
									self.attr('class', 'btn btn-xs btn-primary');
									self.html('follow');
								}

							}

						);

					}
				});

			},
			
			setupVideo: function(data){
				var videoEl = document.getElementById('playVideo');
				var self = this;
				vj(videoEl, {}, function(player){

					if(data.video.yep.vod_enable){


						if(! data.video.yep.portrait && ! data.video.yep.front_facing){

							if($(window).width() < 600){
								$('#playVideo_html5_api').css('left','0px');
								$('#playVideo_html5_api').css('top','0px');
							}

						}
						else if(! data.video.yep.portrait && data.video.yep.front_facing){}
						
						if(data.video.yep.portrait && ! data.video.yep.front_facing){
									this.zoomrotate({
										rotate: 90,
										zoom: 1
									});
									if($(window).width() < 600){
										var width = $('#playVideo_html5_api').css('width');
										var height = $('#playVideo_html5_api').css('height');
										$('#playVideo_html5_api').css('width',height);
										$('#playVideo_html5_api').css('height',width);
									}
								}
								else if (data.video.yep.portrait && data.video.yep.front_facing) {
									this.zoomrotate({
										rotate: 270,
										zoom: 1
									});
									if($(window).width() < 600){
										var width = $('#playVideo_html5_api').css('width');
										var height = $('#playVideo_html5_api').css('height');
										$('#playVideo_html5_api').css('width',height);
										$('#playVideo_html5_api').css('height',width);
									}
								/*
									var width = $('#playVideo_flash_api').css('width');
									var height = $('#playVideo_flash_api').css('height');
									$('#playVideo_flash_api').css('width',height);
									$('#playVideo_flash_api').css('height',width);
									var width = $('#playVideo_html5_api').css('width');
									var height = $('#playVideo_html5_api').css('height');
									$('#playVideo_html5_api').css('width',height);
									$('#playVideo_html5_api').css('height',width);
									$('#playVideo_html5_api').css('top','124px');
									$('#playVideo_html5_api').css('left','-140px');
								*/
								}
//					this.play();
						}
						else {
							if(data.video.yep.portrait && ! data.video.yep.front_facing){
								var width = $('#playVideo_flash_api').css('width');
								var height = $('#playVideo_flash_api').css('height');
								$('#playVideo_flash_api').css('width',height);
								$('#playVideo_flash_api').css('height',width);
								$('#playVideo_flash_api').css('top','-42px');
								$('#playVideo_flash_api').css('left','42px');
								$('#playVideo_flash_api').css("-moz-transform","rotate(90deg)"
								).css("-webkit-transform","rotate(90deg)"
								).css("-o-transform","rotate(90deg)"
								).css("-ms-transform","rotate(90deg)"
								).css("transform","rotate(90deg)");
							}
							else if(data.video.yep.portrait && data.video.yep.front_facing){
								var width = $('#playVideo_flash_api').css('width');
								var height = $('#playVideo_flash_api').css('height');
								$('#playVideo_flash_api').css('width',height);
								$('#playVideo_flash_api').css('height',width);
								$('#playVideo_flash_api').css('top','-40px');
								$('#playVideo_flash_api').css('left','40px');
								$('#playVideo_flash_api').css("-moz-transform","rotate(270deg)"
								).css("-webkit-transform","rotate(270deg)"
								).css("-o-transform","rotate(270deg)"
								).css("-ms-transform","rotate(270deg)"
								).css("transform","rotate(270deg)");

						}
					}
/*
					this.on('error', function(){
						alert('an error occured with the stream');
						window.location.reload();
					});
*/
					this.on('ended', function(){
					});
					//console.log(overlayTpl);
//					$('#recorder').append(overlayTpl);
					//console.log('VideoJS successfully loaded')
				});
			},

			promptLogin: function(){
				$('#login-modal').modal('show');
			},

			addMessagingListener: function(options){

				var self = this;
				var $chat = $('#chat');
				var chatMessage = _.template(chatMessageTpl);

				var addMessage = function(messages){

					// If from history
					if(messages.messages){

						messages.messages.forEach(function(val, index){
							var $el = $(chatMessage(val));
							$chat.append($el);
						});

					}
					else if(messages.message){

						var $el = $(chatMessage(messages));
						$chat.append($el);
					}

					$('div.watch-chat-box').animate({scrollTop: $('div.watch-chat-box')[0].scrollHeight },'slow');
				};

				$("input.watch-chat-input").bind("keypress", function(event) {

					if(event.which == 13) {

						if(!User.authed){
							return self.promptLogin();
						}

						event.preventDefault();

						socket.emit('message', {
							message: $('input.watch-chat-input').val(),
							user_id: User.user.get('user_id')
						});

						$('input.watch-chat-input').val('');

				    }

				});

				var userId = User.user.get('user_id'),
					displayName = User.user.get('display_name'),
					picturePath = User.user.get('picture_path');

				socket.emit('join_room', {
					user_id: userId ? userId : 'guest',
					yep_id: options.yepId,
					display_name: displayName ? displayName : 'guest',
					picture_path: picturePath ? picturePath : 'no picture path'
				});


				socket.on('server:error', function(data){
				});

				socket.on('yep:connection', function(data){
					$('.connection-count').text(data.connection_count);
				});

				socket.on('yep:complete', function(data){
					$('').html('<h1 style="color:white" class="text-center">Stream Complete</h1>');
				});

				socket.on('chat:history', function(data){
					addMessage(data);
				});

				socket.on('chat:message', function(data){
					addMessage(data);
				});

				socket.on('yep:vote', function(data){
					self.updateVoteCount(data.vote_count);
				});

				socket.on('yep:view', function(data){
					self.updateViewCount(data.view_count);
				});

			},

			/*
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
			*/
			updateVoteCount: function(voteCount){
				if(currentVoteCount !== voteCount){
					$('span.watch-vote-count').html(voteCount);
					currentVoteCount = voteCount;
				}
			},

			updateViewCount: function(viewCount){
				$('span.watch-view-count').html(viewCount);
			},

			addVoteListener: function(yepId){

				var self = this;

				var $voteIcon = $('i#voteIcon');

				var starCount = 1;

				$('button.js-vote').on('click', function(){

					if(!User.authed){
						return self.promptLogin();
					}

					Api.post('/yeps/' + yepId + '/votes', {},
							window.localStorage.getItem('token'),
							function(err, res){

								if(err){
									return Swal("Warning", "Something is wrong", "warning");
								}
								
								if(res.success){
									$('.star-' + starCount).css('-webkit-animation-name', 'spin');
									starCount++;
								}
								else{
									return Swal("", "You have already given 5 stars to this yep", "warning");
								}
							}
					);
				});
			},

			addViewCount: function(yepId){

				Api.post('/yeps/' + yepId + '/views', {},
					window.localStorage.getItem('token'),
					function(err, res){
						if(err){
							return Swal("Warning", "Something is wrong", "warning");
						}
						if(res.success){
							// Do something
						}
						else{
							// Do something
						}
					}
				);
			},

			initFacebookShare: function(yep){

				FB.init({
					appId: '1577314819194083',
					version: 'v2.3'
				});

				$('#share-fb').on('click',function(){
					FB.ui({
						method: 'share',
						href: 'yplv.tv/' + yep.url_hash
						}, function(response){}
					);
				});
			},

			initTwitterShare: function(yep){

				$('#share-twitter').on('click',function(){

					var url = 'http://yplv.tv/' + yep.url_hash;
					var text = yep.user.display_name + ' is on yeplive "' + yep.title + '".';
					var via = 'yeplive';
					var related = 'yeplive';
					window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text +'&via=' + via + '&related=' + related, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
				});

			},

			initGoogleShare: function(yep){

				$('#share-google').on('click',function(){
					var url = 'yplv.tv/' + yep.url_hash;
					window.open('https://plus.google.com/share?url=' + url, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
				});

			},

			render: function(data, options){

				console.log(data);

				this.$el.html(this.tpl(data));

				$('[data-toggle="tooltip"]').tooltip();

				this.addMessagingListener(options);
				this.registerFollowAction(data.video.yep.user.user_id);
				this.setupVideo(data);
				//this.addCommentListener(options);
				this.addVoteListener(options.yepId);
				this.addViewCount(options.yepId);
				this.initFacebookShare(data.video.yep);
				this.initTwitterShare(data.video.yep);
				this.initGoogleShare(data.video.yep);
			}
			/*
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
			*/
		});

		return WatchView;
	}

);
