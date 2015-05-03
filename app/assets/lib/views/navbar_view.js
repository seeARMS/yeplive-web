define(['jquery',
		'underscore',
		'backbone',
		'bootstrap',
		'text!lib/templates/navbar.html',
		'lib/auth',
		'lib/user'
		],
		
	function($, _, Backbone, Bootstrap, navbarTpl, Auth, User){

		var NavbarView = Backbone.View.extend({
			tpl: _.template(navbarTpl),
			initialize: function(){
				var self = this;	
				this.render();
			},
			render: function(){
				var data = {
					User: User.authed ? User.user : ""
				};
				this.$el.html(this.tpl(data));
			}
		});

		return NavbarView;
	}

);