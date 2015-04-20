module.exports = function(app){
		//SOCIAL LOGIN
var helpers = require('./helpers');
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


/*
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
*
};
