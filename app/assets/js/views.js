(function(App){
	App = App || {};
	App.Views = {};

	App.Views.UserModalView = Backbone.View.extend({
		events:{
			'click .js-logout': function(){
				$.post('/logout').then(function(){
					App.events.trigger('logout');
					$('.user-modal').modal('hide');
				});
			}
		},
		tpl: _.template($("#user-modal-tpl").html()),
		initialize: function(){
			this.render();
			$('.user-modal').modal();
		},
		render: function(){
			this.$el.html(this.tpl());	
		}
	});

	App.Views.UserView = Backbone.View.extend({
		tpl: _.template($("#user-tpl").html()),
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl(App.User));
		}
	});

	App.Views.YepModalView = Backbone.View.extend({
		events:{
			'click .js-like': 'likeYep',
			'click .js-follow': 'followUser'
		},
		tpl: _.template($("#yep-modal-tpl").html()),
		chatTpl: _.template($("#yep-chat-tpl").html()),
		chatMessageTpl: _.template($("#yep-chat-message-tpl").html()),
		descriptionTpl: _.template($("#yep-description-tpl").html()),
		initialize: function(){
			if(this.model.attributes.vod_enable){
				this.model.attributes.source = this.model.attributes.vod_path;
				this.model.attributes.mobileSource = this.model.attributes.vod_mobile_path;
			} else {
				this.model.attributes.source = this.model.attributes.stream_url;
				this.model.attributes.mobileSource = this.model.attributes.stream_mobile_path;
			}
			if (App.token){
				App.socket.emit('client:join',{})
			} else {
			}
			this.render();	
			$('.yep-modal').modal();
			this.setLiked();
			var self = this;
			$('.yep-modal').on('hidden.bs.modal', function () {
				self.undelegateEvents();
				App.events.trigger('chat:leave');
			})
		},
		render: function(){
			this.$el.html(this.tpl(this.model.attributes));
			this.$el.find('#yep-description').append(this.descriptionTpl(this.model.attributes));
			this.$el.find('#yep-chat').append(this.chatTpl(this.model.attributes));
			$('.js-send').click(function(){
				var message = $('.js-chat-input').val();
				if(! message) return;
				$('.js-chat-input').val('');
				var data = {
					message: message
				};
				App.events.trigger('chat:send', data);
			});
			var self = this;
			App.events.on('chat:message', function(message){
				var messageView = self.chatMessageTpl(message);
				$('.chat-box').append(messageView);
			});
			this.setupVideo();
		},
		setupVideo: function(){
			var videoClass = 'yep-'+this.model.get('id');
			var videoEl = document.getElementsByClassName(videoClass)[0];
			videojs(videoEl, {}, function(){
			});
		},
		setLiked: function(){
			App.getAPI('/yeps/'+this.model.get('id'), 
			 function(res){
				if(res.voted === 1){
					$('.js-like').addClass('liked');
				} else {
					$('.js-like').removeClass('liked');
				}
				console.log(res);
			});	
		},
		likeYep: function(e){
			if(! App.Auth.authed){
				return App.toggleLoginModal();
			};
			$(e.target).toggleClass('liked');
			console.log(this);
			var data = {
				id: this.model.get('id')
			};
			App.events.trigger('yep:liked', data);
		},
		followUser: function(e){
			if(! App.Auth.authed){
				return App.toggleLoginModal();
			};
			this.toggleFollow(e.target);
			var data = {
				id: this.model.get('user').user_id
			};
			App.events.trigger('user:follow', data);
		},
		toggleFollow: function(el){
			if($(el).text() === 'Follow'){
				$(el).text('Unfollow');
			} else {
				$(el).text('Follow');
			}
		}
	});	

	App.Views.LoadingView = Backbone.View.extend({
		tpl: _.template($("#loading-tpl").html()),
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl());
		}
	});

	App.Views.MainView = Backbone.View.extend({
		tpl: _.template($("#main-tpl").html()),
		initialize: function(){
			this.render();
			App.Map.el = document.getElementById('map-canvas');
			App.Map.$el = $('#map-canvas');
			App.Map.initialize();
		//	this.showMarkers();
		//google.maps.event.addDomListener(window, 'load', Map.initialize);
		},
		render: function(){
			this.$el.html(this.tpl(App.Auth));
		}
		/*
		showMarkers: function(){	
			App.Map.populate(App.yepsCollection.getMapData());
		}
		*/
	});

	App.Views.NavbarView = Backbone.View.extend({
		tpl: _.template($("#navbar-tpl").html()),
		events:{
			'click .js-user-dropdown': function(){
				console.log('dropdown');
				$('.user-dropdown').dropdown()
			},
			'click .js-login': function(){
				$('#login-modal').modal();
			},
			'click .js-user': function(){
				App.events.trigger('showUserModal');	
			},
			'click .js-logout': function(){
				$.post('/logout').then(function(){
					App.events.trigger('logout');
				});
			}
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl(App));
		}
	});

	App.Views.FooterView = Backbone.View.extend({
		tpl: _.template($("#footer-tpl").html()),
		events:{},
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl(App));	
		}
	});
}(window.App));
