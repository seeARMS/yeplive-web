module.exports = function(app){
var colors = require('colors');
var GOOGLE_CONSUMER_KEY="757029635679-3t8dr78cejogedbv3neac7gjckeb2ilb";
var GOOGLE_CONSUMER_SECRET="i0HLYf0gzCmfztR1nOm9h-WP";
var FACEBOOK_APP_ID = '1577314819194083';
var FACEBOOK_APP_SECRET = '5c6167095ce3987081efad0612ad9003';
var TWITTER_CONSUMER_KEY = 'bbvlvahg8Yy4QkIHmFeqwlrVu';
var TWITTER_CONSUMER_SECRET = 'mcVORCE10obPArdKVjyE3vQPmUDAPmjxWE3ijWjSH98eLtOCHp';
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
      console.log(data.facebook_access_token.green);
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

app.get('/auth/facebook', passport.authenticate('facebook', {scope: [
//		'publish_actions',
		'user_friends'
]}));


app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { scope: [
//		'publish_actions',
		'user_friends'
	],successRedirect: '/',
}));


app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/' }));

app.get('/auth/google', passport.authenticate('google', {scope:['profile','https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.circles.read'], accessType: 'offline', approvalPrompt: 'force'}));
app.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/' }));

};
