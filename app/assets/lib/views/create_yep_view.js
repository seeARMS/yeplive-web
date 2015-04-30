define(['jquery',
				'underscore',
				'backbone',
				'swfobject',
				'lib/api',
				'text!lib/templates/yep_preview.html',
				'text!lib/templates/yep_recording.html'
				],
	function($, _, Backbone, nope,API, previewTpl, recordingTpl){

	var CreateYepView = Backbone.View.extend({
		events:{
			'click .js-start': function(){
				var self = this;
				API.post('/yeps',{
					description: 'nice',
					latitude: 45.5017,
					longitude: -73.5673
				}, window.localStorage.getItem('token'), function(err, res){
					if(err){
						console.log(err);
						return alert('error starting recording');	
					} 
					console.log(res);
					self.renderRecorder(res);	
				});
			},
			'click .js-end': function(){

			}
		},
		previewTpl: _.template(previewTpl),
		recordingTpl: _.template(recordingTpl),
		initialize: function(){	
			this.renderPreview();
		},
		renderPreview: function(){	
			this.$el.html(this.previewTpl());
			setupHDFVR('preview');
		},
		renderRecorder: function(res){
			this.$el.html(this.recordingTpl(res));
			window.onFlashReady = function(id){
				document.getElementById('VideoRecorder').record();
			};
			setupHDFVR(res.stream_name);
		}
	});

var setupHDFVR = function(streamName){
			console.log(streamName);
			var flashvars = {
				userId : "XXY",
				qualityurl: "audio_video_quality_profiles/640x480x30x90.xml",
				recorderId: streamName,
				sscode: "php",
				lstext : "Loading..."	
			};
			var params = {
				quality : "high",
				bgcolor : "#18191a",
				play : "true",
				loop : "false",
				allowscriptaccess: "sameDomain"
			};
			var attributes = {
				name : "VideoRecorder",
				id :   "VideoRecorder",
				align : "middle"
			};
			
			var mobile = false;
			var ua = navigator.userAgent.toLowerCase();
			if(navigator.appVersion.indexOf("iPad") != -1 || navigator.appVersion.indexOf("iPhone") != -1 || ua.indexOf("android") != -1 || ua.indexOf("ipod") != -1 || ua.indexOf("windows ce") != -1 || ua.indexOf("windows phone") != -1){
				mobile = true;
			}
			
			if(mobile == false){
				swfobject.embedSWF("/hdfvr/VideoRecorder.swf", "recorder", "640", "480", "10.3.0", "", flashvars, params, attributes);
			}else{
				//do nothing
			}
	};



	return CreateYepView;

});
