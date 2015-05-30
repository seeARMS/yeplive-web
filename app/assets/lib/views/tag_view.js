define(['jquery',
		'underscore',
		'backbone',
		'bootstrap',
		'text!lib/templates/tag.html',
		'lib/auth',
		'lib/user'
		],
	function($, _, Backbone, Bootstrap, tagTpl, Auth, User){

	var TagView = Backbone.View.extend({

		tpl: _.template(tagTpl),

		initialize: function(options){
			var tag = options.tag
			this.render();
		},

		render: function(){
			
		}
	});
	return TagView;
});
