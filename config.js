module.exports = (function(){
	return {
		PORT: 3000,
		yeplive_api: {
			host: process.env['YEPLIVE_HOST'] || 'http://yeplive.elasticbeanstalk.com/' //'http://development-vriepmhkv2.elasticbeanstalk.com/'
		}	
	}
}());
