(function(App){
	//google maps https://developers.google.com/maps/documentation/javascript/
	//google maps jquery plugin http://gmap3.net/en/
	App = App || {};
	var Map = {};
	Map.el = document.getElementById('map-canvas');
	Map.$el = $('#map-canvas');
	Map.options = {
			center: { lat: -34.397, lng: 150.644},
			zoom: 8,
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
		console.log('clicked');
		console.log(arguments);
	};

	var markerMousedOver = function(marker, event, context){
		console.log('moused over');
	};

	var markerMousedOut = function(marker, event, context){
		console.log('moused out');
	};

	//PUBLIC METHODS
	Map.addMarker = function(latitude, longitude, message){
		console.log('lat',latitude,'long',longitude);
		Map.$el.gmap3({
			marker:{
				values: [
					{ latLng:[latitude, longitude], data: message, 
						options:{
							icon: 'img/yeplive-marker.png'
						}
					}
				],
				events:{
					click: markerClicked,
					mouseover: markerMousedOver,
					mouseout: markerMousedOut
				}
			}
		});
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
		Map.addMarker(-35, 150, "test marker"); 
	};

	//Call initialze method when google maps ready
	google.maps.event.addDomListener(window, 'load', Map.initialize);

	//expose Map object	
	App.Map = Map;

}(window.App));
