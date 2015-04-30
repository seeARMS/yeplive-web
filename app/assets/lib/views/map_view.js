define(['jquery',
				'underscore',
				'backbone', 
				'gmap3',
				'text!lib/templates/map.html',
				'lib/map',
				'lib/collections/yeps'
				],
	function($, _, Backbone,gmap3, mapTpl, googleMaps, yepsCollection){

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




	var MapView = Backbone.View.extend({
		tpl: _.template(mapTpl),
		initialize: function(){
		this.render();
		$('#map-canvas').gmap3({
					map:{
						options: options
					},
					zoomControlOptions:{
						style: google.maps.ZoomControlStyle.LARGE,
						position: google.maps.ControlPosition.LEFT_CENTER
					}
				});
			//App.Map.el = document.getElementById('map-canvas');
			//App.Map.$el = $('#map-canvas');
			//App.Map.initialize();
		//	this.showMarkers();
		//google.maps.event.addDomListener(window, 'load', Map.initialize);
		},
		render: function(){
			this.$el.html(this.tpl());
		}
	});

	return MapView;
});
