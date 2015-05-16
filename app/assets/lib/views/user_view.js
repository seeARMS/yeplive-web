define(['jquery',
		'underscore',
		'asyncJS',
		'swal',
		'lib/helper',
		'backbone',
		'text!lib/templates/user.html',
		'text!lib/templates/user_yeps.html',
		'text!lib/templates/user_follow.html',
		'lib/api'
	],
	function($, _, Async, Swal, Helper, Backbone, userTpl, yepsTpl, followTpl, API){

		var UserView = Backbone.View.extend({

			tpl: _.template(userTpl),
			displayYeps: _.template(yepsTpl),
			displayFollow: _.template(followTpl),

			getUserInfo: function(userId, cb){

				API.get('/users/' + userId,
					window.localStorage.getItem('token'),
					function(err, user){
						if ( err ){
							var data = { success : 0 };
							cb(404, user)
						}
						user.followButtonClass = user.is_following ? 'user-to-unfollow btn btn-lg btn-danger' : 'user-to-follow btn btn-lg btn-primary';
						user.followButtonContent = user.is_following ? 'unfollow' : 'follow';
						cb(null, user);
					}
				);

			},

			getUserYeps: function(userId, cb){

				API.get('/users/' + userId + '/yeps', function(err, yeps){

					if( err ){
						var data = { success : 0 };
						cb(404, yeps)
					}
					console.log(yeps)
					cb(null, yeps);
				});
			},

			initialize: function(opts){

				var userId = opts.userId;
				var self = this;

				Async.parallel({
					one: self.getUserInfo.bind(null, userId),
					two: self.getUserYeps.bind(null, userId) 
				}, function(err, results){
					if(err){
						self.render({success : 0});
						return;
					}
					var data = {
						user : results['one'],
						yeps : results['two'],
						success : 1
					}
					self.render(data, userId);
				});

			},

			close: function(){
				this.remove();
				this.unbind();
			},

			clearUserContents: function(){
				$('div.user-contents').empty();
			},

			registerShowFollowing: function(userId){

				var self = this;

				$('.user-show-following').on('click', function(){
					self.clearUserContents();

					API.get('/users/' + userId + '/following', function(err, followings){

						if(err){
							console.log(err); 
							return Swal("Warning", "Something is wrong", "warning");
						}

						var $userContents = $('div.user-contents');

						followings.users.forEach(function(following, index){

							$userContents.append(self.displayFollow(following));

						});

					});

				});

			},

			registerShowFollowers: function(userId){

				var self = this;

				$('.user-show-followers').on('click', function(){
					self.clearUserContents();

					API.get('/users/' + userId + '/followers', function(err, followers){

						if(err){
							return Swal("Warning", "Something is wrong", "warning");
						}

						var $userContents = $('div.user-contents');

						followers.users.forEach(function(follower, index){

							$userContents.append(self.displayFollow(follower));

						});

					});

				});
			},

			registerShowYeps: function(userId){

				var self = this;

				$('.user-show-yeps').on('click', function(){
					self.clearUserContents();


					API.get('/users/' + userId + '/yeps', function(err, yeps){

						if( err ){
							return Swal("Warning", "Something is wrong", "warning");
						}
						
						var $userContents = $('div.user-contents');

						var currentTime = (new Date).getTime();

						yeps.yeps.forEach(function(yep, index){

							yep.video_timeElapsed = Helper.timeElapsedCalculator((currentTime / 1000) - yep.start_time);

							yep.video_duration = yep.vod_enable ? Helper.videoDurationConverter(yep.end_time - yep.start_time) : 'LIVE';

							if(yep.portrait){
								//Rotate the image
							}

							$userContents.append(self.displayYeps(yep));
						});

					});

				});
			},

			render: function(data, userId){

				var self = this;
				this.$el.html(this.tpl(data.user));
				var $userContents = $('div.user-contents');
				var currentTime = (new Date).getTime();
				
				data.yeps.yeps.forEach(function(yep, index){

					yep.video_timeElapsed = Helper.timeElapsedCalculator((currentTime / 1000) - yep.start_time);

					yep.video_duration = yep.vod_enable ? Helper.videoDurationConverter(yep.end_time - yep.start_time) : 'LIVE';

					if(yep.portrait){
						//Rotate the image
					}

					$userContents.append(self.displayYeps(yep));
				});
				this.registerShowYeps(userId);
				this.registerShowFollowing(userId);
				this.registerShowFollowers(userId);
			}
		});

		return UserView;

});
