define(['jquery', 'underscore', 'backbone', 'lib/models/yep'],
	function($, _, Backbone, Yep){
	
	var YepsCollection = Backbone.Collection.extend({
		model: Yep
	});

	return YepsCollection;
});
