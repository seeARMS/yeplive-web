define(['jquery',
		'lib/helper',
		'asyncJS',
		'lib/user',
		'underscore',
		'backbone', 
		'lib/api',
		'gmap3',
		'text!lib/templates/map.html',
		'lib/map',
		'lib/collections/yeps',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'lib/socket',
		],

	function($, helper, async, User, _, Backbone, Api, gmap3, mapTpl, googleMaps, yepsCollection, vj, vjm, vjh, socket){

		var yepsCollection = new yepsCollection();

		var mapView;

		/*
		var markerContent = function(context){

			var yep = yepsCollection.find(function(currentYep){
				return currentYep.get('id') === context.data;
			});
			
			yep = yep.attributes;

			var yepId = yep.id;
			var yepTitle = yep.title;
			var imagePath = yep.image_path;
			var displayName = yep.user.display_name;
			var views = yep.views;
			var vodEnable = yep.vod_enable;
			var startTime = yep.start_time;
			var currentTime = (new Date).getTime();
			var timeDiff = (currentTime / 1000) - startTime;

			if (imagePath === ''){
				imagePath = '/img/video-thumbnail.png'
			}

			if (yepTitle === ''){
				yepTitle = 'Title'
			}

			if (displayName === ''){
				displayName = 'Andrew'
			}

			var content = '<div class="infoWindow">';
				content += '<div class="cluster-wrapper"><a class="discover" href="#" id="' + yepId + '">';
				content += '<img src="' + imagePath + '" class="cluster-Image">';
				content += '<div class="cluster-body">';
				content += '<div class="cluster-title"><strong>' + yepTitle + '</strong></div>';
				content += '<div class="cluster-display-name">' + displayName + '</div>';
				content += '<div class="cluster-views">Views: ' + views + '</div>';
				content += '</div>';
				content += '<div class="cluster-created-time">' + helper.timeElapsedCalculator(timeDiff) + '</div>';
				content += '</div></a><div>';

			return content;

		};*/		


		var markerClicked = function(marker, event, context){

			/*
			var infowindow = $(this).gmap3({get:{name:"infowindow"}});

			if(infowindow){
				infowindow.close();
			}

			$(this).gmap3({
				infowindow:{
					latLng: context.data.latLng,
					options:{
						content: markerContent(context)
					},
					events:{
						closeclick: function(infowindow){
							//
						}
					}
				}
			});*/
			
			console.log(MapView);

			var self = this;


			// Lock the view
			$('div#map-canvas').css('opacity', '0.2');
			$('div#main').append('<div class="discover-body"><img class="loading" src="/img/loading.gif" /></div>')

			var yepId = context.data;
			
			async.parallel({
				one: mapView.getYepInfo.bind(null, yepId),
				two: mapView.getCommentInfo.bind(null, yepId) 
			}, function(err, results){
				/*if(err){
					console.log('error');
					return;
				}*/
				var data = {
					video : results['one'],
					comments : results['two'],
					user : User.user.attributes,
					success : 1
				}
				mapView.renderDiscover(data);
			});


			// Close Button is clicked
			$('#main').on('click', 'i#discover-close', function(){

				$('div.discover-body').remove();

				$('div#map-canvas').css('opacity', '1');

			});


		};

		var clusterContent = function(context){

			var yepMarks = context.data.markers;

			var cluster = [];

			for(var i = 0; i < yepMarks.length; i++){
				var yep = yepsCollection.findWhere({ id : yepMarks[i].data });
				cluster.push(yep);
			}

			var content = '<div class="infoWindow">';

			for(var i = 0; i < cluster.length; i++){

				var yep = cluster[i].attributes;

				var yepId = yep.id;
				var yepTitle = yep.title;
				var imagePath = yep.image_path;
				var displayName = yep.user.display_name;
				var views = yep.views;
				var vodEnable = yep.vod_enable;
				var startTime = yep.start_time;
				var currentTime = (new Date).getTime();
				var timeDiff = (currentTime / 1000) - startTime;

				if (imagePath === ''){
					imagePath = '/img/video-thumbnail.png'
				}

				if (yepTitle === ''){
					yepTitle = 'Title'
				}

				if (displayName === ''){
					displayName = 'Andrew'
				}


				content += '<div class="cluster-wrapper"><a class="discover" href="#" id="' + yepId + '">';
				content += '<img src="' + imagePath + '" class="cluster-Image">';
				content += '<div class="cluster-body">';
				content += '<div class="cluster-title"><strong>' + yepTitle + '</strong></div>';
				content += '<div class="cluster-display-name">' + displayName + '</div>';
				content += '<div class="cluster-views">Views: ' + views + '</div>';
				content += '</div>';
				content += '<div class="cluster-created-time">' + helper.timeElapsedCalculator(timeDiff) + '</div>';
				content += '</div></a><hr />';

			}

			content += '</div>'
			return content;
		};

		var infoWindowOpen = function($this, marker, data){
			console.log(marker)
		};

		var markerMousedOver = function(marker, event, context){
		};

		var markerMousedOut = function(marker, event, context){
		};

		var clusterClick = function(cluster, event, context){

			var infowindow = $(this).gmap3({get:{name:"infowindow"}});

			if(infowindow){
				infowindow.close();
			}

			$(this).gmap3({
				infowindow:{
					latLng: context.data.latLng,
					options:{
						content: clusterContent(context)
					},
					events:{
						closeclick: function(infowindow){
							//
						}
					}
				}
			});
		};

		var options = {

			center: { lat: 35.397, lng: -40.644},
			zoom: 2,
			//disable street view
			streetViewControl: false,
			//disable map control changes
			mapTypeControl: false,
			//allow pan control + move to left_center
			panControl:true,
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			//allow zoom control + move to left_center
			zoomControl:true,
			zoomControlOptions:{
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.LEFT_CENTER
			}
		};

		var marker = function(data){
			return {
				values: data,
				options:{
					draggable: false,
					icon: 'img/map/yeplive-marker.png'
				},
				events:{
					click: markerClicked,
					mouseover: markerMousedOver,
					mouseout: markerMousedOut
				},
				cluster:{
					radius: 100,
					events:{ // events trigged by clusters 
						mouseover: function(overlay, event, context){
							//console.log(context);
							//$(cluster.main.getDOMElement()).css("border", "1px solid red");
						},
						mouseout: function(overlay, event, context){
							//$(cluster.main.getDOMElement()).css("border", "0px");
						},
						click: clusterClick
					},
					0: {
						content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
						width: 53,
						height: 52
					},
					20: {
						content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
						width: 56,
						height: 55
					},
					50: {
						content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
						width: 66,
						height: 65
					}
				}
			}
		};

		var MapView = Backbone.View.extend({

			tpl: _.template(mapTpl),

			initialize: function(){

				mapView = this;

				this.render();

				$('#map-canvas').gmap3({
					map:{
						options: options,
					},
					zoomControlOptions:{
						style: google.maps.ZoomControlStyle.LARGE,
						position: google.maps.ControlPosition.LEFT_CENTER
					},
					marker: marker
				});
				//App.Map.el = document.getElementById('map-canvas');
				//App.Map.$el = $('#map-canvas');
				//App.Map.initialize();
				//	this.showMarkers();
				//google.maps.event.addDomListener(window, 'load', Map.initialize);
			},

			getYepInfo: function(yepId, cb){

				Api.get('/yeps/' + yepId, function(err, yep){

					if( err ){
						var data = { success : 0 };
						cb(404, data)
					}
					
					var video_path;
					var playback_type;
					
					/*
					if(yep.is_web){
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_hls;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					} else {
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';
					}*/

					// If we get VOD, we directly stream from cloudfront
					// If we get LIVE, we stream using rtmp
					var thumbnail_path = yep.image_path;
					var video_path = '';

					if(yep.vod_enable){
						video_path = yep.vod_path;
					}
					else{
						// Temp solution
						video_path = (yep.stream_url).replace('rtsp', 'rtmp');
					}

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


			getCommentInfo: function(yepId, cb){

				Api.get('/comments/' + yepId, function(err, results){

					if( err ){
						var data = { success : 0 };
						return cb(404, data);
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

			setupVideo: function(){
				var videoEl = document.getElementById('playVideo');
				vj(videoEl, {}, function(){
					//console.log('VideoJS successfully loaded')
				});
			},


			addCommentListener: function(data){

				$('button.user-comment-button').on('click', function(){

						var comment = $('textarea.user-comment-area').val();
						var user = User.user.attributes;
						var created_time = Math.ceil((new Date).getTime()/1000)

						Api.post('/comments/' + data.video.yep.id, 
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
										// Old comments to assigned old comments class
										//$('div.new-comment').find('*').attr('class', 'row comments old-comment');

										var newComment = '<div class="row comments new-comment">';
										newComment += '<div class="col-xs-4"></div><div class="col-xs-4">';
										newComment += '<img class="commenter-picture" src="' + user.picture_path + '" />';
										newComment += '<div>' + user.display_name + '<i> Just Now</i></div>';
										newComment += '<div>' + comment + '</div>';
										newComment += '</div><div class="col-xs-4"></div></div><hr />';

										$('div.comment-container').prepend(newComment);
										
										// Scroll to that new comment
										$('html,body').animate({scrollTop: $('div.new-comment').offset().bottom},'slow');
										$('div.comment-area').html('<h3 class="text-center">Thank you!</h3>');
									}
						);
				});
			},

			addVoteListener: function(data){

				var currentVotes = data.video.yep.vote_count;

				$('i.watch-vote').on('click', function(){
					Api.post('/yeps/' + data.video.yep.id + '/votes', {},
							window.localStorage.getItem('token'),
							function(err, res){

								if(err){
									console.log(err);
									return;
								}
								if(res.vote){
									$('i.watch-vote').attr('class', 'fa fa-thumbs-up fa-2x watch-vote');
									$('i.watch-vote').html(' ' + (res.vote + currentVotes).toString());
									currentVotes++;
								}
								else{
									$('i.watch-vote').attr('class', 'fa fa-thumbs-o-up fa-2x watch-vote');
									$('i.watch-vote').html(' ' + (currentVotes - 1).toString());
									currentVotes--;
								}
							}
					);
				});
			},

			addViewCount: function(data){

				Api.post('/yeps/' + data.video.yep.id + '/views', {},
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

			renderDiscover: function(data){

				var videoPath = data.video.video_path;
				var playbackType = data.video.playback_type;
				var authorPicture = data.video.yep.user.picture_path;
				var authorDisplayName = data.video.yep.user.display_name;
				var videoTitle = data.video.yep.title;
				var videoDescription = data.video.yep.description;
				var videoViews = data.video.yep.views;
				var voted = data.video.yep.voted;
				var votedCount = data.video.yep.vote_count;
				var tagsArray = data.video.yep.tags;

				var userPicture = data.user.picture_path;
				var commentArray = data.comments;
				
				var videoWrapper = '<div class="video-wrapper"><i id="discover-close" class="fa fa-times-circle fa-3x"></i><div class="video-content"><video id="playVideo" class="video-js vjs-default-skin" controls preload="auto" width="584" height="268" data-setup="{}">';
					videoWrapper += '<source src="' + videoPath + '" type="' + playbackType + '"></video></div></div>';
				
				var videoAuthorDisplay = '<div class="container"><div class="row watch-user-info"><div class="col-xs-3"></div><div class="col-xs-6">';
					videoAuthorDisplay += '<img class="user-picture" src="' + authorPicture + '" />';
					videoAuthorDisplay += '<h1>' + authorDisplayName + '</h4></div><div class="col-xs-3"></div></div></div>';

				var videoInfo = '<div class="row"><div class="col-xs-4"></div><div class="col-xs-4">';
					videoInfo += '<h2>'+ videoTitle + '</h2>';
					videoInfo += '<h4>Description: ' + videoDescription + '</h4>';
					videoInfo += '<div class="watch-view-count" ><i class="fa fa-eye fa-2x" > ' + videoViews + '</i></div><p></p>'
				
				if(voted){
					videoInfo += '<i class="fa fa-thumbs-up fa-2x watch-vote"> ' + votedCount + '</i>';
				}
				else{
					videoInfo += '<i class="fa fa-thumbs-o-up fa-2x watch-vote"> ' + votedCount + '</i>';
				}

				var videoTag = '';

				tagsArray.forEach(function(val, index, array){
					videoTag += '#' + val;
				});

					videoInfo += '<p></p><i class="fa fa-tags fa-2x" > ' + videoTag + '</i></div><div class="col-xs-4"></div></div><hr />';

				
				$('div.discover-body').append(videoWrapper);
				$('div.discover-body').append(videoAuthorDisplay);
				$('div.discover-body').append(videoInfo);

				// Deactivate Loading
				$('img.loading').remove();

				// Render Comments

				// Temp disable Comments at the moment
				/*
				var commentUI = '<div class="container comment-area"><div class="col-xs-3"></div><div class="col-xs-6"><div class="row"><div class="col-xs-2">';
					commentUI += '<img src="' + userPicture + '" /></div><div class="col-xs-10">';
					commentUI += '<textarea class="form-control user-comment-area" rows="3" placeholder="say something about this video"></textarea>';
					commentUI += '</div></div><br><button class="btn btn-primary user-comment-button">Send</button></div><div class="col-xs-3"></div></div><hr />';

				var comments = '<div class="comment-container container">';

				commentArray.forEach(function(val, index, array){
					comments += '<div class="row comments">';
					comments += '<div class="col-xs-4"></div>';
					comments += '<div class="col-xs-4"><img class="commenter-picture" src="' + val.picture_path + '" />';
					comments += '<div>' + val.display_name + ' <i>' + val.created_at + '</i></div>';
					comments += '<div>' + val.comment + '</div></div><div class="col-xs-4"></div></div><hr />';
				});

					comments += '</div>';

				$('div.discover-body').append(commentUI);
				$('div.discover-body').append(comments);

				this.addCommentListener(data);
				*/

				// Render Socket IO Messaging UI
				var messageBox = '<div class="container"><div class="row"><div class="col-xs-3" ></div><div class="col-xs-6" ><div class="message-box"></div></div><div class="col-xs-3" ></div></div></div><br>'

				$('div.discover-body').append(messageBox);

				var messagingUI = '<div class="container comment-area"><div class="col-xs-3"></div><div class="col-xs-6"><div class="row"><div class="col-xs-2">';
					messagingUI += '<img src="' + userPicture + '" /></div><div class="col-xs-10">';
					messagingUI += '<textarea class="form-control user-comment-area" rows="1" placeholder="say something about this video"></textarea>';
					messagingUI += '</div></div><br><button class="btn btn-primary user-comment-button">Send</button></div><div class="col-xs-3"></div></div><hr />';

				$('div.discover-body').append(messagingUI);
				this.messagingListener(data);


				this.addVoteListener(data);
				this.addViewCount(data);

				// Setting up VideoJS
				this.setupVideo();
				
			},

			messagingListener: function(data){

				var user = data.user;
				var yep = data.video.yep;

				$('button.user-comment-button').on('click', function(){

					var message = $('textarea.user-comment-area').val();

					socket.emit('message', {
						message: message,
						user_id: user.user_id
					});

				});

			},

			decorateMessaging: function(messages){

				console.log(messages);

				var newMessage = '';

				// If loading history
				if(messages.messages){
					messages.messages.forEach(function(val, index){
						newMessage += '<div class="new-message" >'
						newMessage += '<img class="message-box-user-picture" src="' + val.picture_path + '" /> ';
						newMessage += '<span class="message-box-message-owner"> ' + val.display_name + ': </span>';
						newMessage += '<div class="message-box-messsage">' + val.message + '</div>';
						newMessage += '</div><br>'
					});
				}
				else if(messages.message){
					var displayName = messages.display_name;
					var message = messages.message;
					var picturePath = messages.picture_path;

					newMessage += '<div class="new-message" >';
					newMessage += '<img class="message-box-user-picture" src="' + picturePath + '" /> ';
					newMessage += '<span class="message-box-message-owner"> ' + displayName + ': </span>';
					newMessage += '<div class="message-box-messsage">' + message + '</div>';
					newMessage += '</div><br>'
				}

				$('div.message-box').append(newMessage);
				$('textarea.user-comment-area').val('');
				$('div.message-box').animate({scrollTop: $('div.message-box')[0].scrollHeight },'slow');
			},

			socketIO: function(data){

				var self = this;
				var user = data.user;
				var yep = data.video.yep;

				socket.emit('join_room', {
					user_id: user.user_id,
					display_name: user.display_name,
					yep_id: yep.id,
					picture_path: user.picture_path
				});

				socket.on('server:error', function(data){
					console.log('Error');
					console.log(data);
				});

				socket.on('yep:connection', function(data){
					console.log('Connection');
					console.log(data);
				});

				socket.on('chat:history', function(data){
					console.log('history');
					self.decorateMessaging(data);
				});

				socket.on('chat:message', function(data){
					console.log('New message');
					self.decorateMessaging(data);
				});
			},

			discover: function(){

				var self = this;

				// Discover is clicked
				$('#main').on('click', 'a.discover', function(){

					// Lock the view
					$('div#map-canvas').css('opacity', '0.2');
					$('div#main').append('<div class="discover-body"><img class="loading" src="/img/loading.gif" /></div>')

					var yepId = $(this).attr('id');
					
					async.parallel({
						one: self.getYepInfo.bind(null, yepId),
						two: self.getCommentInfo.bind(null, yepId) 
					}, function(err, results){
						/*if(err){
							console.log('error');
							return;
						}*/
						var data = {
							video : results['one'],
							comments : results['two'],
							user : User.user.attributes,
							success : 1
						}

						self.renderDiscover(data);

						// Set up SocketIO
						self.socketIO(data);
					});

				});

				// Close Button is clicked
				$('#main').on('click', 'i#discover-close', function(){

					$('div.discover-body').remove();

					$('div#map-canvas').css('opacity', '1');

					socket.emit('leave_room', {});

					socket.emit('disconnection', socket);
				});
			},

			render: function(){

				var self = this;

				self.$el.html(this.tpl());
				yepsCollection.fetch().then(function(){
					self.populate(yepsCollection.getMapData());
				});

				self.discover();
			},
			populate: function(data){
				$('#map-canvas').gmap3('clear', 'markers');
				$('#map-canvas').gmap3({
					marker: marker(data)
				});
			}
		});

		return MapView;
});
