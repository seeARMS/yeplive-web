module.exports = (function(){
	var config = require('../config');
	var request = require('request');

	//Post request to the api
	function postAPI(route, params, auth, cb) {
		if(typeof auth == "function"){
			cb = auth;
			return request({
			method: 'POST',
			uri: config.yeplive_api.host +'/api/v1'+ route,
			form: params
			}, cb);
		} else {
		request({
			method: 'POST',
			uri: config.yeplive_api.host + '/api/v1' + route,
		 headers: {
			'Authorization': auth,
		 },
		form: params
			}, cb);
		}
	}

	//get request to the api
	function getAPI(route, auth, cb) {
		if(typeof auth == "function"){
			cb = auth;
			return request({
			method: 'GET',
			uri: config.yeplive_api.host +'/api/v1'+ route
			}, cb);
		} else {
		request({
			method: 'GET',
			uri: config.yeplive_api.host +'/api/v1'+ route,
		 headers: {
			'Authorization': auth,
		 }
			}, cb);
		}
	}


	//Delete request to the api
	function deleteAPI(route, params, auth, cb) {
		if(typeof auth == "function"){
			cb = auth;
			return request({
			method: 'DELETE',
			uri: config.yeplive_api.host +'/api/v1'+ route,
			form: params
			}, cb);
		}
		else {
			request({
				method: 'DELETE',
				uri: config.yeplive_api.host +'/api/v1'+ route,
			 	headers: {
					'Authorization': auth,
				},
				form: params
			}, cb);
		}
	}

	return {
		postAPI: postAPI,
		getAPI: getAPI,
		deleteAPI: deleteAPI	
	}
	
}());
