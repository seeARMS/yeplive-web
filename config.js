module.exports = (function(){
	return {
		PORT: 3000,
		host: process.env['HOST'] || 'http://yeplive-production.elasticbeanstalk.com/',
		yeplive_api: {
			host: process.env['YEPLIVE_HOST'] || 'http://yplv.tv/'
		}	
	}
}());
