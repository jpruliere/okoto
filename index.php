<?php
	if (isset($_GET['okoto'])) {
		if (strpos($_GET['okoto'],"@") !== false) { // mode Ouvrir
			$var = explode("@",$_GET['okoto']);
			$thefile = $var[0].".php";
			$thecolors = file_get_contents("saves/".$_GET['okoto'].".oko");
			$thecolors = "'".str_replace(",","','",$thecolors)."'";
		} else {
			$thefile = $_GET['okoto'].".php";
		}
	}
	$files = array();
	$handle = opendir("resources");
	while ($file = readdir($handle)) {
		if ($file != "." && $file != ".." && $file != "blank.css") {
			if (isset($_GET['okoto'])) {
				if ($file == $thefile) {
					$i = count($files);
				}
			}
			$files[] = $file;
		}
	}
	$n = count($files)-1; // dernier indice du tableau
	if (!isset($_GET['okoto'])) {
		$i = rand(0,$n); // indice au hasard
		$thefile = $files[$i];
	}
	if ($i == 0) { // si i vaut 0, l'okoto précédent est le dernier (n)
		$prev = $files[$n];
	} else {
		$prev = $files[$i-1];
	}
	$prev = basename($prev, ".php");
	if ($i == $n) { // si i vaut n, l'okoto suivant est le premier (0)
		$next = $files[0];
	} else {
		$next = $files[$i+1];
	}
	$next = basename($next, ".php");
	if (isset($_GET['colors'])) { // mode Visualiser
		$thecolors = file_get_contents("saves/".$_GET['colors'].".oko");
		$thecolors = "'".str_replace(",","','",$thecolors)."'";
		$prev .= "&colors=".$_GET['colors'];
		$next .= "&colors=".$_GET['colors'];
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">
	<head>
		<title>Okoto | Coloriez - Sauvegardez - Partagez</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="Content-Language" content="fr" />
		<meta http-equiv="Content-Script-Type" content="text/javascript" />
		<script language="javascript" type="text/javascript">
			var thefile = "resources/<?php echo $thefile; ?>";
		</script>
		<script language="javascript" type="text/javascript" src="okoto.js"></script>
		<link rel="stylesheet" href="okoto.css"/>
	</head>
	<body onload="place_interface(<?php if (isset($thecolors)) { echo "[$thecolors]"; } ?>);" onkeyup="key_manager(event);">
		<iframe id="okoto_svg"></iframe>
		<!-- okoto red green blue -->
		<div id="okoto_left" class="okomponent" name="red">
			<h3>Rouge</h3>
			<div id="okoto_red1" class="okometer vertical"></div>
			<div id="okoto_red2" class="okometer vertical"></div>
			<div id="okoto_red3" class="okometer vertical"></div>
			<div id="okoto_red4" class="okometer vertical"></div>
			<img src="img/grec.png" id="okoto_label_red1" class="okocasque"/>
			<img src="img/gaulois.png" id="okoto_label_red2" class="okocasque"/>
			<img src="img/nordique.png" id="okoto_label_red3" class="okocasque"/>
			<img src="img/espagnol.png" id="okoto_label_red4" class="okocasque"/>
		</div>
		<div id="okoto_top" class="okomponent" name="green">
			<h3>Vert</h3>
			<div id="okoto_green1" class="okometer horizontal"></div>
			<div id="okoto_green2" class="okometer horizontal"></div>
			<div id="okoto_green3" class="okometer horizontal"></div>
			<div id="okoto_green4" class="okometer horizontal"></div>
			<img src="img/grec.png" id="okoto_label_green1" class="okocasque vert"/>
			<img src="img/gaulois.png" id="okoto_label_green2" class="okocasque vert"/>
			<img src="img/nordique.png" id="okoto_label_green3" class="okocasque vert"/>
			<img src="img/espagnol.png" id="okoto_label_green4" class="okocasque vert"/>
		</div>
		<div id="okoto_right" class="okomponent" name="blue">
			<h3>Bleu</h3>
			<div id="okoto_blue1" class="okometer vertical"></div>
			<div id="okoto_blue2" class="okometer vertical"></div>
			<div id="okoto_blue3" class="okometer vertical"></div>
			<div id="okoto_blue4" class="okometer vertical"></div>
			<img src="img/grec.png" id="okoto_label_blue1" class="okocasque"/>
			<img src="img/gaulois.png" id="okoto_label_blue2" class="okocasque"/>
			<img src="img/nordique.png" id="okoto_label_blue3" class="okocasque"/>
			<img src="img/espagnol.png" id="okoto_label_blue4" class="okocasque"/>
		</div>
		<div id="okoto_bottom" class="okomponent">
			<div id="okoto_name"><?php echo basename($thefile,".php"); ?></div>
			<div id="okoto_form"><input type="text" onclick="if (this.value == 'votre titre') { this.value = ''; }" onkeyup="return event_killer(event);" value="votre titre" id="okoto_title"/><button onclick="save_colors();" id="okoto_save" class="okotton">Sauvegarder</button></div>
		</div>
		<div id="okoto_left_corner" class="okomponent">
			<button id="okoto_help" title="qu'est-ce que c'est ?" onclick="document.getElementById('okoto_helper').style.display = 'block';" class="okotton">?</button>
		</div>
		<div id="okoto_right_corner" class="okomponent">
			<a href="menu.php"><button id="okoto_up" title="aller au menu" class="okotton"><img src="img/up.png"/></button></a>
			<a href="?okoto=<?php echo $prev; ?>"><button id="okoto_prev" title="okoto précédent" class="okotton"><img src="img/prev.png"/></button></a>
			<a href="?okoto=<?php echo $next; ?>"><button id="okoto_next" title="okoto suivant" class="okotton"><img src="img/next.png"/></button></a>
		</div>
		<div id="okoto_helper">
			<div id="okoto_overlay"></div>
			<div id="okoto_center" class="okomponent">
				<button id="okoto_tip_prev" title="question précédente" onclick="change_question(parseInt(document.getElementById('current_question').value)-1);" class="okotton"><img src="img/tip_prev.png"/></button>
				<button id="okoto_tip_next" title="question suivante" onclick="change_question(parseInt(document.getElementById('current_question').value)+1);" class="okotton"><img src="img/tip_next.png"/></button>
				<input type="hidden" id="current_question" value="0"/>
				<h5>Okoto ?</h5>
				<p>Okoto est un nuancier web interactif. Il vous permet en quelques clics de trouver des ensembles de couleurs en visualisant en temps réel le résultat sur le dessin de votre choix. Laissez vagabonder votre imagination, osez la couleur ! Faites la vibrer, résonner, danser...</p>
				<h5>Comment ça marche ?</h5>
				<p>Devant vous se trouve la zone de dessin, couvrant à quelques pixels près la superficie de la fenêtre. Par dessus, dans les coins, se trouvent l'interface. En bas, dans la partie gauche du cadre, vous voyez le nom de l'okoto que vous êtes en train de personnaliser : <?php echo basename($thefile,".svg"); ?>. A droite du cadre, le champ "votre titre" vous invite à saisir un titre pour cette personnalisation, afin de la sauvegarder. En haut à gauche de la fenêtre, le bouton d'aide sur lequel vous avez cliqué pour afficher ce cadre. En haut à droite, les boutons de navigation entre les différents okotos et le bouton pour accéder au menu. Enfin, à gauche, en haut et à droite, vous trouverez les nuanciers, réglés sur les couleurs principales de l'okoto.</p>
				<h5>La zone de dessin ne couvre pas toute la superficie de la fenêtre</h5>
				<p>Rafraichissez la page en appuyant par exemple sur la touche F5 ou sur le bouton "Actualiser"/"Rafraichir" de votre navigateur, ou encore en cliquant <a href="javascript:window.location.reload();">ici</a>.</p>
				<h5>Comment changer une couleur ?</h5>
				<p>Une couleur, telle que perçue par l'oeil humain, est l'interprétation différentielle par le cerveau d'un signal envoyé par les cônes de l'oeil qui, par convolution du spectre de la lumière qui pénètre l'oeil, génèrent une intensit... Une couleur est l'union de 3 intensités lumineuses : le rouge, le vert et le bleu. Ces intensités évoluent entre deux seuils, un minimum (0) et un maximum (255). En faisant varier l'intensité d'un composant, on fait varier la couleur. Le violet est par exemple composé d'une intensité rouge au tiers du maximum (~85), d'une intensité verte nulle (0) et d'une intensité bleue aux deux tiers du maximum (~170). Chaque couleur présente sur l'okoto est ici représentée par un casque : A gauche, vous trouverez l'intensité de la composante rouge des quatre couleurs principales ; en haut, l'intensité de la composante verte et à droite, celle de la composante bleue.</p>
				<h5>Comment régler une couleur ?</h5>
				<p>Une règle à connaître est que l'union des trois intensités maximales donne la couleur blanche, celle des trois minimales donne du noir. Ainsi, en règle générale, plus les intensités sont fortes, plus la couleur sera claire. Si vous avez trouvé une couleur et que vous souhaitez l'éclaircir, rajoutez simplement quelques degrés d'intensité à chaque composante. Pour l'assombrir, vous savez ce qu'il vous reste à faire.</p>
				<h5>L'okoto comporte d'autres couleurs que j'aimerais changer</h5>
				<p>En appuyant sur la touche 'C', vous pouvez alterner entre les nuanciers primaire et secondaire. Le primaire contient les quatre couleurs les plus présentes dans l'okoto, le secondaire les quatre suivantes selon ce même classement.</p>
				<h5>L'interface me gène, je ne vois pas certaines parties de l'okoto</h5>
				<p>En appuyant sur la touche 'I', vous pouvez cacher l'interface. Un autre appui la fera réapparaître.</p>
				<button id="okoto_tip_close" title="j'ai tout compris" onclick="document.getElementById('okoto_helper').style.display = 'none';" class="okotton">Fermer l'aide</button>
			</div>
		</div>
	</body>
</html>
