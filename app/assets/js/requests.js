(function(App){
	App = App || {};
	
	App.getAPI = function(url, cb){
		$.ajax(
			{
				url:url,
				type: "GET",
				beforeSend: function(xhr){
					xhr.setRequestHeader('Authorization', 'Bearer '+App.Auth.token || '');
				},
				success: cb,
				error: function(err){
					console.log(err);
					cb(err);
				}
			})
	};

	App.postAPI = function(url, data, cb){
		$.ajax(
			{
				url:url,
				type: "POST",
				data: data,
				beforeSend: function(xhr){
					xhr.setRequestHeader('Authorization', 'Bearer '+App.Auth.token || '');
				},
				success: cb,
				error: function(err){
					console.log(err);
				}
		});
	};
}(window.App));
