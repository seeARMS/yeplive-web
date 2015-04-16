(function(App){
	App = App || {};
	App.Views = {};

	App.Views.YepModalView = Backbone.View.extend({
		tpl: _.template($("#yep-modal-tpl").html()),
		chatTpl: _.template($("#yep-chat-tpl").html()),
		chatMessageTpl: _.template($("#yep-chat-message-tpl").html()),
		descriptionTpl: _.template($("#yep-description-tpl").html()),
		initialize: function(){
			if(this.model.attributes.vod_enable){
				this.model.attributes.source = this.model.attributes.vod_path;
			} else {
				this.model.attributes.source = this.model.attributes.stream_url;
			}
			if (App.token){
				App.socket.emit('client:join', {

				});
			} else {
			}
			this.render();	
			$('.yep-modal').modal();
			$('.yep-modal').on('hidden.bs.modal', function () {
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
				console.log(message);
				var messageView = self.chatMessageTpl(message);
				$('.chat-box').append(messageView);
			});
			var videoClass = 'yep-'+this.model.get('id');
			console.log(videoClass);
			var videoEl = document.getElementsByClassName(videoClass)[0];
			console.log(videoEl);
			videojs(videoEl, {}, function(){
			});
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
			this.showMarkers();
			//google.maps.event.addDomListener(window, 'load', Map.initialize);
		},
		render: function(){
			this.$el.html(this.tpl(App.Auth));
		},
		showMarkers: function(){	
			App.Map.populate(App.yepsCollection.getMapData());
		}
	});

	App.Views.NavbarView = Backbone.View.extend({
		tpl: _.template($("#navbar-tpl").html()),
		events:{
			'click .js-login': function(){
				$('#login-modal').modal();
			}
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl(App));
		}
	});
}(window.App));
