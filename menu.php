<?php
	$files = array();
	$handle = opendir("saves");
	while ($file = readdir($handle)) {
		if ($file != "." && $file != "..") {
			$files[] = basename($file,".oko");
		}
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
			var scroll = document.createElement("select");
			var blank = document.createElement('option');
			blank.setAttribute('disabled','disabled');
			blank.setAttribute('selected','selected');
			scroll.appendChild(blank);
			var options = [<?php foreach ($files as $file) { echo "\"$file\", "; } ?>""];
			options.pop();
			for (var i = 0; i < options.length; i++) {
				var option = document.createElement('option');
				option.setAttribute('value',options[i]);
				option.appendChild(document.createTextNode(options[i]));
				scroll.appendChild(option);
			}
			scroll.onchange = function() {
				if (this.parentNode.id == "okoto_link_red") {
					window.location = "./?okoto="+this.value;
				} else if (this.parentNode.id == "okoto_link_green") {
					window.location = "./?okoto="+this.value.split("@")[0]+"&colors="+this.value;
				} else {
					window.location = "./export/"+this.value+".svg";
				}
			}
		</script>
		<script language="javascript" type="text/javascript" src="okoto.js"></script>
		<link rel="stylesheet" href="okoto.css"/>
	</head>
	<body id="okoto_menu_body" onload="place_menu();">
		<iframe id="okoto_svg"></iframe>
		<div id="okoto_menu" class="okomponent">
			<div id="okoto_menu_title">
				<span id="okoto_menu_letter0">O</span><span id="okoto_menu_letter1">K</span><span id="okoto_menu_letter2">O</span><span id="okoto_menu_letter3">T</span><span id="okoto_menu_letter4">O</span>
			</div>
			<div id="okoto_menu_links">
				<p id="okoto_link_red" onclick="getScroll(this);">Ouvrir </p>
				<p id="okoto_link_green" onclick="getScroll(this);">Visualiser </p>
				<p id="okoto_link_blue" onclick="getScroll(this);">Exporter </p>
			</div>
		</div>
		<div id="okoto_left_corner" class="okomponent">
			<button id="okoto_help" title="qu'est-ce que c'est ?" onclick="document.getElementById('okoto_helper').style.display = 'block';" class="okotton">?</button>
		</div>
		<div id="okoto_helper">
			<div id="okoto_overlay"></div>
			<div id="okoto_center" class="okomponent">
				<button id="okoto_tip_prev" title="question précédente" onclick="change_question(parseInt(document.getElementById('current_question').value)-1);" class="okotton"><img src="img/tip_prev.png"/></button>
				<button id="okoto_tip_next" title="question suivante" onclick="change_question(parseInt(document.getElementById('current_question').value)+1);" class="okotton"><img src="img/tip_next.png"/></button>
				<input type="hidden" id="current_question" value="0"/>
				<h5>C'est quoi ce menu ?</h5>
				<p>Le menu propose trois fonctionnalités : Ouvrir qui permet de voir un okoto personnalisé et sauvegardé par vous ou par un autre utilisateur d'Okoto ; Visualiser qui permet de garder les couleurs de la palette sauvegardée lorsque vous passez d'un okoto à un autre ; Exporter qui permet d'ouvrir le fichier SVG correspondant avec les couleurs sauvegardées. Vous pouvez alors sauvegarder ce fichier en appuyant sur Ctrl-S ou en cliquant sur Enregistrer sous dans le menu du clic droit ou dans le menu du navigateur.</p>
				<h5>A quoi sert un SVG ?</h5>
				<p>Un fichier SVG représente un dessin vectoriel, il faut donc l'ouvrir avec un logiciel de dessin vectoriel comme Adobe Illustrator ou Inkscape. Vous pourrez alors l'exporter dans un format pixellisé (format classique des images : JPG, PNG, BMP), à la taille que vous souhaitez.</p>
				<button id="okoto_tip_close" title="j'ai tout compris" onclick="document.getElementById('okoto_helper').style.display = 'none';" class="okotton">Fermer l'aide</button>
			</div>
		</div>
	</body>
</html>
