var config = require('../config');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

//757029635679-3t8dr78cejogedbv3neac7gjckeb2ilb
var GOOGLE_CONSUMER_KEY="757029635679-3t8dr78cejogedbv3neac7gjckeb2ilb";
var GOOGLE_CONSUMER_SECRET="i0HLYf0gzCmfztR1nOm9h-WP";
var FACEBOOK_APP_ID = '1574335682844343';
var FACEBOOK_APP_SECRET = '434b5073d101f047c31c4f011f8fc9fb';
var TWITTER_CONSUMER_KEY = 'VTHbMSfNL8JFWbkTVQ6MZPgHJ';
var TWITTER_CONSUMER_SECRET = 'JWJ0Hv9zQYNZiLqEBjj0jA5fhMMefjw7l4wzBDTg8ZGhwzcE3Y';

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
	secret:'yeplive-secret'
}));

app.use(express.static(__dirname+'/assets'));

app.get('/',function(req, res){
	res.sendFile(__dirname+'/index.html');
});

app.get('/test', function(req, res){
	res.sendFile(__dirname+'/test.html');
});

app.get('/auth', function(req, res){
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

//SOCIAL LOGIN
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
	, TwitterStrategy = require('passport-twitter').Strategy
	,	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(data, done) {
  done(null, data);
});
passport.deserializeUser(function(data, done) {
    done(null, true);
});



passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
			var data = {
				facebook_access_token: accessToken,
				facebook_user_id: profile.id
			};
      done(null, data);
  }
));

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
			var data = {
				twitter_access_token: token,
				twitter_secret_token: tokenSecret,
				twitter_user_id: profile.id
			};
      done(null, data);
  }
));

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CONSUMER_KEY,
    clientSecret: GOOGLE_CONSUMER_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
		var data = {
			google_access_token: token,
			google_access_token_secret: tokenSecret,
			google_user_id: profile.id
		};
		console.log(profile);
		return done(null, data);
  }
));
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
}));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/' }));

app.get('/auth/google', passport.authenticate('google', {scope:['profile']}));
app.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/' }));


app.get('/yeps', function(req, res){
	getAPI('/yeps', function(err, response, body){
		var json = JSON.parse(body);
		res.status(200).json(json.yeps);
	});
});

app.post('/auth', function(req, res){
	if(req.body.facebook_access_token && req.body.facebook_user_id){
		var data = {
			'facebook_access_token': req.body.facebook_access_token,
			'facebook_user_id': req.body.facebook_user_id
		}
		postAPI('/', data, function(err, response, body){
			if(response.statusCode != 200){
				return res.status(400).json({ error: 'auth unsuccessful' });	
			}
			var json = JSON.parse(body);
			res.status(200).json(body);
		})
	} else {
		return res.status(400).json({ error: 'auth unsuccessful' });	
	}
});

app.listen(process.env.PORT || config.PORT, function(){
	console.log('Yeplive web client now running on port 3000');
});

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