<?php
	if (isset($_POST['name']) && isset($_POST['title']) && isset($_POST['colors'])) {
		if (file_exists("saves/".$_POST['name']."@".$_POST['title'].".oko")) {
			echo "Une palette portant ce nom existe déjà pour cet okoto";
			exit(0);
		}
		file_put_contents("saves/".$_POST['name']."@".$_POST['title'].".oko",$_POST['colors']);
		echo "Okoto sauvegardé avec succès";
	}
?>
