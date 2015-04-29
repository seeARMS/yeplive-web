module.exports = (function(){
	return {
		PORT: 80,
		yeplive_api: {
			host: process.env['YEPLIVE_HOST'] || 'http://development-vriepmhkv2.elasticbeanstalk.com/'
		}	
	}
}());
