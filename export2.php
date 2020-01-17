<?php
	$export = 0;
	$var = explode("@",$_GET['okoto']);
	$thefile = $var[0].".php";
	$thecolors = file_get_contents("saves/".$_GET['okoto'].".oko");
	$thecolors = "'".str_replace(",","','",$thecolors)."'";
	include "resources/".$thefile;
?>
