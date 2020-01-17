/** util **/
Document.prototype.getElementsByClassAmong = function(_class,tag) {
	var tags = document.getElementsByTagName(tag);
	var result = new Array();
	for (var i = 0; i < tags.length; i++) {
		if (tags[i].getAttribute('class') != null) {
			if (tags[i].getAttribute('class').indexOf(_class) != -1) {
				result.push(tags[i]);
			}
		}
	}
	return result;
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

Element.prototype.addClass = function(_class) {
	this.setAttribute('class',(this.hasAttribute('class'))?this.getAttribute('class')+" "+_class:_class);
}

Element.prototype.removeClass = function(_class) {
	if (!this.hasAttribute('class')) return; // l'élément n'a pas de classe
	var index = this.getAttribute('class').indexOf(_class);
	if (index == -1) return; // le terme recherché n'est pas dans la chaîne classe
	if (_class == this.getAttribute('class')) { // le terme recherché est l'unique classe
		this.removeAttribute('class');
	} else if (index == 0) { // le terme est en premier dans la chaîne classe
		this.setAttribute('class',this.getAttribute('class').substr(_class.length+1)); // on enlève alors le terme et l'espace qui le suit
	} else { // le terme est au milieu ou en fin de chaîne
		this.setAttribute('class',this.getAttribute('class').split(" "+_class)[0] + this.getAttribute('class').split(" "+_class)[1]); // on enlève le terme et l'espace qui le précède
	}
}

HistoryAction.prototype.color_index = 0;
HistoryAction.prototype.ray = ""; // red, green, blue
HistoryAction.prototype.value = 0; // to be added to the current ray value in order to cancel the action

function HistoryAction(color, ray, value) {
	this.color_index = color;
	this.ray = ray;
	this.value = value;
}

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

var NB_METERS = 4;
var NB_QUESTIONS;
var colors = new Array();
var changes = new Array();
var cur_act = 0;
var svg_css;
var transition = false;
var interface;
var cur_elm = 0;
var visible = true;
var interval;

/** gui **/
function place_interface(colorset) {
	NB_QUESTIONS = document.getElementById('okoto_center').getElementsByTagName('h5').length;
	change_question(0);
	var bot = document.getElementById('okoto_bottom');
	bot.style.left = (window.innerWidth/2 - bot.clientWidth/2) + "px";
	var top = document.getElementById('okoto_top');
	top.style.left = (window.innerWidth/2 - top.clientWidth/2) + "px";
	var lft = document.getElementById('okoto_left');
	lft.style.top = (window.innerHeight/2 - lft.clientHeight/2) + "px";
	var rgt = document.getElementById('okoto_right');
	rgt.style.top = (window.innerHeight/2 - rgt.clientHeight/2) + "px";
	var cnt = document.getElementById('okoto_center');
	cnt.actualHeight = 250; // à modifier si la taille change
	cnt.actualWidth = 500;
	cnt.style.top = (window.innerHeight/2 - cnt.actualHeight/2) + "px";
	cnt.style.left = (window.innerWidth/2 - cnt.actualWidth/2) + "px";
	var svg = document.getElementById('okoto_svg');
	svg.style.width = (window.innerWidth - 16) + "px";
	svg.style.height = (window.innerHeight - 16) + "px";
	svg.src = thefile+"?aw="+svg.clientWidth+"&ah="+svg.clientHeight;
	svg.onload = function() { rank_colors(colorset); }
	interface = [document.getElementById('okoto_left'), document.getElementById('okoto_left_corner'),
				 document.getElementById('okoto_top'), document.getElementById('okoto_right_corner'),
				 document.getElementById('okoto_right'), document.getElementById('okoto_bottom')];
	fill_meters();
}

function key_manager(e) {
	if (e.keyCode == 73) {
		switch_interface();
	} else if (e.keyCode == 67) {
		switch_colors();
	} else if (e.ctrlKey && e.keyCode == 90) {
		history_go(cur_act+1);
	} else if (e.ctrlKey && e.keyCode == 89) {
		history_go(cur_act-1);
	}
}

// you won't get away with that
function event_killer(e) {
	//e.preventBubble();
	e.preventDefault();
	e.stopPropagation();
	return false;
}

function change_question(to) {
	if (to == -1) {
		to += NB_QUESTIONS;
	} else if (to == NB_QUESTIONS) {
		to -= NB_QUESTIONS;
	}
	document.getElementById('current_question').value = to;
	var titles = document.getElementById('okoto_center').getElementsByTagName('h5');
	var answers = document.getElementById('okoto_center').getElementsByTagName('p');
	for (var i = 0; i < NB_QUESTIONS; i++) {
		if (i == to) {
			titles[i].style.display = "block";
			answers[i].style.display = "block";
		} else {
			titles[i].style.display = "none";
			answers[i].style.display = "none";
		}
	}
}

function switch_interface() {
	if (visible) fade();
	else show();
}

function fade() {
	if (!transition) {
		transition = true;
		interval = setInterval("fade_div(interface[cur_elm]);",200);
	}
}

function fade_div(elm) {
	elm.style.display = "none";
	if (++cur_elm == interface.length) {
		clearInterval(interval);
		transition = false;
		visible = false;
		cur_elm = 0;
	}
}

function show() {
	if (!transition) {
		transition = true;
		interval = setInterval("show_div(interface[cur_elm]);",200);
	}
}

function show_div(elm) {
	elm.style.display = "block";
	if (++cur_elm == interface.length) {
		clearInterval(interval);
		transition = false;
		visible = true;
		cur_elm = 0;
	}
}

function rank_colors(colorset) {
	var svg = document.getElementById('okoto_svg').contentDocument.rootElement;
	svg.onkeyup = function(event) {
		key_manager(event);
	}
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
			if (node.hasAttribute("stop-color")) {
				node.removeAttribute("stop-color");
			} else {
				node.removeAttribute('fill');
			}
		}
	}
	scan_node(svg);
	colors.sort(sort_colors);
	colors.splice(8,colors.length-8); // from the 8th element, dump everything except 8 elements from the array
	if (typeof colorset != "undefined") {
		for (var i = 0; i < colorset.length && i < colors.length; i++) {
			colors[i].hex = colorset[i];
			colors[i].refreshRays();
			svg_css.insertRule("."+colors[i].name+" { fill: "+colors[i].hex+"; stop-color: "+colors[i].hex+"; }",svg_css.cssRules.length);
		}
	}
	for (var i = 0; i < 4; i++) {
		set_meter(i+1,i);
	}
}

function history_go(index) {
	if (index > 5 || index < 0) return;
	if (index > cur_act) {
		for (var i = cur_act; i < index; i++) {
			history_undo(changes[i]);
			cur_act++;
		}
	} else {
		for (var i = cur_act; i > index; i--) {
			history_redo(changes[i-1]);
			cur_act--;
		}
	}
	switch_colors(true);
}

function history_undo(action) {
	colors[action.color_index][action.ray] += action.value;
	colors[action.color_index].refreshHex();
	svg_css.insertRule("."+colors[action.color_index].name+" { fill: "+colors[action.color_index].hex+"; stop-color: "+colors[action.color_index].hex+"; }",svg_css.cssRules.length);
}

function history_redo(action) {
	colors[action.color_index][action.ray] -= action.value;
	colors[action.color_index].refreshHex();
	svg_css.insertRule("."+colors[action.color_index].name+" { fill: "+colors[action.color_index].hex+"; stop-color: "+colors[action.color_index].hex+"; }",svg_css.cssRules.length);
}

function update_color() { // passer un argument quelconque pour empêcher "l'historisation" de cette manoeuvre
	// mise à jour de la variable et de la jauge
	var ray = this.parentNode.parentNode.getAttribute('name');
	var value = parseInt(this.value);
	var id = this.parentNode.getAttribute('id');
	var color = parseInt(document.getElementById(id.split("_")[0]+"_label_"+id.split("_")[1]).getAttribute('currentcolor'));
	id = id.substr(-1);
	var diff = colors[color][ray] - value;
	if (diff != 0) {
		colors[color][ray] = value;
		colors[color].refreshHex();
		set_meter(parseInt(id),color);
		// mise à jour du svg
		svg_css.insertRule("."+colors[color].name+" { fill: "+colors[color].hex+"; stop-color: "+colors[color].hex+"; }",svg_css.cssRules.length);

		if (cur_act != 0) { // cas où après être remonté dans l'historique, l'utilisateur entreprend autre chose
			for (var i = 0; i < cur_act; i++) {
				changes.pop(); // on efface tout ce qui a été annulé
			}
			cur_act = 0; // et on repasse le curseur à 0
		}
		changes.unshift(new HistoryAction(color, ray, diff)); // on enregistre l'action
		if (changes.length > 5) {
			changes.pop(); // on ne garde que les 5 dernières actions
		}
	}
}

function switch_colors(refresh) {
	if (typeof refresh == "undefined") {
		refresh = false;
	}
	var comp = "0";
	if (refresh) {
		comp = "4";
	}
	if (colors.length == 4) { alert("Pas d'autres couleurs à modifier"); return; }
	if (document.getElementById('okoto_label_red1').getAttribute("currentcolor") == comp) {
		for (var i = 0; i < 4; i++) {
			set_meter(i+1,i+4);
		}
	} else {
		for (var i = 0; i < 4; i++) {
			set_meter(i+1,i);
		}
	}
}

// repeint les jauges pour une couleur donnée

function set_meter(meter_index, color_index) {
	if (meter_index < 1 || meter_index > NB_METERS || color_index < 0 || color_index >= colors.length) {
		return;
	}
	var red = document.getElementById('okoto_red'+meter_index);
	var green = document.getElementById('okoto_green'+meter_index);
	var blue = document.getElementById('okoto_blue'+meter_index);
	var color = colors[color_index];
	for (var i = 0; i < 256; i++) {
		red.childNodes[i].style.backgroundColor = "#"+cdechex(i)+cdechex(color.green)+cdechex(color.blue);
		green.childNodes[i].style.backgroundColor = "#"+cdechex(color.red)+cdechex(i)+cdechex(color.blue);
		blue.childNodes[i].style.backgroundColor = "#"+cdechex(color.red)+cdechex(color.green)+cdechex(i);
		red.childNodes[i].removeClass('okurrent');
		green.childNodes[i].removeClass('okurrent');
		blue.childNodes[i].removeClass('okurrent');
		if (i == color.red) {
			red.childNodes[i].addClass('okurrent');
		}
		if (i == color.green) {
			green.childNodes[i].addClass('okurrent');
		}
		if (i == color.blue) {
			blue.childNodes[i].addClass('okurrent');
		}
	}
	var h_red = document.getElementById('okoto_label_red'+meter_index);
	var h_green = document.getElementById('okoto_label_green'+meter_index);
	var h_blue = document.getElementById('okoto_label_blue'+meter_index);
	h_red.setAttribute('currentcolor',color_index);
	h_green.setAttribute('currentcolor',color_index);
	h_blue.setAttribute('currentcolor',color_index);
}

// Appelé une seule fois au lancement pour ajouter les 256 boutons aux div "meters"

function fill_meters() {
	var meters = document.getElementsByClassAmong('okometer','div');
	var casques = document.getElementsByClassAmong('okocasque','img');
	for (var i = 0; i < meters.length; i++) {
		// mise en place
		for (var j = 0; j < 256; j++) {
			var lvl = document.createElement('button');
			lvl.setAttribute("title",j);
			lvl.setAttribute("value",j);
			lvl.setAttribute("class","okolor_level");
			lvl.appendChild(document.createTextNode(" "));
			lvl.onmouseup = update_color;
			meters[i].appendChild(lvl);
		}
		// positionnement
		if (meters[i].parentNode.getAttribute('id').indexOf('left') != -1) {
			meters[i].style.left = 10 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
			casques[i].style.left = 2 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
		} else if (meters[i].parentNode.getAttribute('id').indexOf('top') != -1) {
			meters[i].style.top = 10 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
			casques[i].style.top = 2 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
		} else if (meters[i].parentNode.getAttribute('id').indexOf('right') != -1) {
			meters[i].style.right = 10 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
			casques[i].style.right = 2 + (parseInt(meters[i].id.charAt(meters[i].id.length-1))-1)*40 + "px";
		}
	}
}

function save_colors() {
	var title = document.getElementById('okoto_title').value;
	var name = document.getElementById('okoto_name').firstChild.textContent;
	if (name.length == 0) { alert("Impossible de sauvegarder avec un titre vide"); return; }
	if (confirm("Voulez-vous sauvegarder les "+colors.length+" couleurs de '"+name+"' sous le nom '"+title+"' ?")) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST","save.php",true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
		xhr.overrideMimeType('text/html; charset=utf-8');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				alert(xhr.responseText);
			}
		}
		var data = "name="+name+"&title="+title+"&colors="+colors;
		xhr.send(data);
	}
}

/** menu **/
var title_color = [new Color("title","#808080"),new Color("title","#808080"),new Color("title","#808080"),new Color("title","#808080"),new Color("title","#808080")];
var moving;

function place_menu() {
	NB_QUESTIONS = document.getElementById('okoto_center').getElementsByTagName('h5').length;
	change_question(0);
	var mnu = document.getElementById('okoto_menu');
	mnu.style.left = (window.innerWidth/2 - mnu.clientWidth/2) + "px";
	mnu.style.top =  (window.innerHeight/2 - mnu.clientHeight/2) + "px";
	var cnt = document.getElementById('okoto_center');
	cnt.actualHeight = 250; // à modifier si la taille change
	cnt.actualWidth = 500;
	cnt.style.top = (window.innerHeight/2 - cnt.actualHeight/2) + "px";
	cnt.style.left = (window.innerWidth/2 - cnt.actualWidth/2) + "px";
	var svg = document.getElementById('okoto_svg');
	svg.style.width = (window.innerWidth - 16) + "px";
	svg.style.height = (window.innerHeight - 16) + "px";
	moving = setInterval("animate_title();",20);
}

function animate_title() {
	for (var i = 0; i < 5; i++) {
		var rand = Math.floor(Math.random()*3);
		var ray;
		switch (rand) {
			case 0: ray = "red"; break;
			case 1: ray = "green"; break;
			case 2: ray = "blue"; break;
		}
		rand = Math.floor(Math.random()*17)-8;
		if (title_color[i][ray] + rand < 0) {
			title_color[i][ray] = 0;
		} else if (title_color[i][ray] + rand > 255) {
			title_color[i][ray] = 255;
		} else {
			title_color[i][ray] += rand;
		}
		title_color[i].refreshHex();
		document.getElementById("okoto_menu_letter"+i).style.color = title_color[i];
	}
}

function getScroll(p) {
	if (scroll.parentNode != p) {
		p.appendChild(scroll);
	}
}

function removeScroll(p) {
	scroll.parentNode.removeChild(scroll);
}
