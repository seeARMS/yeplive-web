define(['jquery',
		'lib/helper',
		'asyncJS',
		'swal',
		'lib/user',
		'underscore',
		'backbone', 
		'lib/api',
		'gmap3',
		'text!lib/templates/map.html',
		'text!lib/templates/discover.html',
		'text!lib/templates/chat_message.html',
		'lib/map',
		'lib/collections/yeps',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'lib/socket',
		'lib/models/yep',
		'facebook'
		],

	function($, helper, async, Swal, User, _, Backbone, Api, gmap3, mapTpl, discoverTpl, messageTpl, googleMaps, yepsCollection, vj, vjm, vjh, socket, Yep, FB){

		var yepsCollection = new yepsCollection();

		var mapView;
		var messageUI = _.template(messageTpl);
		var discoverUI = _.template(discoverTpl);
		var mapMarkers;

		var markerClicked = function(marker, event, context){
			
			var self = this;

			// Lock the view
			viewLocker();

			var yepId = context.data;
			

			async.parallel({
				one: mapView.getYepInfo.bind(null, yepId)
				//two: mapView.getCommentInfo.bind(null, yepId) 
			}, function(err, results){
				/*if(err){
					console.log('error');
					return;
				}*/
				var data = {
					video : results['one'],
					//comments : results['two'],
					user : User.user.attributes,
					success : 1
				}
				mapView.renderDiscover(data);
				socketJoinRoom(data);
			});


			// Close Button is clicked
			addCloseDiscoverListener();

		};

		/*
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
		*/

		var markerMousedOver = function(marker, event, context){
		};

		var markerMousedOut = function(marker, event, context){
		};

		var clearExplorer = function(){
			if($('div.explore-container').is(':empty')){
				return;
			}
			else{
				$('div.explore-container').empty();
			}
		};

		var videoSort = function(a,b) {
			if (a.attributes.start_time < b.attributes.start_time){
				return 1;
			}
			if (a.attributes.start_time > b.attributes.start_time){
				return -1;
			}
			return 0;
		};


		var clusterClick = function(cluster, event, context){

			$('#map-canvas').gmap3('get').panTo(context.data.latLng);

			clearExplorer();

			var yepMarks = context.data.markers;

			var cluster = [];

			for(var i = 0; i < yepMarks.length; i++){
				var yep = yepsCollection.findWhere({ id : yepMarks[i].data });
				cluster.push(yep);
			}

			cluster.sort(videoSort);

			var content = '';

			for(var i = 0; i < cluster.length; i++){

				var yep = cluster[i].attributes;
				console.log(yep);
				var yepId = yep.id;
				var yepTitle = yep.title;
				var imagePath = yep.image_path;
				var displayName = yep.user.display_name;
				var views = yep.views;
				var vodEnable = yep.vod_enable;
				var startTime = yep.start_time;
				var currentTime = (new Date).getTime();
				var userImage = yep.user.picture_path;
				var isPortrait = yep.portrait === 1 ? true : false;
				var isFrontFacing = yep.front_facing === 1 ? true : false;
				var timeDiff = (currentTime / 1000) - startTime;
				var vidTime =  parseInt(yep.end_time) - parseInt(yep.start_time);
				var stars = yep.vote_count;
				var deletable;

				if (imagePath === ''){
					imagePath = '/img/video-thumbnail.png'
				}

				if (yepTitle === ''){
					yepTitle = 'Title'
				}

				if (displayName === ''){
					displayName = 'Andrew'
				}

				deletable = yep.user.user_id == User.user.attributes.user_id ? true : false


				content += '<div id="explorer-' + yepId + '" class="explorer-wrapper row"><a class="discover" href="#" id="' + yepId + '">';

				if(yep.vod_enable){
					content += '<div class="explorer-time">'+helper.videoDurationConverter(vidTime)+'</div>';
					} else {
					content += '<div class="explorer-time">Live</div>';
				}

				// Col 5
//					content += '<div class="explore-image-bg" style="background-image:url(\''+imagePath+'\');">';
//					content += '</div>';
				content += '<div class="col-xs-7 explorer-body-col">';

				if(isPortrait && ! isFrontFacing){
					content += '<div class="explore-image-container rotateCW" style="background-image:url(\''+imagePath+'\');">';
					content += '</div>';
				} else if (isPortrait && isFrontFacing){
					content += '<div class="explore-image-container rotate-front-facing" style="background-image:url(\''+imagePath+'\');">';
					content += '</div>';
				} else if (! isPortrait && ! isFrontFacing){
					content += '<div class="explore-image-container" style="background-image:url(\''+imagePath+'\');">';
					content += '</div>';
				} else {
					content += '<div class="explore-image-container" style="background-image:url(\''+imagePath+'\');">';
					content += '</div>';
				}

				// End of Col 5
				content += '</div>';

				// Col 7
				content += '<div class="col-xs-5 explorer-body-col">';

				content += '<div class="explorer-body">';

				content += '<div class="explorer-title">';

				content += helper.truncate(yepTitle,15) + '</div>';

				content += '<div class="row explorer-video-author-info" >';
				content += '<div class="col-xs-2" >';
				content += '<img src="'+userImage+'" class="explorer-user-image img-circle">';
				content += '</div>';
				content += '<div class="col-xs-8" >';
				content += '<div class="explorer-display-name">' + helper.truncate(displayName,15) + '</div>';
				content += '</div>';

				content += '</div>';

				content += '<div class="row"><div class="explorer-created-time col-xs-12">' + helper.timeElapsedCalculator(timeDiff) ;
				content += '<br /><div class="explorer-views">'+views + ' views</div>'
				content += '<div class="explorer-stars">' + stars + ' <i class="fa fa-star" ></i>';

				

				content += '</div>';

				content += '</div>';
				content += '</div>';
				content += '</div>';

				// End of Col 5
				content += '</div>';

				content += '</a>';

				if(deletable){
					content += '<i value="' + yepId + '" class="fa fa-trash-o fa-lg js-delete-video explorer-delete-video" data-toggle="tooltip" data-placement="left" title="Remove this video"></i>';
				}

				content += '</div><hr class="yep-hr" />';
				
			}

			var closeButton = '<div id="explorer-close" class="close">x</div>';

			$('div.explore-container').append(closeButton);
			$('div.explore-container').append(content);
			$('div.explore-container').addClass('explore-container-show');
			
			$('div#explorer-close').on('click', function(){
				$('div.explore-container').removeClass('explore-container-show');
			});

			$('[data-toggle="tooltip"]').tooltip();

			$('.js-delete-video').on('click', function(){
				var self = $(this);
				deleteYep(parseInt(self.attr('value')));
			});
		};


		var deleteYep = function(yepId){
			Swal({
				title: "Do you want to remove this video?",
				text: "You will not be able to recover once you remove it!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, delete it!",
				closeOnConfirm: false
				},function(){
					Api.delete('/yeps/' + yepId, {},
						window.localStorage.getItem('token'),
						function(err, res){
							if(err){
								return Swal("", "Oops something went wrong", "warning");;
							}
							if(res.success){
								return Swal("", "Your video has been deleted.", "success");
								updateExplorer('delete', yepId);
							}
							else{
								console.log(res);
								return Swal("", "Sorry, you are not allowed to delete this video", "error");
							}
						}
					);
					
				}
			);
		};

		var updateExplorer = function(action, yepId){
			if( action === 'delete' ){
				$('#explorer-' + yepId).remove();
			}
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

		var socketJoinRoom = function(data){

			var self = this;
			var user = data.user;
			var yep = data.video.yep;

			socket.emit('join_room', {
				user_id: user.user_id,
				display_name: user.display_name,
				yep_id: yep.id,
				picture_path: user.picture_path
			});

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
						height: 52,
						offset:{
							y: -72,
							x:-26 
						}
					},
					20: {
						content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
						width: 56,
						height: 55,
						offset:{
							y: -72,
							x:-26 
						}
					},
					50: {
						content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
						width: 66,
						height: 65,
						offset:{
							y: -82,
							x:-26 
						}
					}
				}
			}
		};

		var closeDiscoverView = function(){

			$('div.discover-body').remove();

			$('div#map-canvas').css('opacity', '1');
			$('div.explore-container').css('opacity', '1');

			socket.emit('client:leave', {});
			socket.emit('disconnect', socket);

		};

		var addCloseDiscoverListener = function(){

			$('#main').on('click', '.close-discover', function(){

				closeDiscoverView();

			});
		};

		var viewLocker = function(){
			$('div#map-canvas').css('opacity', '0.2');
			$('div.explore-container').css('opacity', '0.2');
			$('#main').append('<div class="discover-body"></div>');
			$('div#load-boy').append('<img class="loading" src="/img/loading.gif" />');
		};

		var loaderClose = function(){
			$('div#load-boy').empty();
			$('div#main').css('opacity', '1');
		}

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

					video_path = yep.stream_url;

					/*
					if(yep.vod_enable){
						video_path = yep.vod_path;
					}
					else{
						// Temp solution
						video_path = (yep.stream_url).replace('rtsp', 'rtmp');
					}


					var playback_type = (yep.vod_enable) ? 'video/mp4' : 'rtmp/mp4';*/

					// If Streaming from Apple Products, always use HLS
					var ua = navigator.userAgent.toLowerCase();
					if( navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("ipod") != -1 ){
						video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
						playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
					}
					else{
						if(yep.is_web){
							video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
							playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
						} else {
							video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
							playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
						}
					}
					
					

					

					
					/*

					video_path = '/232-1431392929.mp4';
					playback_type = 'video/mp4';

					*/
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

			/*
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
			},*/

			setupVideo: function(data){

				var videoEl = document.getElementById('playVideo');
				vj(videoEl, {}, function(){
					if(data.video.yep.vod_enable){
						if(! data.video.yep.portrait){
							if($(window).width() < 600){
								$('#playVideo_html5_api').css('left','0px');
								$('#playVideo_html5_api').css('top','0px');
							}
						}
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

						} else if (data.video.yep.portrait && data.video.yep.front_facing) {
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

						}
					} else {
						if(data.video.yep.portrait){
						if(! data.video.yep.front_facing){
						var width = $('#playVideo_flash_api').css('width');
						var height = $('#playVideo_flash_api').css('height');
						$('#playVideo_flash_api').css('width',height);
						$('#playVideo_flash_api').css('height',width);
						$('#playVideo_flash_api').css('top','-42px');
						$('#playVideo_flash_api').css('left','42px');
						$('#playVideo_flash_api').css(
 "-moz-transform","rotate(90deg)"
						).css(
  "-webkit-transform","rotate(90deg)"
						).css(
 "-o-transform","rotate(90deg)"
						).css(
 "-ms-transform","rotate(90deg)"
						).css(
  "transform","rotate(90deg)"
						);
					} else {
						var width = $('#playVideo_html5_api').css('width');
						var height = $('#playVideo_html5_api').css('height');
						$('#playVideo_html5_api').css('width',height);
						$('#playVideo_html5_api').css('height',width);
						$('#playVideo_html5_api').css('top','-42px');
						$('#playVideo_html5_api').css('left','42px');
						$('#playVideo_html5_api').css(
 "-moz-transform","rotate(270deg)"
						).css(
  "-webkit-transform","rotate(270deg)"
						).css(
 "-o-transform","rotate(270deg)"
						).css(
 "-ms-transform","rotate(270deg)"
						).css(
  "transform","rotate(270deg)"
						);


						var width = $('#playVideo_flash_api').css('width');
						var height = $('#playVideo_flash_api').css('height');
						$('#playVideo_flash_api').css('width',height);
						$('#playVideo_flash_api').css('height',width);
						$('#playVideo_flash_api').css('top','-42px');
						$('#playVideo_flash_api').css('left','42px');
						$('#playVideo_flash_api').css(
 "-moz-transform","rotate(270deg)"
						).css(
  "-webkit-transform","rotate(270deg)"
						).css(
 "-o-transform","rotate(270deg)"
						).css(
 "-ms-transform","rotate(270deg)"
						).css(
  "transform","rotate(270deg)"
						);

					}
					}
						}
				});
			},

			/*
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

				$('i.watch-vote').on('click', function(){
					Api.post('/yeps/' + data.video.yep.id + '/votes', {},
							window.localStorage.getItem('token'),
							function(err, res){

								if(err){
									console.log(err);
									return;
								}
								if(res.success){
									console.log(res);
								}
								else{
									console.log(res);
								}
							}
					);
				});
			},*/

			addViewCount: function(data){

				Api.post('/yeps/' + data.video.yep.id + '/views', {},
							window.localStorage.getItem('token'),
							function(err, res){

								if(err){
									console.log(err);
									return;
								}
								$('div.watch-view-count').html('<h5>'+res.views + ' views</h5>');
								return;
							}
				);
			},

			renderDiscover: function(data){

				console.log(data);

				var currentTime = (new Date).getTime()/1000;
				var timeDiff = currentTime - data.video.yep.start_time;

				data.timeElapsed = helper.timeElapsedCalculator(timeDiff);

				$('div.discover-body').append(discoverUI(data));
				/*
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
					videoAuthorDisplay += '<img class="discover-user-picture" src="' + authorPicture + '" />';
					videoAuthorDisplay += '<h1 class="text-center">' + authorDisplayName + '</h4></div><div class="col-xs-3"></div></div></div>';

				var videoInfo = '<div class="row discover-video-body"><div class="col-xs-4"></div><div class="col-xs-4">';
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
				*/

				// Deactivate Loading
				loaderClose();


				// Render Socket IO Messaging UI
				
				/*
				var messageBox = '<div class="container"><div class="row"><div class="col-xs-3" ></div><div class="col-xs-6" ><div class="discover-message-box"></div></div><div class="col-xs-3" ></div></div></div><br>'

				$('div.discover-body').append(messageBox);

				var messagingUI = '<div class="discover-container comment-area"><div class="col-xs-4"></div><div class="col-xs-4"><div class="row"><div class="col-xs-2 discover-comment-user-img-col">';
					messagingUI += '<img class="discover-comment-user-img" src="' + userPicture + '" /></div><div class="col-xs-10">';
					messagingUI += '<textarea class="form-control discover-user-comment-area" rows="1" placeholder="say something about this video"></textarea>';
					messagingUI += '</div></div><br><button class="btn btn-primary discover-user-comment-button">Send</button></div><div class="col-xs-3"></div></div><hr />';

				$('div.discover-body').append(messagingUI);
				*/

				$('[data-toggle="tooltip"]').tooltip();

				this.messagingListener(data);

				//this.addVoteListener(data);
				this.addViewCount(data);

				this.initFacebookShare(data.video.yep.id);
				this.initTwitterShare(data.video.yep.id, data.video.yep);
				this.initGoogleShare(data.video.yep.id);

				// Setting up VideoJS
				this.setupVideo(data);
				
			},

			messagingListener: function(data){

				var user = data.user;

				$("input.watch-chat-input").bind("keypress", function(event) {

					if(event.which == 13) {

						event.preventDefault();

						socket.emit('message', {
							message: $('input.watch-chat-input').val(),
							user_id: user.user_id
						});

						$('input.watch-chat-input').val('');

				    }

				});

				var starCount = 1;

				$('.js-vote').click(function(e){
					Api.post('/yeps/'+data.video.yep.id+'/votes',{}, window.localStorage.getItem('token'),
						function(err, res){
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

			decorateMessaging: function(messages){

				var $chat = $('#chat');

				// If from history
				if(messages.messages){

					messages.messages.forEach(function(val, index){
						var $el = $(messageUI(val));
						$chat.append($el);
					});

				}
				else if(messages.message){

					var $el = $(messageUI(messages));
					$chat.append($el);
				}

				$('div.watch-chat-box').animate({scrollTop: $('div.watch-chat-box')[0].scrollHeight },'slow');

				/*

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

				$('div.discover-message-box').append(newMessage);
				$('textarea.discover-user-comment-area').val('');
				$('div.discover-message-box').animate({scrollTop: $('div.discover-message-box')[0].scrollHeight },'slow');

				*/
			},

			

			registerSocketEvents: function(){

				var self = this;

				socket.on('server:error', function(data){
					console.log('Error');
				});

				socket.on('yep:connection', function(data){
					$('.connection-count').html(data.connection_count);
				});

				socket.on('chat:history', function(data){
					self.decorateMessaging(data);
				});

				socket.on('chat:message', function(data){
					self.decorateMessaging(data);
				});
		
				socket.on('yep:vote', function(data){
					$('.discover-vote-count').text(data.vote_count);
				});

				socket.on('yep:new', function(data){
					if(!data.hasOwnProperty('user')){
						return;
					}
					var newYep = {
						latLng : [data.latitude, data.longitude],
						data : data.id
					}
					mapMarkers.push(newYep);
					self.populate(mapMarkers);

					var yep = new Yep(data);
					yepsCollection.add(yep);
				});

			},

			discover: function(){

				var self = this;

				// Discover is clicked
				$('#main').on('click', 'a.discover', function(){

					// Lock the view
					viewLocker();

					var yepId = $(this).attr('id');
					
					async.parallel({
						one: self.getYepInfo.bind(null, yepId),
						//two: self.getCommentInfo.bind(null, yepId) 
					}, function(err, results){
						/*if(err){
							console.log('error');
							return;
						}*/
						var data = {
							video : results['one'],
							//comments : results['two'],
							user : User.user.attributes,
							success : 1
						}

						self.renderDiscover(data);

						// Join a socket room
						socketJoinRoom(data);
					});

				});

				// Close Button is clicked
				addCloseDiscoverListener();
			},

			render: function(){

				var self = this;

				self.$el.html(this.tpl());
				$('div#map-container').append('<div class="explore-container"></div>');

				yepsCollection.fetch().then(function(){
					mapMarkers = yepsCollection.getMapData();
					self.populate(mapMarkers);

					// Done loading, kill load boy
					loaderClose();
				});

				// Register Socket Events
				self.registerSocketEvents();

				// Launch Discovery
				self.discover();

				// Make clicking outside of discover view close the discover view
				$('#main').on('click', '.discover-body', function() {
					closeDiscoverView();
				});
				$('#main').on('click', '.yep-overlay', function(event){
					event.stopPropagation();
				});
			
			},

			initFacebookShare: function(yepId){

				FB.init({
					appId: '1577314819194083',
					version: 'v2.3'
				});

				$('#share-fb').on('click',function(){
					FB.ui({
						method: 'share',
						href: 'http://app.yeplive.com/watch/' + yepId,
						}, function(response){}
					);
				});
			},

			initTwitterShare: function(yepId, yep){

				$('#share-twitter').on('click',function(){

					var url = 'http://app.yeplive.com/watch/' + yepId;
					var text = yep.user.display_name + ' is live streaming "' + yep.title + '"';
					var via = 'yeplive';
					var related = 'yeplive';
					window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text +'&via=' + via + '&related=' + related, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
				});

			},

			initGoogleShare: function(yepId){

				$('#share-google').on('click',function(){
					var url = 'http://app.yeplive.com/watch/' + yepId;
					window.open('https://plus.google.com/share?url=' + url, '_blank', 'location=yes,height=280,width=520,scrollbars=yes,status=yes');
				});

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
