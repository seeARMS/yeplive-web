define(['jquery', 'underscore', 'backbone', 'lib/user'],
	function($, _, Backbone, Api, User){

	var API = {};

	API.get = function(route, token, cb){
		var callback = typeof token === 'function' ? 
			token : cb;	

		$.ajax(
			{
				url:'/api'+route,
				type: "GET",
				beforeSend: function(xhr){
					if(! (typeof token === 'function')){
						xhr.setRequestHeader('Authorization', 'Bearer '+token || '');
					}
				},
				success: function(res){
					callback(null, res);
				},
				error: function(err){
					callback(err);
				}
			})
	};

	API.post = function(route, data, token, cb){
		var callback = typeof token === "function" ? 
			token : cb;	
			
		$.ajax(
			{
				url:'/api'+route,
				type: "POST",
				beforeSend: function(xhr){
					if(! (typeof token === 'function')){
						xhr.setRequestHeader('Authorization', 'Bearer '+token || '');
					}
				},
				data: data,
				success: function(res){
					callback(null, res);
				},
				error: function(err){
					callback(err);
				}
			})

	};

	API.delete = function(route, data, token, cb){
		var callback = typeof token === 'function' ? 
			token : cb;	
			
		$.ajax(
			{
				url:'/api'+route,
				type: "DELETE",
				beforeSend: function(xhr){
					if(! (typeof token === 'function')){
						xhr.setRequestHeader('Authorization', 'Bearer '+token || '');
					}
				},
				data: data,
				success: function(res){
					callback(null, res);
				},
				error: function(err){
					callback(err);
				}
			})

	};

	return API;

});
