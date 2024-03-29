require('newrelic');

var config = require('../config');
var morgan = require('morgan');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var hdfvrconfig = require('./hdfvrconfig');
var favicon = require('serve-favicon');
var auth = require('http-auth');
var app = express();
var bugsnag = require('bugsnag');

bugsnag.register("c7e5fc6a8317cdaecab5d65b4286c825");

var basic = auth.basic({
    realm: 'Restricted',
    file: __dirname + '/../data/users.htpasswd'
});


app.use(favicon(__dirname + '/assets/img/favicon.ico'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
	secret:'yeplive-secret'
}));


app.use(express.static(__dirname+'/assets'));

app.use(morgan('dev'));

app.set('view engine', 'ejs');

app.get('/test', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.sendFile(__dirname+'/test.html');
});


app.get('/avc_settings.php', function(req, res){
	var streamName = req.query.recorderId;
	var params = {
		streamName: streamName
	};
	res.send(hdfvrconfig.generateConfig(params));	
});

app.use(express.static(__dirname+'/assets/hdfvr'));

app.use('/api', require('./api'));

require('./auth')(app);

//Match all strings
// Match all strings
app.get(/^[^.]*$/, function(req, res){
	var url = req.url.split('/');
	var id;

	if(url[1] === 'watch'){
		id = url[2];
	}

	if(id){
		console.log(id);
		request.get(config.yeplive_api.host+'api/v1/yeps/'+id, function(err, response, body){
			if(err || response.statusCode !== 200){
				console.log(err);
				console.log(response.statusCode);
				return res.render('index', {yep:''});
			}
			var yep = JSON.parse(body);

			if(yep.staging === 1){
				return res.redirect('/404');	
			}

			var video_path;
			var playback_type;
			
			if(yep.is_web){
				video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
				playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
			} else {
				video_path = (yep.vod_enable) ? yep.vod_path : yep.stream_url;
				playback_type = (yep.vod_enable) ? 'video/mp4' : 'application/x-mpegURL';
			}

			var data = {
				yep : yep,
				video_path : video_path.replace('http', 'https'),
				playback_type : playback_type
			};
			var tmp = data.yep.image_path.split('/');
			tmp[4] = 'r_'+tmp[4];
			data.yep.rotated_image_path = tmp.join('/');

			res.render('index', data);
		});
	} else {
		res.render('index', {yep:''});
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
