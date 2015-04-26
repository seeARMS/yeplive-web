var config = require('../config');
var morgan = require('morgan');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var hdfvrconfig = require('./hdfvrconfig');

//757029635679-3t8dr78cejogedbv3neac7gjckeb2ilb

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
	secret:'yeplive-secret'
}));
app.use(morgan('combined'))

app.use(express.static(__dirname+'/assets'));

app.get('/',function(req, res){
	res.sendFile(__dirname+'/index.html');
});

app.get('/token', function(req, res){
	res.json(req.session);
});

app.get('/avc_settings.php', function(req, res){
	var streamName = req.query.recorderId;
	var params = {
		streamName: streamName
	};
	res.send(hdfvrconfig.generateConfig(params));	
});
app.use(express.static(__dirname+'/assets/hdfvr'));
app.get('/new', function(req, res){
	res.sendFile(__dirname+'/index.html');
});

app.use('/api', require('./api'));
require('./auth')(app);
/*
app.get('*', function(req, res){
	res.sendFile(__dirname+'/index.html');
});
*/

app.listen(process.env.PORT || config.PORT, function(){
	console.log('Yeplive web client now running on port 3000');
});
