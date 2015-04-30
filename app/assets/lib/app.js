define(['jquery', 'underscore', 'backbone', 'lib/router', 'lib/auth', 
				'lib/views/login_view',
				'lib/user',
				'lib/models/user'
	],
	function($, _, Backbone, Router, Auth, LoginView, User, UserModel){


	var PubSub = _.extend({}, Backbone.Events);
	var Application = function(){
		Auth.checkAuth(function(err, user){
			if(err){
				console.log(err);
				return alert('error');
			}
			if(! user){
				window.location.href = '#login';
				User.authed = false;
			} else {
				User.user = new UserModel(user);;
				User.authed = true;
			}
			Router.initialize();
			Backbone.history.start();
		})
	};

	_.extend(Application.prototype,{
		initialize: function(){
		}
	});


	return Application;
});
