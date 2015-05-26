module.exports = function(app){

  var config = require('../config');
  console.log(config.host+"/auth/twitter/callback");
  var colors = require('colors');
  var GOOGLE_CONSUMER_KEY="1014160866669-r4jabm2qeofksehv3c5epfirpjl9dop3";
  var GOOGLE_CONSUMER_SECRET="UaYmjJkY5IX5xIF84rZXvO-2";
  var FACEBOOK_APP_ID = '1577314819194083';
  var FACEBOOK_APP_SECRET = '5c6167095ce3987081efad0612ad9003';
  var TWITTER_CONSUMER_KEY = 'jFzyWPe0yDYa04Fu5MNxRnPqH';
  var TWITTER_CONSUMER_SECRET = 'iNrFlFNrbOVfiIdtnNZP46kgAo4ctbkbC7VbJiES005vsnR2oC';
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
      callbackURL: "/auth/facebook/callback"
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
      callbackURL: "/auth/twitter/callback"
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
      callbackURL: "/auth/google/callback"
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

  app.get('/auth/facebook', function(req, res, next){
      req.session.redirect = req.query.redirect;
      next();
    }, passport.authenticate('facebook', {scope: [
      'user_friends'
      ]
    })
  );


  app.get('/auth/facebook/callback', passport.authenticate('facebook', { scope: [ 'user_friends' ], failureRedirect: '/'}),
    function(req, res){
      res.redirect(req.session.redirect || '/');
      delete req.session.redirect;
    }
  );


  app.get('/auth/twitter', function(req, res, next){
      req.session.redirect = req.query.redirect;
      next();
    }, passport.authenticate('twitter')
  );

  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }),
    function(req, res){
      res.redirect(req.session.redirect || '/');
      delete req.session.redirect;
    }
  );

  app.get('/auth/google', function(req, res, next){
      req.session.redirect = req.query.redirect;
      next();
    }, passport.authenticate('google', {scope:
      ['profile','https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/plus.circles.read'],
      accessType: 'offline', approvalPrompt: 'force'})
  );


  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res){
      res.redirect(req.session.redirect || '/');
      delete req.session.redirect;
    }
  );

};
