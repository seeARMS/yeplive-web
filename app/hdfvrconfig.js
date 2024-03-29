module.exports = (function(){
	var generateConfig = function(params){
		console.log(params);
		console.log(params.streamName);
		var configParams = {};

		//connectionstring:String
		//desc: the rtmp connection string to the hdfvr application on your media server
		//values: 'rtmp://localhost/hdfvr/_definst_', 'rtmp://myfmsserver.com/hdfvr/_definst_', etc...
		//configParams['connectionstring']='rtmp://52.24.223.236:1935/cf/_definst_';
		configParams['connectionstring']='rtmp://52.24.223.236:1935/hdfvr/_definst_';
		
		//This variable is sent to videorecorder.swf via flash vars and sent to this Php script via GET/query string. 
		//To edit it's value look in the VideoRecorder.html file for "&recorderId=123", 123 is it's default value.
		//You can use this variabe to control the below variables that are sent back to HDFVR. Tehse variables are the main way to control/configure HDFVR.
		/*
		if(isset($_GET["recorderId"])){
			$recorderId = $_GET["recorderId"];
		}
		*/
		
		//languagefile:String
		//description: path to the XML file containing words and phrases to be used in the video recorder interface, use this setting to switch between languages while maintaining several language files
		//values: URL paths to the translation files
		//default: 'translations/en.xml'
		configParams['languagefile']='translations/en.xml';
		
		//qualityurl: String
		//desc: path to the .xml file describing video and audio quality to use for recording, this variable has higher priority than the qualityurl from flash vars
		//values: URL paths to the audio/video quality profile files
		//default: '' (the qualityurl flash var is being used)
		configParams['qualityurl']='';
		
		//maxRecordingTime: Number
		//desc: the maximum recording time in seconds
		//values: any number greater than 0;
		//default:120
		configParams['maxRecordingTime']= 86400; 
		
		//userId: String
		//desc: the id of the user logged into the website, not mandatory, this var is passed back to the save_video_to_db.php file via GET when the [SAVE] button in the recorder is pressed, this variable can also be passed via flash vars like this: videorecorder.swf?userId=XXX, but the value in this file, if not empty, takes precedence. If configParams["useUserId"]="true", the value of this variable is also used in the stream name.
		//values: strings or numbers will do
		//by default its empty: ""
		configParams['userId']='';
		
		//outgoingBuffer: Number
		//desc: Specifies how long the buffer for the outgoing audio/video data can grow before Flash Player starts dropping frames. On a high-speed connection, buffer time will not affect anything because data is sent almost as quickly as it is captured and there is no need to buffer it. On a slow connection, however, there might be a significant difference between how fast Flash Player can capture audio and video data data and how fast it can be sent to the client, thus the surplus needs to be buffered. HDFVR will increase the value specified here as much as possible (if the buffer fills more than 90% of the available buffer, we double the available buffer) to prevent Flash Player from dumping the data in the buffer when it's full.
		//values: 30,60,etc...
		//default:60
		configParams['outgoingBuffer']=0;
		
		//playbackBuffer: Number
		//desc: Specifies how much video time to buffer when (after recording a movie) you play it back
		//values: 1, 10,20,30,60,etc...
		//default:1
		configParams['playbackBuffer']= 1;
		
		//autoPlay: String
		//desc: weather the recorded video should play automatically after recording it or we should  wait for the user to press the PLAY button
		//values: false, true
		//default: 'false'
		configParams['autoPlay']='false';
		
		//deleteUnsavedFlv: String
		//desc: weather the recorded videos for which the user has not pressed [SAVE] will be deleted from the media server or not
		//values: false, true
		//default: 'false'
		configParams['deleteUnsavedFlv'] = 'false';
		
		//hideSaveButton:Number
		//desc: makes the [SAVE] button invisible. When the [SAVE] button is pressed the save_video_to_db.xxx script is called and the corresponding JS functions. The creation/existence of the new video file and corresponding snapshot do not depend on pressing this button.
		//An invisible SAVE button can be used to move the SAVE action to the HTML page where there can be other form fields that can be submitted together with the info about the vid.
		//When the SAVE button is hidden you can use the onUploadDone java script hook to get some info about the newly recorded flv file and redirect the user/enable a button on the HTML page/populate some hidden FORM vars/etc... .
		//NOTE: when hiding this button some functions/calls will never be performed: save_video_to_db.php will never be called, onSaveOk and onSaveFailed JS functions will not be called
		//values: 1 for hidden, 0 for visible
		//default: 0 (visible)
		configParams['hideSaveButton']=1;
		
		//onSaveSuccessURL:String
		//desc: when the [SAVE] button is pressed (if its enabled) save_video_to_db.php (or .asp) is called. If the save operation succeeds AND if this variable is NOT EMPTY, the user will be taken to the URL
		//values: any URL you want the user directed to after he presses the [Save] button
		//default: ""
		configParams["onSaveSuccessURL"]="";
		
		//snapshotSec:Number
		//desc: the snapshot is taken when the recording reaches this length/time
		//NOTE: THE SNAPSHOT IS SAVED TO THE WEB SERVER AS A JPG WHEN THE USER PRESSES THE SAVE BUTTON. If Save is not pressed the snapshot is not saved.
		//values: any number  greater or equal to 0,  if 0 then the snap shot is taken when the [REC] button is pressed
		//default: 5
		configParams["snapshotSec"] = 5;
		
		//snapshotEnable:Number
		//desc: if set to true the recorder will take a snapshot 
		//values: true or false
		//default: 'true'
		configParams["snapshotEnable"] = "false";
		
		//minRecordTime:Number
		//desc: the minimum number of seconds a recording must be in length. The STOP button will be disabled until the recording reaches this length! 
		//values: any number lower them maxRecordingTime
		//default: 5
		configParams["minRecordTime"] = 5;
		
		//backgroundColor:Hex number
		//desc: color of background area inside the video recorder around the video area
		//values: any color in hex format
		//default:0x990000 (dark red)
		configParams["backgroundColor"] = 0x18191a;
		
		//menuColor:Hex number
		//desc: the color of the lower area of the recorder containing the buttons and the scrub bar
		//values:any color in hex format
		//default:0x333333 (dark grey)
		configParams["menuColor"] = 0x333333;
		
		//radiusCorner:Number
		//desc: the radius of the 4 corners of the video recorder
		//values: 0 for no rounded corners, 4,8,16,etc...
		//default: 16
		configParams["radiusCorner"] = 0;
		
		//showFps:String
		//desc: Shows or hides the FPS counter
		//values: 'false' to hide it 'true' to show it
		//default: 'true'
		configParams["showFps"] = 'false';
		
		//recordAgain:String
		//desc:if set to true the user will be able to record again and again until he is happy with the result. If set to false he only has 1 shot!
		//values:'false' for one recording, 'true' for multiple recordings
		//default: 'true'
		configParams["recordAgain"] =  'false';
		
		//useUserId:String
		//desc:if set to 'true' the stream name will be {prefix}_{userId}_{timestamp_random} instead of {prefix}_{timestamp_random}. {userId} will be reaplced by HDFVR with the value of configParams['userId'] from this file.
		//values:'false' for not using the userId in the file name, 'true' for using it
		//default: 'false'
		configParams["useUserId"] =  'false';
		
		//streamPrefix:String
		//desc: adds a prefix to the video file name on the media server like this: {prefix}_{timestamp_random} or {prefix}_{userId}_{timestamp_random} if the useUserId option is set to true
		//values: a string
		//default: "videoStream_"
		configParams["streamPrefix"] = "videoStream_";
		
		//streamName:String
		//desc: By default the application generates a random name ({prefix}_{timestamp_random}) for the video file. If you want to use a certain name set this variable and it will overwrite the pattern {prefix}_{timestamp_random}. The stream extension (.flv , .mp4 or .f4v) should NOT be used in the stream name.
		//values: a string
		//default: ""
		configParams["streamName"] = params.streamName;
		
		//disableAudio:String
		//desc: By default the application records audio and video. If you want to disable audio recording set this var to 'true'.
		//values: 'false' to include audio in the recording, 'true' to record without audio
		//default: 'false'
		configParams["disableAudio"] = 'false';
		
		//chmodStreams:String
		//desc: If you want to change the permissions on the newly recorded video file after it is saved to the disk on the media server you can use this variable. This works only on Red5 and Wowza.
		//values: "0666","0777", etc.
		//default: ""
		configParams["chmodStreams"] = "";
		
		//padding:Number
		//desc: the padding between elements in the recorder in pixels
		//values: any number
		//default:2
		configParams["padding"]=0;
		
		//countdownTimer:String
		//desc: set to true if you want the timer to decrease from the upper limit (maxRecordingTime) down to 0
		//values: "true", "false"
		//defaut: "false"
		configParams["countdownTimer"]="false";
		
		//overlayPath:String
		//desc: realtive URL path to the image to be shown as overlay
		//values: any realtive path
		//defaut: "" //no overlay
		configParams["overlayPath"]="";
		
		//overlayPosition:Stringwhat the fuck is going on dude
		//desc: position of the overlay image mentioned above
		//values: "tr" for top right, "tl" for top left and "cen" for centered, no other positions are supported
		//defaut: "tr"
		configParams["overlayPosition"]="tr";
		
		//loopbackMic:String
		//desc: weather or not the sound should be also played back in the speakers/heaphones during recording
		//values: "true" for yes, "false" for no
		//defaut: "false"
		configParams["loopbackMic"]="false";
		
		//showMenu:String
		//desc: weather or not the bottom menu in the HDFVR shoud show, some people choose to control the HDFVR via JS and they do ot need the menu, when not using the menu you can decrease the height of HDFVR by 32 (3o is the height of the button 2 is the default padding value in this config file)
		//values: "true" to show, "false" to hide
		//default: "true"
		configParams["showMenu"]="false";
		
		//showTimer:String
		//desc: Show or hides the timer
		//values: 'false' to hide it 'true' to show it
		//default: 'true'
		configParams["showTimer"] = 'false';
		
		//showSoundBar:String
		//desc: Shows or hides the sound bar
		//values: 'false' to hide it 'true' to show it
		//default: 'true'
		configParams["showSoundBar"] = 'false';
		
		//flipImageHorizontally: String
		//desc: Shows the webcam feed flipped horizontally. The actual video file (.flv, .f4v or .mp4) will not contain a flipped image.
		//values: 'true' to flip it, 'false' to show the feed as it comes from the webcam
		//default: 'false'
		configParams["flipImageHorizontally"] = 'false';
		
		//hidePlayButton:Number
		//desc: This controls whether or not the play/pause button is visible in the controls menu of HDFVR
		//values: 1 for hidden, 0 for visible
		//default: 0 (visible)
		configParams['hidePlayButton']=1;
		
		//enablePauseWhileRecording:Number
		//desc: This controls whether or not HDFVR can be paused/resumed during a recording. Pausing the video on Red5 1.0.2 is known to cause issues with the consistency of the final recording produced
		//values: 1 for enabled, 0 for disabled
		//default: 0 (disabled)
		configParams['enablePauseWhileRecording']=0;
		
		//enableBlinkingRec:Number
		//desc: This controls whether or not HDFVR will display the Rec blinking animation while recording
		//values: 1 for enabled, 0 for disabled
		//default: 1 (enabled)
		configParams['enableBlinkingRec']=1;
		
		//microphoneGain:Number
		//desc: This controls the amount by which the microphone boosts the signal. Altough this value is applied and reflects the recording level, the setting does not update Flash Player's  "Record Volume" slider in Flash Player Settings > Microphone. This seems to be a bug in Flash Player.
		//values: 0 to 100
		//default: 50
		configParams['microphoneGain']=50;
		
		//allowAudioOnlyRecording:Number
		//desc: This controls whether or not HDFVR is permitted to record audio only when a webcam is missing and only a microphone is detected.
		//values:1 for enabled, 0 for disasbled
		//default: 1 (enabled)
		configParams['allowAudioOnlyRecording']=1;
		
		//enableFFMPEGConverting:Number
		//desc: This controls whether or not HDFVR will trigger server side the execution of FFMPEG converting once the stream finished uploading.
		//values:1 for enabled, 0 for disasbled
		//default: 0 (enabled)
		configParams['enableFFMPEGConverting'] = 0;
		
		//ffmpegCommand:String
		//desc: This sets the conversion command that will be executed with FFMPEG when enableFFMPEGConverting is set to 1. The command has the following pattern: "ffmpeg -i [THE_INPUT_FLV_FILE]  [codec parameters audio/video] [THE_OUTPUT_MP4_FILE]" . The [THE_INPUT_FLV_FILE] and [THE_OUTPUT_MP4_FILE] parts must not be changed, both the path to ffmpeg and to the video files will be detected and set automatically by the media server. Only the codec parameters will be taken into account. The command is expressed like this to put it more into context as opposed to just sending the codec parameters.
		//values:Example command: ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]
		//default: ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]
		configParams['ffmpegCommand'] = "ffmpeg -i [THE_INPUT_FLV_FILE] -c:v libx264 [THE_OUTPUT_MP4_FILE]";
		

		var data = '';
		data += 'donot=removethis&';	
		for(var key in configParams){
			data+=key+'='+configParams[key]+'&';
		}	
		return data.substring(0,data.length-1);
	};

	return {
		generateConfig: generateConfig
	}
}());
