<?php

if(!is_dir("mobileRecordings")){
	$res = mkdir("mobileRecordings",0777); 
}

if(isset($_FILES["FileInput"]) && $_FILES["FileInput"]["error"]== UPLOAD_ERR_OK)
{
	$UploadDirectory	= 'mobileRecordings/'; 	

	//Note :if "memory_limit" , "upload_max_filesize" or post_max_size is set to low in "php.ini" it won't work. 
	
	if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])){
		die();
	}

	/*if ($_FILES["FileInput"]["size"] > 5242880){
		die("File size is too big!");
	}*/
	
	switch(strtolower($_FILES['FileInput']['type']))
	{
			case 'video/mp4':
			case 'video/quicktime':
				break;
			default:
				die('Unsupported File!');
	}
	
	$File_Name          = strtolower($_FILES['FileInput']['name']);
	$File_Ext           = substr($File_Name, strrpos($File_Name, '.')); 
	$Random_Number      = rand(0, 9999999999); 
	$NewFileName 		= "video_stream_".$Random_Number.$File_Ext; 
	
	if(move_uploaded_file($_FILES['FileInput']['tmp_name'], $UploadDirectory.$NewFileName ))
	   {
		die($NewFileName.'#Success! File Uploaded.');
	}else{
		die('error uploading File!');
	}
	
}
else
{
	die('Something wrong with upload! Is "upload_max_filesize" set correctly?');
}