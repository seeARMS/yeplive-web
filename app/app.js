var config = require('../config');
var morgan = require('morgan');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var hdfvrconfig = require('./hdfvrconfig');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
	secret:'yeplive-secret'
}));

app.use(express.static(__dirname+'/assets/hdfvr'));

app.use(express.static(__dirname+'/assets'));

app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.get('/',function(req, res){
	res.render('index', {});
});

app.get('/avc_settings.php', function(req, res){
	var streamName = req.query.recorderId;
	var params = {
		streamName: streamName
	};
	res.send(hdfvrconfig.generateConfig(params));	
});

app.use('/api', require('./api'));
require('./auth')(app);

//Match all strings
app.get(/^[^.]*$/, function(req, res){
	var name = req.url.replace('/','');
	if(name){
		request.get(config.yeplive_api+'api/v1/yeps/by-hash/'+name, function(err, response, body){
			if(err || response.statusCode !== 200){
				return res.render('index', {});
			}
			var yep = JSON.parse(body);
			res.render('index', yep);
		});
	} else {
		res.render('index', {});
	}
});

/*
app.get('*', function(req, res){
	res.sendFile(__dirname+'/index.html');
});


/*
app.get('/build', function(req, res){
	res.sendFile(__dirname+'/build.html');
});

app.get('/test', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.sendFile(__dirname+'/test.html');
});

app.get('/watch', function(req, res){
	res.sendFile(__dirname+'/watch.html');
});

app.get('/token', function(req, res){
	res.json(req.session);
});
*/

app.listen(process.env.PORT || config.PORT, function(){
	console.log('Yeplive web client now running on port 3000');
});
