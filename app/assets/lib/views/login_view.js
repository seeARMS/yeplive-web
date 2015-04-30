define(['jquery',
				'underscore',
				'backbone',
				'bootstrap',
				'text!lib/templates/login.html',
				'lib/auth',
				'lib/user'
				],
	function($, _, Backbone, Bootstrap, loginTpl, Auth, User){

	var LoginView = Backbone.View.extend({
		tpl: _.template(loginTpl),
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.tpl());
		}
	});

	return LoginView;

});
