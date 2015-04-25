<?php
//this file is called by the videorecorder.swf file when the [SAVE] button is pressed

//videorecorder.swf sends the name of the stream via the GET variable named "name"
$photoName = $_GET["name"];

//the recorderId var contais the value of the recorderId fash var sent from VideoRecorder.html to the swf file, you can sue it here if you want
$recorderId= $_GET["recorderId"];

//prevent from injections
$supported_extensions = array(
    'jpg',
    'jpeg'
);

$ext = strtolower(pathinfo($photoName, PATHINFO_EXTENSION)); // Using strtolower to overcome case sensitive
if (in_array($ext, $supported_extensions)) {
    //it's an image so we continue
    
    //we make the snapshots folder if it does not exists
    if(!is_dir("snapshots")){
        $res = mkdir("snapshots",0777); 
    }

    //iwe save the image to disk
    if(isset($GLOBALS["HTTP_RAW_POST_DATA"])){
        $image = fopen("snapshots/".$photoName,"wb");
        fwrite($image , $GLOBALS["HTTP_RAW_POST_DATA"] );
        fclose($image);
    }

    die("save=ok");
} else {
    //echo "save=failed" to tell the recorder the snapshot saving process has failed
	die("save=failed");
}
?>