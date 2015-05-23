define(['jquery',
		'underscore',
		'asyncJS',
		'swal',
		'lib/user',
		'lib/helper',
		'backbone',
		'text!lib/templates/user.html',
		'text!lib/templates/user_yeps.html',
		'text!lib/templates/user_follow.html',
		'text!lib/templates/user_no_data.html',
		'lib/api'
	],
	function($, _, Async, Swal, User, Helper, Backbone, userTpl, yepsTpl, followTpl, noDataTpl, API){

		var UserView = Backbone.View.extend({

			tpl: _.template(userTpl),
			displayYeps: _.template(yepsTpl),
			displayFollow: _.template(followTpl),
			noData: _.template(noDataTpl),

			getUserInfo: function(userId, cb){

				API.get('/users/' + userId,
					window.localStorage.getItem('token'),
					function(err, user){

						if ( err ){
							var data = { success : 0 };
							cb(404, user)
						}

						user.followButtonClass = user.is_following ? 'btn btn-lg btn-danger' : 'btn btn-lg btn-primary';
						user.followButtonValue = user.is_following ? 'unfollow' : 'follow';
						user.followButtonContent = user.is_following ? 'unfollow' : 'follow';

						var logedInUserId = User.user.get('user_id');

						if(User.authed){
							user.followButtonClass += logedInUserId == userId ? ' disabled' : '';
						}
						console.log(user);
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

				$('#user-view-selection-following').on('click', function(){

					self.clearUserContents();
					self.toggleContentsView('following');

					API.get('/users/' + userId + '/following', function(err, followings){

						if(err){
							console.log(err); 
							return Swal("Warning", "Something is wrong", "warning");
						}

						var $userContents = $('div.user-contents');

						if(followings.users.length === 0){
							return $userContents.append(self.noData({ data: 'following' }));
						}

						followings.users.forEach(function(following, index){

							following.userLink = '/user/' + following.user_id;

							$userContents.append(self.displayFollow(following));

						});

					});

				});

			},

			registerShowFollowers: function(userId){

				var self = this;

				$('#user-view-selection-followers').on('click', function(){

					self.clearUserContents();
					self.toggleContentsView('followers');

					API.get('/users/' + userId + '/followers', function(err, followers){

						if(err){
							return Swal("Warning", "Something is wrong", "warning");
						}

						var $userContents = $('div.user-contents');

						if(followers.users.length === 0){
							return $userContents.append(self.noData({ data: 'followers' }));
						}

						followers.users.forEach(function(follower, index){

							follower.userLink = '/user/' + follower.user_id;

							$userContents.append(self.displayFollow(follower));

						});

					});

				});
			},

			registerShowYeps: function(userId){

				var self = this;

				$('#user-view-selection-yeps').on('click', function(){

					self.clearUserContents();
					self.toggleContentsView('yeps');


					API.get('/users/' + userId + '/yeps', function(err, yeps){

						if( err ){
							return Swal("Warning", "Something is wrong", "warning");
						}
						
						var $userContents = $('div.user-contents');

						if(yeps.yeps.length === 0){
							return $userContents.append(self.noData({ data: 'Yeps' }));
						}

						var currentTime = (new Date).getTime();

						yeps.yeps.forEach(function(yep, index){

							yep.video_timeElapsed = Helper.timeElapsedCalculator((currentTime / 1000) - yep.start_time);

							yep.video_duration = yep.vod_enable ? Helper.videoDurationConverter(yep.end_time - yep.start_time) : 'LIVE';

							yep.watchYep = '/watch/' + yep.id;

							if(yep.portrait){
								//Rotate the image
							}

							$userContents.append(self.displayYeps(yep));
						});

					});

				});
			},

			toggleContentsView: function(view){

				$('div.user-view-contents-selected').removeClass('user-view-contents-selected');
				$('#user-view-selection-' + view).addClass('user-view-contents-selected');

			},

			registerFollowAction: function(userId){

				$('button#user-follow-button').on('click', function(e){

					var self = $(this);
					e.preventDefault();

					var current = self.attr('value');

					if(current === 'follow'){

						API.post('/users/' + userId + '/following', {}, window.localStorage.getItem('token'),

							function(err, res){

								if( err ){
									return Swal("Warning", "Something is wrong", "warning");
								}
								
								if(res.success){
									self.attr('value', 'unfollow');
									self.attr('class', 'btn btn-lg btn-danger');
									self.html('unfollow');
								}

							}
						);
					}
					else if(current === 'unfollow'){

						API.delete('/users/' + userId + '/following', {}, window.localStorage.getItem('token'),

							function(err, res){

								if( err ){
									return Swal("Warning", "Something is wrong", "warning");
								}
								
								if(res.success){
									self.attr('value', 'follow');
									self.attr('class', 'btn btn-lg btn-primary');
									self.html('follow');
								}
								console.log(res);
							}

						);

					}
				});

			},

			render: function(data, userId){

				var self = this;

				

				this.$el.html(this.tpl(data.user));
				var $userContents = $('div.user-contents');

				if(data.yeps.yeps.length === 0){
					$userContents.append(this.noData({ data: 'Yeps' }));
				}

				var currentTime = (new Date).getTime();
				
				data.yeps.yeps.forEach(function(yep, index){

					yep.video_timeElapsed = Helper.timeElapsedCalculator((currentTime / 1000) - yep.start_time);

					yep.video_duration = yep.vod_enable ? Helper.videoDurationConverter(yep.end_time - yep.start_time) : 'LIVE';

					yep.watchYep = '/watch/' + yep.id;

					if(yep.portrait){
						//Rotate the image
					}

					$userContents.append(self.displayYeps(yep));
				});


				this.toggleContentsView('yeps');
				this.registerShowYeps(userId);
				this.registerShowFollowing(userId);
				this.registerShowFollowers(userId);
				this.registerFollowAction(userId);
			}
		});

		return UserView;

});
