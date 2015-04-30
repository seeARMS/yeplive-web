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

			var yepTitle = yep.title;
			var imagePath = yep.image_path;
			var user = yep.user.display_name;
			var views = yep.views;
			var vodEnable = yep.vod_enable;
			var createdAt = yep.created_at;

			content += '<ul>';
			content += '<li>Title: ' + yepTitle + '</li>';
			content += '<li>Image: ' + imagePath + '</li>';
			content += '<li>Views: ' + views + '</li>';
			content += '<li>Users: ' + user + '</li>';
			content += '<li>Vod: ' + vodEnable + '</li>';
			content += '<li>Time: ' + createdAt + '</li>';
			content += '</ul><hr />'

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
