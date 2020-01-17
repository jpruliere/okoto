<?php
	header("Content-Type: image/svg+xml");
	include "color.php";
	$colors = array();
	$thecolors = file_get_contents("../saves/".$_GET['okoto'].".oko");
	$colorset = explode(",",$thecolors);
	$var = explode("@",$_GET['okoto']);
	$thefile = $var[0].".php";
	$curl_session = curl_init("http://localhost/okoto/resources/".str_replace(" ","%20",$thefile));
	curl_setopt($curl_session, CURLOPT_RETURNTRANSFER, true);
	$page = curl_exec($curl_session);
	curl_close($curl_session);
	$thefile = $_GET['okoto'].".svg";
	file_put_contents($thefile,$page);
	$svg = DOMDocument::load($thefile)->documentElement;
	$svg->ownerDocument->validate();
	$svg->ownerDocument->recover = true;
	
	function scan_node($node) {
		global $colors, $svg;
		if ($node->hasChildNodes()) {
			for ($i = 0; $i < $node->childNodes->length; $i++) {
				if ($node->childNodes->item($i)->nodeType != 3) {
					scan_node($node->childNodes->item($i));
				}
			}
		}
		if (!$node->hasAttribute("fill") && !$node->hasAttribute("stop-color") && $node->nodeName != "defs" && $node->nodeName != "pattern" && $node->nodeName != "g" && $node->nodeName != "desc" && $node->nodeName != "linearGradient" && $node->nodeName != "radialGradient" && $node != $svg) {
			$node->setAttribute("fill","#000000");
		}
		if ($node->hasAttribute("fill") || $node->hasAttribute("stop-color")) {
			if ($node->hasAttribute("fill")) {
				if ($node->getAttribute("fill") == "none" || strpos($node->getAttribute("fill"), "url") === 0) {
					return;
				}
			}
			if ($node->hasAttribute("stop-color")) {
				$color = $node->getAttribute("stop-color");
			} else {
				$color = $node->getAttribute("fill");
			}
			$exists = false;
			for ($i = 0; $i < count($colors) && !$exists; $i++) {
				if ($color == $colors[$i]->toString()) {
					$colors[$i]->occur++;
					$exists = true;
				}
			}
			if (!$exists) {
				$colors[] = new Color("svg"+count($colors),$color);
			}
		}
	}
	scan_node($svg);
	usort($colors, "sort_colors");
	array_splice($colors, 8);
	
	function scan_back_node($node) {
		global $colors, $svg, $colorset;
		if ($node->hasChildNodes()) {
			for ($i = 0; $i < $node->childNodes->length; $i++) {
				if ($node->childNodes->item($i)->nodeType != 3) {
					scan_back_node($node->childNodes->item($i));
				}
			}
		}
		if ($node->hasAttribute("fill") || $node->hasAttribute("stop-color")) {
			$replaced = false;
			if ($node->hasAttribute("fill")) {
				for ($i = 0; $i < count($colors) && !$replaced; $i++) {
					if ($node->getAttribute("fill") == $colors[$i]->hex) {
						$node->setAttribute("fill",$colorset[$i]);
						$replaced = true;
					}
				}
			} else {
				for ($i = 0; $i < count($colors) && !$replaced; $i++) {
					if ($node->getAttribute("stop-color") == $colors[$i]->hex) {
						$node->setAttribute("stop-color",$colorset[$i]);
						$replaced = true;
					}
				}
			}
		}
	}
	scan_back_node($svg);
	$svg->ownerDocument->fomatOutput = true;
	$svg->ownerDocument->preserveWhiteSpace = false;
	$svg->ownerDocument->save($thefile);
	echo file_get_contents($thefile);
	unlink($thefile);
	/*$export = 0;
	$var = explode("@",$_GET['okoto']);
	$thefile = $var[0].".php";
	$thecolors = file_get_contents("saves/".$_GET['okoto'].".oko");
	$thecolors = "'".str_replace(",","','",$thecolors)."'";
	include "resources/".$thefile;*/
?>
