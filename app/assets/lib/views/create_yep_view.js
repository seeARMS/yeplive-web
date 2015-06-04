define(['jquery',
		'underscore',
		'backbone',
		'swfobject',
		'swal',
		'lib/api',
		'text!lib/templates/yep_preview.html',
		'text!lib/templates/yep_recording.html',
		'lib/socket',
		'lib/user',
		'text!lib/templates/chat_message.html',
		'text!lib/templates/video_overlay.html',
		'text!lib/templates/yep_complete.html',
		'text!lib/templates/get_app.html'
		],

	function($, _, Backbone, nope, Swal, Api, previewTpl, recordingTpl, socket, User, chatMessageTpl, videoOverlayTpl, completeTpl, getAppTpl){

	var recording = false;

	var CreateYepView = Backbone.View.extend({
		/*
		events:{
			'click .js-start': function(){
				var self = this;
				var pos = User.getLocation();
				var title = $('#title').val();
				var latitude = User.user.get('latitude');
				var longitude = User.user.get('longitude');

				Api.post('/yeps',{
					staging: 0,
					title: title,
					latitude: latitude,
					longitude: longitude 
				}, window.localStorage.getItem('token'), function(err, res){
					if(err){
						return Swal("", "Something is wrong", "warning");
					}
					res.title = title;
					self.renderRecorder(res);	
					setTimeout(function(){
						Api.post('/thumbnail/'+res.id,{},window.localStorage.getItem('token'), function(err, tres){
						});
					},5000);
				});
			}
		},*/

		previewTpl: _.template(previewTpl),
		recordingTpl: _.template(recordingTpl),
		completeTpl: _.template(completeTpl),
		getAppTpl: _.template(getAppTpl),
		chatTpl: _.template(videoOverlayTpl),

		initialize: function(){
			if(this.isMobile()){
				this.$el.html(this.getAppTpl());
				return;
			}
			this.setUserLocation();
			this.$el.html(this.recordingTpl());
			this.showOverlay();
			this.renderRecorder();
			setupHDFVR('test', false);
			$('[data-toggle="tooltip"]').tooltip();
		},

		isMobile: function(){
			var ua = navigator.userAgent.toLowerCase();
			if(navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("android") != -1 || ua.indexOf("ipod") != -1 || ua.indexOf("windows ce") != -1 || ua.indexOf("windows phone") != -1){
				return true;
			}
			return false;
		},

		close: function(){
			socket.emit('leave_room');
			window.onbeforeunload = false;
		},

		setUserLocation: function(){
			Swal({ 	title: "",
					text: "Getting Your Location...",
					imageUrl: "img/geo-location-loader.gif",
					showConfirmButton: false });

			User.setLocation(function(err, res){

				if(err){
					//Do something
				}

				Swal.close();
			}, true);
		},

		showOverlay: function(){

			var self = this;

			var obj = {
				display_name : User.user.get('display_name')
			}

			$('div.recording-chat').append(this.chatTpl(obj));

			$('.record-title-input').focus();
			
			// Register Chat Listener
			$(".record-chat-input").bind("keypress", function(event) {
				if(event.which == 13) {
					event.preventDefault();
					socket.emit('message',{
						message: $('.record-chat-input').val(),
						user_id: User.user.get('user_id')
					});
					$('.record-chat-input').val('');
			    }
			});
			

			// When Recording Begins
			$('#js-record').on('click', function(){

				var pos = User.getLocation();
				var title = $('.record-title-input').val() == '' ? User.user.get('display_name') + "'s Yep" : $('.record-title-input').val();
				var latitude = User.user.get('latitude');
				var longitude = User.user.get('longitude');

				Api.post('/yeps',{
					staging: 0,
					title: title,
					latitude: latitude,
					longitude: longitude 
				}, window.localStorage.getItem('token'), function(err, res){

					if(err){
						return Swal("", "Something is wrong", "warning");
					}

					$('.js-title').html(title);
					$('.control-button').html('<button id="js-stop" class="btn btn-default record-control-button" data-toggle="tooltip" data-placement="top" title="Stop Recording"><i class="fa fa-stop fa-2x"></i></button>');
					$('.video-recorder').html('<div id="recorder"></div>');
					$('.record-chat-input').prop('disabled', false);

					setupHDFVR(res.stream_name, true);

					initFacebookShare(res);
					initTwitterShare(res);
					initGoogleShare(res);

					setupSocket(res);	
					self.setupStop(res);

					setTimeout(function(){
						Api.post('/thumbnail/' + res.id, {}, window.localStorage.getItem('token'), function(err, tres){});
					},5000);
				});
			});

		},

		renderRecorder: function(){

			var self = this;

			//this.$el.html(this.recordingTpl(res));

			window.onRecordingStarted = function(){
				
			};

			window.onCamAccess = function(allowed, id){
				// If user clicked allowed, and also the templates have not been appended
				// Because user may click allow and click disallow again
				if(allowed){
					$('#js-record').removeClass('disabled')
					//self.showOverlay(res);

					

					//$('.js-title').html(res.title);


					//$('.control-button').html('<button id="js-stop" class="btn btn-default" data-toggle="tooltip" data-placement="bottom" title="Stop Recording"><i class="fa fa-stop"></i></button>');
					

					//$('#js-record i').attr('class', 'fa fa-stop');
					//$('#js-record').attr('id', 'js-stop');

					
				}
				else{
					$('#js-record').addClass('disabled');
				}
			};

			window.onFlashReady = function(id){
				window.onbeforeunload = confirmOnPageExit;
			};
			
		},

		renderComplete: function(res){
			this.$el.html(this.chatTpl(res));
		},

		setupStop: function(res){
			var id = res.id;
			var self = this;
			$('#js-stop').click(function(){	
				Api.post('/yeps/'+id+'/complete',{},
					 window.localStorage.getItem('token'), function(err, body){
						$('#VideoRecorder')[0].stopVideo();
						socket.emit('leave_room');
						window.onbeforeunload = false;
						window.location.href = '/';	
				});
			});
		}

		
	});

	var setupHDFVR = function(streamName, record){

		var flashvars = {
			userId : "XXY",
			qualityurl: "audio_video_quality_profiles/640x480x30x90.xml",
			recorderId: streamName,
			sscode: "php",
			lstext : "Loading..."	
		};
		var params = {
			quality : "high",
			bgcolor : "#18191a",
			play : "true",
			loop : "false",
			allowscriptaccess: "sameDomain"
		};
		var attributes = {
			name : "VideoRecorder",
			id :   "VideoRecorder",
			align : "middle"
		};
		
		var mobile = false;
		var ua = navigator.userAgent.toLowerCase();

		if(navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("android") != -1 || ua.indexOf("ipod") != -1 || ua.indexOf("windows ce") != -1 || ua.indexOf("windows phone") != -1){
			mobile = true;
		}

		if(mobile == false){
			swfobject.embedSWF("/hdfvr/VideoRecorder.swf", "recorder", "640", "480", "10.3.0", "", flashvars, params, attributes, function(e){
				if(e.success && record){
					var recorder = document.getElementById('VideoRecorder');
					turnOnRecord(recorder);
				}
				else{

				}
			});
		}
		else{
			// HTML Media Capture
		}
		
	};


	var turnOnRecord = function(recorder){
		if(typeof recorder.record === 'undefined'){
			setTimeout(function(){
				turnOnRecord(recorder);
			},500);
		}
		else{
			recorder.record();
		}
	};

	var setupSocket = function(data){
		
		var chatMessage = _.template(chatMessageTpl)
		var $chat = $('#chat');
		var $connections = $('#connections');
		var $votes = $('#votes');
		var $views = $('#views');

		var message = false;

		var chatOffset = parseInt($chat.parent().css('bottom'));


		var addMessage = function(message){

			var $el = $(chatMessage(message));
			$chat.append($el);
			$('div.record-chat-box').animate({scrollTop: $('div.record-chat-box')[0].scrollHeight },'slow');

		};

		var appendConnectionUsers = function(users){
			console.log(users);
			var connectionUsers = '';

			for(var i = 0; i < users.length; i++){
				var user = users[i];
				// Skip if it is either a guest or author
				if(user.user_id === -1 || user.user_id === User.user.get('user_id') ){
					continue;
				}
				connectionUsers += '<a href="/' + user.display_name + '" class="connection-user-link" target="_blank" data-toggle="tooltip" data-placement="bottom" title="' + user.display_name + '" ><img class="connection-user-picture" src="' + user.picture_path + '" /></a>';
			}

			$('.connection-users').html(connectionUsers);

			$('[data-toggle="tooltip"]').tooltip();
		};

		var room = {
			user_id: User.user.get('user_id'),
			yep_id: data.id,
			display_name: User.user.get('display_name'),
			picture_path: User.user.get('picture_path'),
			version: 1
		};

		socket.emit('join_room', room);

		socket.on('chat:history', function(messages){
		});

		socket.on('chat:message', function(message){;
			addMessage(message);
		});

		socket.on('chat:users', function(users){
			appendConnectionUsers(users.users);
		});

		socket.on('yep:connection', function(data){
			$connections.html(data.connection_count);
		});

		socket.on('yep:disconnection', function(data){
			$connections.html(data.connection_count);
		});

		socket.on('yep:vote', function(data){
			$votes.html(data.vote_count);
		});

		socket.on('yep:view', function(){
			$views.html(data.view_count);
		});
	};


	var confirmOnPageExit = function (e) {
	    // If we haven't been passed the event get the window.event
	    e = e || window.event;
	    var message = 'You are currently streaming, are you sure you want to leave?';
	    // For IE6-8 and Firefox prior to version 4
	    if (e) 
	    {
	        e.returnValue = message;
	    }
	    // For Chrome, Safari, IE8+ and Opera 12+
	    return message;
	};


	var initFacebookShare = function(yep){

		FB.init({
			appId: '1577314819194083',
			version: 'v2.3'
		});

		$('#share-fb').on('click',function(){
			FB.ui({
				method: 'share',
				href: yep.share_url
				}, function(response){}
			);
		});
	};

	var initTwitterShare = function(yep){

		$('#share-twitter').on('click',function(){

			var url = yep.share_url;
			var text = 'Check out my live-stream';
			var via = 'yeplive';
			var related = 'yeplive';
			window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text +'&via=' + via + '&related=' + related, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
		});

	};

	var initGoogleShare = function(yep){

		$('#share-google').on('click',function(){
			var url = yep.share_url;
			window.open('https://plus.google.com/share?url=' + url, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
		});

	};

	function setupShare(res){
		$('.js-share').html(res.share_url);
	}


	return CreateYepView;

});
