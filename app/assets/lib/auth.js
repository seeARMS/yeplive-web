define(['jquery', 'underscore', 'backbone', 'lib/api'],
	function($, _, Backbone, Api){

	var Auth = {};

	
	Auth.checkAuth = function(cb){
	
		var token = window.localStorage.getItem('token');
		if(! token){
			Api.get('/auth', function(err, res){
				if(err){
					console.log(err);
					console.log(err.statusText);
					return alert('error');
				}
				if(!res.token){
					return cb(null, false);
				}
				window.localStorage.setItem('token', res.token);
				Auth.getUser(res.token, function(err, res){
					cb(null, res);
				});
			});	
		} else {
				Auth.getUser(token, function(err, res){
					if(err){
						window.localStorage.setItem('token','');
						return Auth.checkAuth();
					}
					cb(null, res);
				});
			}
		};

	Auth.getUser = function(token, cb){
		Api.get('/me', token, cb);
	}

	return Auth;

});
