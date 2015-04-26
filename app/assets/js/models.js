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

	App.Models.Location = Backbone.Model.extend({
		initialize: function(){
			this.getNavigatorLocation();
		},
		getNavigatorLocation: function(){
			var self = this;
			window.navigator.geolocation.getCurrentPosition(function(position){
				self.set('latitude', position.coords.latitude);
				self.set('longitude', position.coords.longitude);
			}, function(){
				console.log('user didnt give nav brah');
				self.getFallbackLocation();
			});
		},
		getFallbackLocation: function(){
			console.log('getting fallback position');
		}	
	});
}(window.App));
