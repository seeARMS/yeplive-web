module.exports = (function(){
	var express = require('express');	
	var router = new express.Router();

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
		postAPI('/auth/social', user, function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);
		});
		} else {
			res.status(200).json({error:'not logged in'});
		}
	});

	router.get('/me', function(req, res){
		var token = req.headers["authorization"];
		getAPI('/me', token, function(err, response, body){
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
		postAPI('/yeps/'+id+'/votes',{},token,function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	app.get('/yeps', function(req, res){
		getAPI('/yeps', function(err, response, body){
			var json = JSON.parse(body);
			res.status(200).json(json.yeps);
		});
	});

	router.get('/yeps/:id', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		getAPI('/yeps/'+id,token,function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.post('/follow/:id', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		
		postAPI('/users/'+id+'/followers',{},token,function(err, response, body){
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
