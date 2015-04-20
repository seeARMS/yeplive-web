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

app.use('/api', require('./api'));
require('./auth')(app);

app.listen(process.env.PORT || config.PORT, function(){
	console.log('Yeplive web client now running on port 3000');
});
