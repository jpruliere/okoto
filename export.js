Color.prototype.name = "";
Color.prototype.hex = "";
Color.prototype.red = 0;
Color.prototype.green = 0;
Color.prototype.blue = 0;
Color.prototype.occur = 1; // pour le comptage : nombre d'occurences de la couleur dans le svg
Color.prototype.toString = function() { // pour le comptage : pour la comparaison rapide de la couleur en cours d'analyse avec les couleurs déjà recensées
	return this.hex;
}
Color.prototype.refreshHex = function() {
	this.hex = "#"+cdechex(this.red)+cdechex(this.green)+cdechex(this.blue);
}
Color.prototype.refreshRays = function() {
	this.red = parseInt(this.hex.substr(1,2),16);
	this.green = parseInt(this.hex.substr(3,2),16);
	this.blue = parseInt(this.hex.substr(5,2),16);
}

String.prototype.startsWith = function(char) {
	if (char.length == 1) { // just a character
		return (this.charAt(0) == char);
	} else { // a string
		var ret = true;
		for (var i = 0; i < char.length && ret; i++) {
			ret = (this.charAt(i) == char.charAt(i));
		}
		return ret;
	}
}

function Color(name, value) {
	this.name = name;
	this.red = parseInt(value.substr(1,2),16);
	this.green = parseInt(value.substr(3,2),16);
	this.blue = parseInt(value.substr(5,2),16);
	this.hex = value;
}

function sort_colors(a,b) {
	return b.occur - a.occur;
}

function cdechex(number) {
	return (number < 16) ? "0" + parseInt(number, 10).toString(16).toUpperCase() : parseInt(number, 10).toString(16).toUpperCase();
}

var colors = new Array();

window.onload = rank_colors;

function rank_colors() {
	var colorstring = document.getElementsByTagName('desc')[0].firstChild.nodeValue;
	var colorset = eval("["+colorstring+"]");
	var svg = document.rootElement;
	svg_css = svg.ownerDocument.styleSheets[0];
	function scan_node(node) {
		if (node.hasChildNodes()) {
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].nodeName != "#text") {
					scan_node(node.childNodes[i]);
				}
			}
		}
		
		if (!node.hasAttribute("fill") && !node.hasAttribute("stop-color") && node.nodeName != "defs" && node.nodeName != "pattern" && node.nodeName != "g" && node.nodeName != "desc" && node.nodeName != "linearGradient" && node.nodeName != "radialGradient" && node != svg) { // under those conditions, it is considered as a default colored node
			node.setAttribute("fill","#000000");
		}
		if (node.hasAttribute("fill") || node.hasAttribute("stop-color")) {
			if (node.hasAttribute("fill")) {
				if (node.getAttribute("fill") == "none" || node.getAttribute("fill").startsWith("url(")) {
					return;
				}
			}
			var color;
			if (node.hasAttribute("stop-color")) {
				color = node.getAttribute("stop-color");
			} else {
				color = node.getAttribute("fill");
			}
			var exists = false;
			var index = -1;
			// vérifier l'existence de la couleur dans le tableau
			for (var i = 0; i < colors.length && !exists; i++) {
				if (color == colors[i].toString()) {
					colors[i].occur++;
					exists = true;
					index = i;
				}
			}
			// si elle n'existe pas, la créer et associer la règle
			if (!exists) {
				index = colors.length;
				colors.push(new Color("svg"+colors.length,color));
				svg_css.insertRule("."+colors[index].name+" { fill: "+colors[index].hex+"; stop-color: "+colors[index].hex+"; }",svg_css.cssRules.length);
			}
			//ajouter la classe correspondante au noeud
			node.setAttribute('class',colors[index].name);
		}
	}
	scan_node(svg);
	colors.sort(sort_colors);
	colors.splice(8,colors.length-8); // from the 8th element, dump everything except 8 elements from the array
	// changement de couleurs
	for (var i = 0; i < colorset.length && i < colors.length; i++) {
		colors[i].hex = colorset[i];
		//colors[i].refreshRays();
		//svg_css.insertRule("."+colors[i].name+" { fill: "+colors[i].hex+"; stop-color: "+colors[i].hex+"; }",svg_css.cssRules.length);
	}
	function scan_back_node(node) {
		if (node.hasChildNodes()) {
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].nodeName != "#text") {
					scan_back_node(node.childNodes[i]);
				}
			}
		}
		if (node.hasAttribute("class")) {
			var isMajor = false;
			for (var i = 0; i < colors.length && !isMajor; i++) {
				if (node.getAttribute("class") == colors[i].name) {
					// remettre fill à jour
					if (node.hasAttribute("stop-color")) {
						node.setAttribute("stop-color",colors[i]);
					} else {
						node.setAttribute("fill",colors[i]);
					}
					isMajor = true;
				}
			}
			node.removeAttribute("class");
		}
	}
	scan_back_node(svg);
	document.removeChild(document.firstChild);
	svg.removeChild(svg.firstElementChild);
	svg.removeChild(svg.firstElementChild);
	alert("L'okoto est prêt à être sauvegardé. Appuyez sur Ctrl+S pour ouvrir la boite de dialogue de sauvegarde. Ouvrez-le ensuite avec un logiciel de dessin vectoriel comme Adobe Illustrator ou Inkscape pour l'exploiter.");
}
