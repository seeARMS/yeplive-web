module.exports = (function(){
	var express = require('express');	
	var router = new express.Router();
	var helpers = require('./helpers');

	router.post('/logout', function(req,res){
		req.logout();
		req.session.passport.user = null;
		res.status(200).json({success:1});
	});

	router.get('/test', function(req, res){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.sendFile(__dirname+'/test.html');
	});

	router.get('/auth', function(req, res){

		if(req.session.passport && req.session.passport.user){
			var user = req.session.passport.user;
			helpers.postAPI('/auth/social', user, function(err, response, body){
				console.log(body);
				if(err || response.statusCode !== 200){
					if(response.statusCode === 500){ return res.json({error:'error'}); }
					return res.status(response.statusCode).json({error: response.statusCode});
				}
				var json = JSON.parse(body);
				res.status(200).json(json);
			});
		} 
		else {
			res.status(200).json({error:'not logged in'});
		}
	});


	router.get('/me', function(req, res){
		var token = req.headers["authorization"];
		helpers.getAPI('/me', token, function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			if(err) return res.status(500).json({error:'internal error'});
			res.status(200).json(JSON.parse(body));
		});
	});
	
	

	router.post('/like', function(req, res){
		var token = req.headers["authorization"];
		var id = req.body.id;
		helpers.postAPI('/yeps/'+id+'/votes',{},token,function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.get('/yeps', function(req, res){
		helpers.getAPI('/yeps', function(err, response, body){
			if(err || response.statusCode !== 200 ){
				return res.status(500).json({error: 'could not fetch yeps'});
			}
			var json = JSON.parse(body);
			res.status(200).json(json.yeps);
		});
	});

	router.post('/yeps', function(req, res){
		var token = req.headers["authorization"];
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;
		helpers.postAPI('/yeps',{
			staging: true,
			latitude: latitude,
			longitude: longitude
		}, token , function(err, response, body){
			console.log(body);
			if(err || response.statusCode !== 200 ){
				return res.status(500).json({error: 'could not fetch yeps'});
			}
			var json = JSON.parse(body);
			return res.status(200).json(json);
		});
	});

	router.post('/yeps/:id/unstage', function(req ,res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		helpers.postAPI('/yeps/'+id+'/unstage',{},token,function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.get('/yeps/:id', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		helpers.getAPI('/yeps/'+id,token,function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.get('/users', function(req, res){
		var name = req.query.name;
		helpers.getAPI('/users?name='+name, function(err, response, body){
			if (err || response.statusCode !== 200){
				if(response.statusCode === 404){
					return res.status(404).json({error: 'could not find user'});
				}
				return res.status(500).json({error:'could not get user'});
			}
			res.json(JSON.parse(body));
		});
	});

	router.post('/follow/:id', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		
		helpers.postAPI('/users/'+id+'/followers',{},token,function(err, response, body){
			console.log(body);
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	return router;
}());
