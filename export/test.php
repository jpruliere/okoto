<?php
	$curl_session = curl_init("http://localhost/");
	curl_setopt($curl_session, CURLOPT_RETURNTRANSFER, true);
	$page = curl_exec($curl_session);
	curl_close($curl_session);
	echo getcwd();
?>
