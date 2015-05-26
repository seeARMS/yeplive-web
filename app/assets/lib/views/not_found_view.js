define(['jquery',
				'underscore',
				'backbone',
				'text!lib/templates/not_found.html'
				],
	function($, _, Backbone, notFoundTpl){

	var NotFoundView = Backbone.View.extend({
		tpl: _.template(notFoundTpl),
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl());
		}
	});

	return NotFoundView;

});
