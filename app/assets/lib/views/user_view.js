define(['jquery',
		'underscore',
		'backbone',
		'text!lib/templates/user.html',
		'lib/api'
	],
	function($, _, Backbone, userTpl, API){

	var UserView = Backbone.View.extend({
		tpl: _.template(userTpl),
		initialize: function(opts){
			var userId = opts.user_id;
			var self = this;
			API.get('/users/'+userId, function(err, res){
				console.log(res);
				self.render();
			});
		},
		close: function(){
			this.remove();
      this.unbind();
		},
		render: function(){
			this.$el.html();
		}
	});

	return UserView;

});
