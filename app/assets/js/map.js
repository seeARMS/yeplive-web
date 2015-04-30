(function(App){
	//google maps https://developers.google.com/maps/documentation/javascript/
	//google maps jquery plugin http://gmap3.net/en/
	App = App || {};
	var Map = {};
	Map.options = {
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
	//PRIVATE METHODS
	//MAP MARKERS
	
	var markerClicked = function(marker, event, context){
		var yepID = context.data;
		App.events.trigger('yep:clicked', yepID);
	};

	var timeElapsedCalculator = function(diff){

		if (diff < 60){
			return 'Just Now';
		}
		else if (diff < 3600){
			var min = Math.floor(diff/60);
			if (min === 1){
				return '1 minute ago';
			}
			else{
				return min.toString() + ' minutes ago';
			}
		}
		else if (diff < 86400){
			var hr = Math.floor(diff/60/60);
			if (hr === 1){
				return '1 hour ago'
			}
			else{
				return hr.toString() + ' hours ago';
			}
			
		}
		else if (diff < 2592000){
			var day = Math.floor(diff/60/60/24);
			if (day === 1){
				return '1 day ago'
			}
			else{
				return day.toString() + ' days ago';
			}
		}
		else if (diff < 31536000){
			var month = Math.floor(diff/2592000);
			if (month === 1){
				return '1 month ago'
			}
			else{
				return month.toString() + ' months ago';
			}
		}
		else{
			return 'more than a year ago';
		}
	}
	

	var clusterContent = function(context){

		var yepMarks = context.data.markers;

		var cluster = [];

		for(var i = 0; i < yepMarks.length; i++){
			var yep = App.yepsCollection.findWhere({ id : yepMarks[i].data });
			cluster.push(yep);
		}

		var content = '<div class="infoWindow">'

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

			content += '<div class="cluster-wrapper"><a href="#watch/' + yepId + '">';
			content += '<img src="' + imagePath + '" class="cluster-Image">';
			content += '<div class="cluster-body">';
			content += '<div class="cluster-title"><strong>' + yepTitle + '</strong></div>';
			content += '<div class="cluster-display-name">' + displayName + '</div>';
			content += '<div class="cluster-views">Views: ' + views + '</div>';
			content += '</div>';
			content += '<div class="cluster-created-time">' + timeElapsedCalculator(timeDiff) + '</div>';
			content += '</div></a><hr />'

		}

		content += '</div>'
		return content;
	}

	var infoWindowOpen = function($this, marker, data){
		console.log(marker)
	}

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
	}

	//PUBLIC METHODS
	Map.populate = function(data){
		Map.$el.gmap3('clear', 'markers');
		Map.$el.gmap3({
			marker:{
				values: data,
				/*
				cluster:{
					radius: 100,
					0:{
						content: '<div class="cluster cluster-1">CLUSTER_COUNT</div>',
						width:50,
						height:50
					}
				},
				*/
				options:{
					draggable: false,
					icon: 'img/yeplive-marker.png'
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
		});
	};

	Map.clear = function(){
		Map.$el.gmap3('clear','markers');
	};

	Map.initialize = function(){
		Map.$el.gmap3({
			map:{
				options: Map.options
			},
			zoomControlOptions:{
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.LEFT_CENTER
			}
		});
	};

	//Call initialze method when google maps ready
	//google.maps.event.addDomListener(window, 'load', Map.initialize);

	//expose Map object	
	App.Map = Map;

}(window.App));
