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
	/*
	var markerClicked = function(marker, event, context){
		var yepID = context.data;
		App.events.trigger('yep:clicked', yepID);
	};
	*/
	var markerClicked = function(marker, event, context){
		
		var map = $(this).gmap3("get"),	
			infowindow = $(this).gmap3({get:{name:"infowindow"}});

		if (infowindow){
			infowindow.open(map, marker);
			infowindow.setContent(context.data);
		} 
		else {
			$(this).gmap3({
				infowindow:{
					anchor:marker, 
					options:{content: context.data}
				}
			});
		}

		//var yepID = context.data;
		//App.events.trigger('yep:clicked', yepID);
	};

	var markerMousedOver = function(marker, event, context){
	};

	var markerMousedOut = function(marker, event, context){
	};

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
					draggable: true,
					icon: 'img/yeplive-marker.png'
				},
				events:{
					click: markerClicked,
					mouseover: markerMousedOver,
					mouseout: markerMousedOut
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
