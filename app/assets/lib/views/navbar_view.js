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
			initialize: function(options){
				var self = this;	
				this.render(options);
			},
			render: function(options){
				var data = {
					User: User.authed ? User.user : "",
					redirectPath : options.redirect
				};
				this.$el.html(this.tpl(data));
				$('[data-toggle="tooltip"]').tooltip();
			}
		});

		return NavbarView;
	}

);