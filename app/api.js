module.exports = (function(){
	var express = require('express');	
	var router = new express.Router();
	var helpers = require('./helpers');

	router.post('/logout', function(req,res){
		req.logout();
		if(req.session.passport){
			req.session.passport.user = null;
		}
		res.status(200).json({success:1});
	});

	router.get('/auth', function(req, res){

		if(req.session.passport && req.session.passport.user){
			var user = req.session.passport.user;
			helpers.postAPI('/auth/social', user, function(err, response, body){
				if(err || response.statusCode !== 200){
					if(err) return res.json({erro:'error'});
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

	router.get('/users', function(req, res){
		var name = req.query.name;
		var token = req.headers["authorization"];
		console.log(name);
		helpers.getAPI('/users?name='+name, token, function(err, response, body){
			console.log(err);
			console.log(body);
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			if(err) return res.status(500).json({error:'internal error'});
			res.status(200).json(JSON.parse(body));
		});
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
		helpers.getAPI('/yeps?quantity=99999999', function(err, response, body){
			if(err || response.statusCode !== 200 ){
				return res.status(500).json({error: 'could not fetch yeps'});
			}
			var json = JSON.parse(body);
			res.status(200).json(json.yeps);
		});
	});

	router.get('/comments/:id', function(req, res){
		helpers.getAPI('/comments/' + req.params.id , function(err, response, body){
			if(err || response.statusCode !== 200 ){
				return res.status(500).json({error: 'could not fetch comments'});
			}
			var json = JSON.parse(body);
			console.log(json);
			res.status(200).json(json.comments);
		});
	});


	router.post('/comments/:id', function(req, res){
		var token = req.headers["authorization"];
		var comment = req.body.comment;
		var created_time = req.body.created_time;
		helpers.postAPI('/comments/' + req.params.id,
						{
							comment: comment,
							created_time: created_time
						},
						token,
						function(err,response, body){
							if(err || response.statusCode !== 200 ){
								return res.status(500).json({error: 'could not post comment'});
							}
							var json = JSON.parse(body);
							return res.status(200).json(json.comment);
						}
		);
	});

	router.post('/yeps/:id/views', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		helpers.postAPI('/yeps/' + id + '/views', {},
						token,
						function(err,response, body){
							if(err || response.statusCode !== 200 ){
								return res.status(500).json({error: 'could not add view'});
							}
							var json = JSON.parse(body);
							return res.status(200).json(json);
						}
		);
	});

	router.post('/thumbnail/:id', function(req, res){
		var token = req.headers["authorization"];
		console.log(token);
		var id = req.params.id;
		helpers.postAPI('/thumbnail/' + id, {},
						token,
						function(err,response, body){
							console.log(err);
							console.log(body);
							if(err || response.statusCode !== 200 ){
								return res.status(500).json({error: 'could toggle vote'});
							}
							var json = JSON.parse(body);
							return res.status(200).json(json);
						}
		);
	});

	router.post('/yeps/:id/votes', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		helpers.postAPI('/yeps/' + id + '/votes', {},
						token,
						function(err,response, body){
							if(err || response.statusCode !== 200 ){
								return res.status(500).json({error: 'could toggle vote'});
							}
							var json = JSON.parse(body);
							return res.status(200).json(json);
						}
		);
	});

	router.post('/yeps', function(req, res){
		var token = req.headers["authorization"];
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;
		var title = req.body.title;
		var staging = req.body.staging;

		helpers.postAPI('/yeps',{
			latitude: latitude,
			longitude: longitude,
			is_web: 1,
			staging: staging,
			title: title
		}, token , function(err, response, body){
			console.log(err);
			console.log(response.statusCode);
			console.log(body);
			if(err || response.statusCode !== 200 ){
				return res.status(500).json({error: 'could not fetch yeps'});
			}
			var json = JSON.parse(body);
			return res.status(200).json(json);
		});
	});

	router.post('/yeps/:id/complete', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		helpers.postAPI('/yeps/'+id+'/complete',{
		}, token , function(err, response, body){
			console.log(err);
			console.log(response.statusCode);
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
		helpers.getAPI('/yeps/'+ id, token, function(err, response, body){
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);
		});
	});

	router.put('/yeps/:id', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.id;
		var title = req.body.title;
		helpers.putAPI('/yeps/'+ id, { title: title }, token, function(err, response, body){
			console.log(response.statusCode);
			console.log('HSIT');
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			console.log(json);
			res.status(200).json(json);
		});
	});

	router.delete('/yeps/:yepId', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.yepId;
		
		helpers.deleteAPI('/yeps/' + id, {}, token, function(err, response, body){
			console.log(response.statusCode);
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.get('/users/:userId', function(req, res){
		var token = req.headers["authorization"];
		var userId = req.params.userId;
		helpers.getAPI('/users/'+ userId, token, function(err, response, body){
			if (err || response.statusCode !== 200){
				if(response.statusCode === 404){
					return res.status(404).json({error: 'could not find user'});
				}
				return res.status(500).json({error:'could not get user'});
			}
			res.json(JSON.parse(body));
		});
	});

	router.get('/users/:userId/yeps', function(req, res){
		var userId = req.params.userId;
		helpers.getAPI('/users/'+ userId + '/yeps', function(err, response, body){
			if (err || response.statusCode !== 200){
				if(response.statusCode === 404){
					return res.status(404).json({error: 'could not find user'});
				}
				return res.status(500).json({error:'could not get user'});
			}
			res.json(JSON.parse(body));
		});
	});

	router.get('/users/:userId/followers', function(req, res){
		var userId = req.params.userId;
		helpers.getAPI('/users/'+ userId + '/followers', function(err, response, body){
			if (err || response.statusCode !== 200){
				if(response.statusCode === 404){
					return res.status(404).json({error: 'could not find user'});
				}
				return res.status(500).json({error:'could not get user'});
			}
			res.json(JSON.parse(body));
		});
	});

	router.get('/users/:userId/following', function(req, res){
		var userId = req.params.userId;
		helpers.getAPI('/users/'+ userId + '/following', function(err, response, body){
			console.log(response.statusCode)
			if (err || response.statusCode !== 200){
				if(response.statusCode === 404){
					return res.status(404).json({error: 'could not find user'});
				}
				return res.status(500).json({error:'could not get user'});
			}
			res.json(JSON.parse(body));
		});
	});

	router.delete('/users/:userId/following', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.userId;
		
		helpers.deleteAPI('/users/' + id + '/following', {}, token, function(err, response, body){
			console.log(response.statusCode);
			if(response.statusCode !== 200){
				if(response.statusCode === 500){ return res.send(body); }
				return res.status(response.statusCode).json({error: response.statusCode});
			}
			var json = JSON.parse(body);
			res.status(200).json(json);	
		});
	});

	router.post('/users/:userId/following', function(req, res){
		var token = req.headers["authorization"];
		var id = req.params.userId;
		
		helpers.postAPI('/users/' + id + '/following', {}, token, function(err, response, body){
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
		
		helpers.postAPI('/users/'+id+'/followers',{},token,function(err, response, body){
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
