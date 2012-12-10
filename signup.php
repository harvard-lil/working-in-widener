<?php

$name = $_REQUEST['name'];
$json = array();

$json['thanks'] = "Thanks!  We'll see you at the party.  Until then, <a href='index.html'>practice your skills</a>.";

connect_db();

$add  = "INSERT INTO volunteers (id, name) VALUES ('', '$name')";

mysql_query($add) or die(mysql_error());

$json = json_encode($json);
header('Content-type: application/json');
echo $json;


function connect_db(){
  $json = file_get_contents("config.json");
  $config = json_decode($json, true);
  
	$hostName = $config['host_name'];
	$userName = $config['user_name'];
	$pw = $config['pw'];
			
	if(!($link=mysql_pconnect($hostName, $userName, $pw))) 
	{
		//echo "before error<br />";
		//echo "error connecting to host";
		exit;
	}
	mysql_select_db($config['db']);
}

?>