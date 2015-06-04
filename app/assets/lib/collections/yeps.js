define(['jquery', 'underscore', 'backbone', 'lib/models/yep'],

	function($, _, Backbone, Yep){
	
		var YepsCollection = Backbone.Collection.extend({
			url: '/api/yeps',
			model: Yep,
			getMapData: function(){
				var data = [];
				this.each(function(yep){
					var live = yep.get('vod_enable') ? 0 : 1;
					data.push({
						latLng: [
							yep.get('latitude'),
							yep.get('longitude')
						],
						data: yep.get('id'),
						live: live
					});
				});
				return data;
			}
		});

		return YepsCollection;
	}
);