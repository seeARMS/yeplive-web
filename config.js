module.exports = (function(){
	return {
		PORT: 3000,
		yeplive_api: {
			host: process.env['YEPLIVE_HOST'] || 'http://localhost:8888/yeplive/yeplive-api/public/'
		}	
	}
}());
