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

			var ua = navigator.userAgent.toLowerCase();

			var tplObj;

			if(navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("ipod") != -1 ){
				tplObj = { iphone: 1 };
			}
			else{
				tplObj = { iphone: 0 };
			}

			this.$el.html(this.tpl(tplObj));
			
			/*
			if(navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("android") != -1 || ua.indexOf("ipod") != -1 || ua.indexOf("windows ce") != -1 || ua.indexOf("windows phone") != -1){
				return $('#login-appstore-prompt').modal('show');
			}*/
		}
	});

	return LoginView;

});
