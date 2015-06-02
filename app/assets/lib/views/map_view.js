define(['jquery',
		'lib/helper',
		'asyncJS',
		'swal',
		'lib/user',
		'underscore',
		'backbone', 
		'lib/api',
		'gmap3',
		'markerWithLabel',
		'text!lib/templates/map.html',
		'text!lib/templates/discover.html',
		'text!lib/templates/chat_message.html',
		'text!lib/templates/explorer.html',
		'lib/map',
		'lib/collections/yeps',
		'videojs',
		'videojsMedia',
		'videojsHLS',
		'lib/socket',
		'lib/models/yep',
		'facebook'
		],

	function($, helper, async, Swal, User, _, Backbone, Api, gmap3, markerWithLabel, mapTpl, discoverTpl, messageTpl, explorerTpl, googleMap, yepsCollection, vj, vjm, vjh, socket, Yep, FB){

		var yepsCollection = new yepsCollection();

		var mapView;
		var messageUI = _.template(messageTpl);
		var discoverUI = _.template(discoverTpl);
		var explorerUI = _.template(explorerTpl);
		var mapMarkers;
		var mapMarkersLive;

		var markerClicked = function(marker, event, context){
			
			var thisMarker = context;
			var context = {};
			context.data = {};
			context.data.markers = [ thisMarker ];
			context.data.latLng = marker.position;
			clusterClick({}, {}, context);
		};

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

			var $explorer = $('div.explore-container');
			$explorer.append('<div id="explorer-close" class="close">x</div>');

			for(var i = 0; i < cluster.length; i++){

				var yep = cluster[i].attributes;

				var isPortrait = yep.portrait === 1 ? true : false;
				var isFrontFacing = yep.front_facing === 1 ? true : false;
				var yepPositionClass;
				var yepOverlayClass;
				if(isPortrait && ! isFrontFacing){
					yepPositionClass = 'rotateCW';
					yepOverlayClass = 'overlay-portrait';
				} 
				else if (isPortrait && isFrontFacing){
					yepPositionClass = 'rotate-front-facing';
					yepOverlayClass = 'overlay-portrait-front-facing';
				}
				else {
					yepPositionClass = '';
					yepOverlayClass = 'overlay-landscape';
				}

				var yepImagePath = yep.image_path === '' ? '/img/video-thumbnail.png' : yep.image_path
				var yepTimeElapsed = helper.timeElapsedCalculator(((new Date).getTime() / 1000) - yep.start_time);
				var yepDuration = yep.vod_enable ? helper.videoDurationConverter(parseInt(yep.end_time) - parseInt(yep.start_time)) : 'Live';
				var yepShortTitle = helper.truncate(yep.title, 15);
				var yepOwnerName = helper.truncate(yep.user.display_name, 15);
				var yepControllable = yep.user.user_id == User.user.attributes.user_id ? true : false;

				var explorerData = {
					yepId : yep.id,
					yepShortTitle : yepShortTitle,
					yepTitle : yep.title,
					yepDuration : yepDuration,
					yepPositionClass : yepPositionClass,
					yepImagePath : yepImagePath,
					yepOwnerPicture : yep.user.picture_path,
					yepOwnerName : yepOwnerName,
					yepTimeElapsed : yepTimeElapsed,
					yepViews : yep.views,
					yepStars : yep.vote_count,
					yepControllable : yepControllable,
					yepOverlayClass : yepOverlayClass
				}

				$explorer.append(explorerUI(explorerData));
			}


			$explorer.addClass('explore-container-show');
			
			$('div#explorer-close').on('click', function(){
				$('div.explore-container').removeClass('explore-container-show');
			});

			$('[data-toggle="tooltip"]').tooltip();

			registerUserControl();
		};

		var registerUserControl = function(){

			$('.js-delete-video').on('click', function(){
				var self = $(this);
				deleteYep(parseInt(self.attr('value')));
			});

			$('.js-edit-video').on('click', function(){
				var self = $(this);
				editYep(parseInt(self.attr('id')), self.attr('value'));
			});

		};

		var deleteYep = function(yepId){
			Swal({
				title: "Do you want to remove this yep?",
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
								return Swal("", "Oops something went wrong", "warning");
							}
							if(res.success){
								Swal("", "Your yep has been deleted.", "success");
								updateExplorer('delete', yepId);
								updateDiscover('delete', yepId);
								return;
							}
							else{
								return Swal("", "Sorry, you are not allowed to delete this yep", "error");
							}
						}
					);
					
				}
			);
		};

		var editYep = function(yepId, yepTitle){
			Swal({
				title: "Enter a new title for your yep",
				text: "Write something interesting with hashtag tags:",
				type: "input",
				inputValue: yepTitle,
				showCancelButton: true,
				closeOnConfirm: false
				}, function(inputValue){
					if (inputValue === false){
						return false;
					}      
					if (inputValue === ""){
						swal.showInputError("Title can not be empty");
						return false;
					}
					if (inputValue === yepTitle){
						swal.showInputError("Title is the same as the old one");
						return false;
					}
					Api.put('/yeps/' + yepId,
						{ title: inputValue },
						window.localStorage.getItem('token'),
						function(err, res){
							if(err){
								return Swal("", "Oops something went wrong", "warning");
							}
							if(res.success){
								Swal("Nice!", "Your yep title has been changed" ,"success");
								updateDiscover('changeTitle', yepId, { title: inputValue });
								updateExplorer('changeTitle', yepId, { title: inputValue });
								return;
							}
							else{
								return Swal("", "Sorry, you are not allowed to edit this yep", "error");
							}
						}
					);
				}
			);
		};

		var updateDiscover = function(action, yepId, options){

			if(!$('.discover-body').length){
				return;
			}

			if( action === 'changeTitle' ){
				$('#discover-yep-title').html(options.title);
				$('.discover-edit-video').attr('value', options.title);
			}
			
			if( action === 'delete'){
				closeDiscoverView();
			}
		};

		var updateExplorer = function(action, yepId, options){
			if( action === 'delete' ){
				// Remove UI
				$('#explorer-' + yepId).remove();
				// Revmoe from collection OBJ
				yepsCollection.remove({ id: yepId });
				// Re-populate map view
				for(var i = 0; i < mapMarkers.length; i++){
					if(mapMarkers[i].data === yepId){
						mapMarkers.splice(i, 1);
						break;
					}
				}
				populateMapView(mapMarkers);
			}
			if( action === 'changeTitle'){
				// Change Explorer UI
				$('#explorer-' + yepId + ' .explorer-title').html(options.title);
				$('#explorer-' + yepId + ' .js-edit-video').attr('value', options.title);
			}
		};

		var populateMapView = function(data){
			$('#map-canvas').gmap3('clear', 'markers');
			$('#map-canvas').gmap3({
				marker: marker(data)
			});

			/*
			setTimeout(function(){
				$('#map-canvas').gmap3({
					marker: marker2(data.splice(0,10))
				});
			},5000)*/
		};

		var options = {

			center: { lat: 35.397, lng: -40.644},
			zoom: 2,
			//disable street view
			streetViewControl: false,
			//disable map control changes
			mapTypeControl: false,
			//allow pan control + move to left_center
			panControl:false,
			panControlOptions: {
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			//allow zoom control + move to left_center
			zoomControl:false,
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
				picture_path: user.picture_path,
				version: 1
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
					radius: 20,
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
						content: "<div class='cluster cluster-vod'>CLUSTER_COUNT</div>",
						width: 53,
						height: 52,
						offset:{
							y: -72,
							x:-26 
						}
					}
				}
			};
		};


		var marker2 = function(data){
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
					radius: 20,
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
						content: "<div class='cluster cluster-live'>CLUSTER_COUNT</div>",
						width: 53,
						height: 52,
						offset:{
							y: -72,
							x:-26 
						}
					}
				}
			};
		};


		var closeDiscoverView = function(){

			if(!('div.discover-body').length){
				return;
			}

			$('div.discover-body').remove();

			$('div#map-canvas').css('opacity', '1');
			$('div.explore-container').css('opacity', '1');
			$('div.map-controller').css('opacity', '1');

			socket.emit('leave_room', {});

		};

		var addCloseDiscoverListener = function(){

			$('#main').on('click', '.close-discover', function(){

				closeDiscoverView();

			});
		};

		var viewLocker = function(){
			$('div#map-canvas').css('opacity', '0.2');
			$('div.explore-container').css('opacity', '0.2');
			$('div.map-controller').css('opacity', '0.2');
			$('#main').append('<div class="discover-body"></div>');
			$('div#load-boy').append('<img class="loading" src="/img/loading.gif" />');
		};

		var loaderClose = function(){
			$('div#load-boy').empty();
			$('div#main').css('opacity', '1');
		};


		var createUserMarker = function(lat, lng){

			var userLatLng = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));

			var userMarker = new MarkerWithLabel({

				position: userLatLng,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 0, //tamaño 0
				},
				map: $('#map-canvas').gmap3('get'),
				draggable: false,
				labelAnchor: new google.maps.Point(10, 10),
				labelClass: "markerLabel",

			});

			// Register marker controller
			$('.map-user-focus').on('click', function(){
				
				$('#map-canvas').gmap3('get').panTo(userMarker.getPosition());
				smoothZoomIn($('#map-canvas').gmap3('get'), 12, $('#map-canvas').gmap3('get').getZoom());

			});

			$('.map-user-unfocus').on('click', function(){
				$('#map-canvas').gmap3('get').panTo(userMarker.getPosition());
				smoothZoomOut($('#map-canvas').gmap3('get'), 2, $('#map-canvas').gmap3('get').getZoom());
			});
		

		};

		var appendConnectionUsers = function(users){

			var connectionUsers = '';

			for(var i = 0; i < users.length; i++){
				var user = users[i];
				// Skip if it is either a guest or author
				if(user.user_id === -1){
					continue;
				}
				connectionUsers += '<a href="/' + user.display_name + '" class="connection-user-link" target="_blank" data-toggle="tooltip" data-placement="bottom" title="' + user.display_name + '" ><div class="connection-user-picture" style="background-image:url(' + user.picture_path + ');" /></div></a>';
			}

			$('.connection-users').html(connectionUsers);

			$('[data-toggle="tooltip"]').tooltip();
		};

		var smoothZoomIn = function(map, max, cnt){
			
			if (cnt >= max) {
				return;
			}
			else {
				z = google.maps.event.addListener(map, 'zoom_changed', function(event){
					google.maps.event.removeListener(z);
					smoothZoomIn(map, max, cnt + 1);
				});
				setTimeout(function(){
					map.setZoom(cnt);
				},80);
			}
		};

		var smoothZoomOut = function(map, max, cnt){
			if (cnt <= max){
				return;
			}
			else{
				z = google.maps.event.addListener(map, 'zoom_changed', function(event){
					google.maps.event.removeListener(z);
					smoothZoomOut(map, max, cnt - 1);
				});
				setTimeout(function(){
					map.setZoom(cnt);
				},80);
			}
		};

		var setUserMarkerCss = function(){
			var css = document.createElement('style')
			css.innerHTML = '.markerLabel { background-image: url("' + User.user.get('picture_path') + '");}';
			document.body.appendChild(css);
		};

		var MapView = Backbone.View.extend({

			tpl: _.template(mapTpl),

			initialize: function(){

				User.setLocation(function(err, res){
					if(err){
						//Do something
						return;
					}
					createUserMarker(User.user.get('latitude'), User.user.get('longitude'))
				}, true);

				setUserMarkerCss();

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
				

				$(document).keyup(function(e){
					if (e.keyCode == 27){
						closeDiscoverView();
					}
				});

			},

			getYepInfo: function(yepId, cb){

				Api.get('/yeps/' + yepId, window.localStorage.getItem('token'), function(err, yep){

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

				var currentTime = (new Date).getTime()/1000;
				var timeDiff = currentTime - data.video.yep.start_time;

				data.timeElapsed = helper.timeElapsedCalculator(timeDiff);

				data.followButtonClass = data.video.yep.user.is_following ? 'btn btn-xs btn-danger' : 'btn btn-xs btn-primary';
				data.followButtonValue = data.video.yep.user.is_following ? 'unfollow' : 'follow';
				data.followButtonContent = data.video.yep.user.is_following ? 'unfollow' : 'follow';

				var logedInUserId = User.user.get('user_id');

				if(User.authed){
					data.followButtonClass += logedInUserId == data.video.yep.user.user_id ? ' disabled' : '';
				}

				// This is based on a 214 px wide container
				if(data.video.yep.title.length < 24){
					data.yepTitleFontSize = 'h3';
				}
				else if(data.video.yep.title.length < 39){
					data.yepTitleFontSize = 'h4';
				}
				else if(data.video.yep.title.length < 58 ){
					data.yepTitleFontSize = 'h5';
				}
				else if(data.vide.yep.title.length < 76){
					data.yepTitleFontSize = 'h6';
				}
				else{
					data.yepTitleFontSize = 'h6';
				}

				data.yepControllable = data.video.yep.user.user_id == User.user.attributes.user_id ? true : false;

				$('div.discover-body').append(discoverUI(data));

				loaderClose();

				$('[data-toggle="tooltip"]').tooltip();

				registerUserControl();

				this.messagingListener(data);

				//this.addVoteListener(data);
				this.addViewCount(data);

				this.initFacebookShare(data.video.yep);
				this.initTwitterShare(data.video.yep);
				this.initGoogleShare(data.video.yep);
				this.registerFollowAction(data.video.yep.user.user_id);

				// Setting up VideoJS
				this.setupVideo(data);
				
			},

			registerFollowAction: function(userId){

				$('button#user-follow-button').on('click', function(e){

					var self = $(this);
					e.preventDefault();

					var current = self.attr('value');

					if(current === 'follow'){

						Api.post('/users/' + userId + '/following', {}, window.localStorage.getItem('token'),

							function(err, res){

								if( err ){
									return Swal("", "Something is wrong", "warning");
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
									return Swal("", "Something is wrong", "warning");
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
			},

			

			registerSocketEvents: function(){

				var self = this;

				socket.on('server:error', function(data){
					console.log('Error');
				});

				socket.on('yep:connection', function(data){
					$('.connection-count').html(data.connection_count);
				});

				socket.on('yep:disconnection', function(data){
					$('.connection-count').html(data.connection_count);
				});

				socket.on('chat:users', function(users){
					appendConnectionUsers(users.users);
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
					// If it is an update of title
					if(yepsCollection.get(data.id)){
						yepsCollection.get({ id: data.id }).set({ title: data.title });
					}
					// Create a new yep
					else{
						var newYep = {
							latLng : [data.latitude, data.longitude],
							data : data.id
						}
						mapMarkers.push(newYep);

						populateMapView(mapMarkers);

						var yep = new Yep(data);
						yepsCollection.add(yep);
					}
				});

				socket.on('yep:delete', function(yep){
					updateExplorer('delete', yep.id);
				})
			},

			discover: function(){

				var self = this;

				// Discover is clicked
				$('#main').on('click', 'a.explorer-link-discover', function(){

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
					populateMapView(mapMarkers);

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
					var text = yep.vod_enable ? yep.user.display_name + ' is streaming on Yeplive!' : 'Check out my live-stream';
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

			populate: function(data){
				$('#map-canvas').gmap3('clear', 'markers');
				$('#map-canvas').gmap3({
					marker: marker(data)
				});
			}
		});

		return MapView;
});
