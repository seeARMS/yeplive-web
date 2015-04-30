define(['jquery',
				'underscore',
				'backbone', 
				'text!lib/templates/map.html',
				'lib/map', 'lib/collections/yeps'],
	function($, _, Backbone, mapTpl, googleMaps){

	var MapView = Backbone.View.extend({
		tpl: _.template(mapTpl),
		initialize: function(){
		this.render();
			App.Map.el = document.getElementById('map-canvas');
			App.Map.$el = $('#map-canvas');
			App.Map.initialize();
		//	this.showMarkers();
		//google.maps.event.addDomListener(window, 'load', Map.initialize);
		},
		render: function(){
			this.$el.html(this.tpl(App.Auth));
		}
	});

	return MapView;
});
