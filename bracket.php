<?php

$json = array();

connect_db();

$all  = "SELECT name FROM volunteers";

$result = mysql_query($all);

while($row = mysql_fetch_row($result)) {
	array_push($json, $row[0]);
}
mysql_close();

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