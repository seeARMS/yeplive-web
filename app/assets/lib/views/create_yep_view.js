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

	function($, _, Backbone, nope, swal, API, previewTpl, recordingTpl, socket, user, chatMessageTpl, videoOverlayTpl, completeTpl, getAppTpl){


	var CreateYepView = Backbone.View.extend({
		events:{
			'click .js-start': function(){
				var self = this;
				var pos = user.getLocation();
				var description = $('#description').val();
				var latitude = user.user.get('latitude');
				var longitude = user.user.get('longitude');

				API.post('/yeps',{
					title: description,
					latitude: latitude,
					longitude: longitude 
				}, window.localStorage.getItem('token'), function(err, res){
					if(err){
						return swal("Warning", "Something is wrong", "warning");
					}
					self.renderRecorder(res);	
					setTimeout(function(){
						API.post('/thumbnail/'+res.id,{},window.localStorage.getItem('token'), function(err, tres){
							console.log(tres);
						});
					},5000);
				});
			}
		},
		previewTpl: _.template(previewTpl),
		recordingTpl: _.template(recordingTpl),
		completeTpl: _.template(completeTpl),
		getAppTpl: _.template(getAppTpl),
		initialize: function(){
			if(this.isMobile()){
				this.$el.html(this.getAppTpl());
				return;
			}
			this.renderPreview();
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
		renderPreview: function(){	
			this.$el.html(this.previewTpl());
			user.setLocation(function(err, res){
				if(res){
					$('.js-start').attr('disabled',false);
				}
			});
			setupHDFVR('livestream');
		},
		renderRecorder: function(res){
			var self = this;
			this.$el.html(this.recordingTpl(res));
			window.onRecordingStarted = function(){
				
				console.log(res.share_url);
				
			};
			window.onCamAccess = function(allowed, id){
				if(allowed && !$('.video-overlay-2').length){
					showOverlay();
					setupShare(res);
					setupSocket(res);	
					self.setupStop(res);
				}
			};
			window.onFlashReady = function(id){
				window.onbeforeunload = confirmOnPageExit;
				document.getElementById('VideoRecorder').record();
				console.log('nice');
			};
			setupHDFVR(res.stream_name);
		},
		renderComplete: function(res){
			this.$el.html(this.completeTpl(res));
		},
		setupStop: function(res){
			var id = res.id;
			var self = this;
			$('.js-stop').click(function(){	
				API.post('/yeps/'+id+'/complete',{},
					 window.localStorage.getItem('token'), function(err, body){
						$('#VideoRecorder')[0].stopVideo();
						self.renderComplete(body);
				});
			});
		}

		
	});

	var setupHDFVR = function(streamName){
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
			swfobject.embedSWF("/hdfvr/VideoRecorder.swf", "recorder", "640", "480", "10.3.0", "", flashvars, params, attributes);
		}else{
			// HTML Media Capture
		}
	};



	var setupSocket = function(data){
		
		var chatMessage = _.template(chatMessageTpl)
		var $chat = $('#chat');
		var $connections = $('#connections');
		var $votes = $('#votes');
		var $views = $('#views');

		/*
		var testMessage = {
			display_name: user.user.get('display_name'),
			picture_path: user.user.get('picture_path'),
			message: 'this is a pretty cool stream bro, I wish you all the best'
		};
		*/

		var message = false;

		var chatOffset = parseInt($chat.parent().css('bottom'));


		var addMessage = function(data){
			if(message){
				chatOffset+=80;
				$chat.parent().animate({
					'bottom': chatOffset+'px'
				},1000);
			} else {
				message = true;
			}
			var $el = $(chatMessage(data));
			$el.addClass('animated fadeIn');	
			setTimeout(function(){
				$el.removeClass('fadeIn');
				$el.addClass('fadeOut');
			}, 5000);
			$chat.append($el);
		};

		var room = {
			user_id: user.user.get('user_id'),
			yep_id: data.id,
			display_name: user.user.get('display_name'),
			picture_path: user.user.get('picture_path')
		};

		console.log(room);

		
		socket.emit('join_room', room);

		socket.on('chat:history', function(messages){
			console.log(messages);
		});

		socket.on('chat:message', function(message){
			console.log(message);
			addMessage(message);
		});

		socket.on('yep:connection', function(data){
			$connections.html(data.connection_count);	
		});

		socket.on('yep:vote', function(){
			$votes.html(data.vote_count);
		});

		socket.on('yep:view', function(){
			$views.html(data.view_count);
		});
	};

	function showOverlay(){
		$('div.recording-chat').append(videoOverlayTpl);
		$("#chat-input").bind("keypress", function(event) {
			if(event.which == 13) {
					event.preventDefault();
					socket.emit('message',{
						message: $('#chat-input').val(),
						user_id: user.user.get('user_id')
					});
					$('#chat-input').val('');
		    }
		});
	}

	var confirmOnPageExit = function (e) {
	    // If we haven't been passed the event get the window.event
	    e = e || window.event;
	    var message = 'Any text will block the navigation and display a prompt';
	    // For IE6-8 and Firefox prior to version 4
	    if (e) 
	    {
	        e.returnValue = message;
	    }
	    // For Chrome, Safari, IE8+ and Opera 12+
	    return message;
	};

	function setupShare(res){
		$('.js-share').html(res.share_url);
	}


	return CreateYepView;

});
