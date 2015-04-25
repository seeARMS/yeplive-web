(function(App){
	App = App || {};
	App.Models = {};
	App.Collections = {};

	App.Models.Yep = Backbone.Model.extend({
		initialize: function(){
		}
	});	

	App.Models.User = Backbone.Model.extend({
		defaults:{

		}
	});

	App.Collections.YepsCollection = Backbone.Collection.extend({
		url: '/api/yeps',
		model: App.Models.Yep,
		getMapData: function(){
			var data = [];
			this.each(function(yep){
				data.push({
					latLng: [
						yep.get('latitude'),
						yep.get('longitude')
					],
					data: yep.get('id')	
				});
			});
			return data;
		}
	});
}(window.App));
