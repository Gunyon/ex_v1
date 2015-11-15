var xmlHttp = createXmlHttpRequestObject();
var d = new Date();
var dd = d.getDate();
var mm = d.getMonth()+1; 
var yyyy = d.getFullYear();
if (dd < 10) { dd = '0' + dd; }
if (mm < 10) { mm = '0' + mm; }
var date = dd + "." + mm + "." + yyyy;
var valuta1 = 1;
var valuta2 = 1;
var sum1 = null; 
var sum2 = null;
var baseValute = new Array();
var valuteArray = new Array();
var CodeValueArray = new Array();
CodeValueArray['MDL'] = new Array();
CodeValueArray['MDL']['NOM'] = 1;
CodeValueArray['MDL']['VAL'] = 1;

function createXmlHttpRequestObject() {
	var xmlHttp;
	try {
		xmlHttp = new XMLHttpRequest();
	} catch(e) {
		try {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {}
	}
	if (!xmlHttp)
		alert("Error creating the XMLHttpRequest object.");
	else 
		return xmlHttp;
}

function process() {
	if (xmlHttp) {
		try {
			var params = "date=" + date;
			xmlHttp.open("GET", "getdata.php?" + params, true);
			xmlHttp.onreadystatechange = handleRequestStateChange;
			xmlHttp.send(null);
		} catch (e) {
			alert("Can't connect to server:\n" + e.toString());
		}
	}
}

function handleRequestStateChange() {
	if (xmlHttp.readyState == 4) {
		if (xmlHttp.status == 200) {
			try {
				handleServerResponse();
			} catch(e) {
				alert("Error reading the response: " + e.toString());
			}
		} else {
			alert("There was a problem retrieving the data:\n" + xmlHttp.statusText);
		}
	}
}

function handleServerResponse() {
	var textResponse = xmlHttp.responseText;
	function parseXML(text) {
		if (typeof DOMParser != "undefined") {
			return (new DOMParser()).parseFromString(text, "application/xml");
		} else if (typeof ActiveXObject != "undefined") {
			var doc = XML.newDocument(); 
			doc.loadXML(text); 
			return doc; 
		} else {
			var url = "data:text/xml;charset=utf-8," + encodeURIComponent(text);
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", url, false);
			xmlHttp.send(null);
			return xmlHttp.responseXML;
		}
	}
	xmlResponse = parseXML(textResponse);
	if (!xmlResponse || !xmlResponse.documentElement)
		throw("Invalid XML structure:\n" + xmlHttp.responseText);
	var rootNodeName = xmlResponse.documentElement.nodeName;
	if (rootNodeName == "parsererror") 
		throw("Invalid XML structure:\n" + xmlHttp.responseText);
	xmlRoot = xmlResponse.documentElement;
	if (rootNodeName != "ValCurs" || !xmlRoot.firstChild)
		throw("Invalid XML structure:\n" + xmlHttp.responseText);
	if (xmlRoot) {
		var valute = xmlRoot.firstChild.nextSibling;
	}
	var j = 0;
	for(var i=0; valute != null; valute = valute.nextSibling.nextSibling, i++) {
		valuteArray[i] = new Array(4);
		cct = valuteArray[i]['CharCode'] = valute.firstChild.nextSibling.nextSibling.nextSibling.firstChild.data;
		nomt = valuteArray[i]['Nominal'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
		namet = valuteArray[i]['Name'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
		valt = valuteArray[i]['Value'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
		CodeValueArray[valuteArray[i]['CharCode']] = new Array();
		CodeValueArray[valuteArray[i]['CharCode']]['NOM'] = valuteArray[i]['Nominal'];
		CodeValueArray[valuteArray[i]['CharCode']]['VAL'] = valuteArray[i]['Value'];
		var cct = valuteArray[i]['CharCode'];
		if (cct=='EUR' || cct=='USD' || cct=='RON' || cct=='GBP' || cct=='RUB' || cct=='UAH') {	
			baseValute[j] = new Array();
			baseValute[j]['CharCode'] = cct;
			baseValute[j]['Nominal'] = nomt;
			baseValute[j]['Name'] = namet;
			baseValute[j]['Value'] = valt;
			j++;
		}
	} 
	var textInSelectOption = ""; 
	for (var i=0; i<valuteArray.length; i++) {
		textInSelectOption += "<option value='" + valuteArray[i]['CharCode'] + "'>" + valuteArray[i]['CharCode'] + " " + valuteArray[i]['Name'] + "</option>"; 
	} 
	myDiv = document.getElementById("selectfrom");
	myDiv.innerHTML +=  textInSelectOption;
	myDiv2 = document.getElementById("selectto");
	myDiv2.innerHTML +=  textInSelectOption;
	init();
	clear();
}

function onChangeSelect() {
	valuta1 = document.getElementById('selectfrom').value;
	valuta2 = document.getElementById('selectto').value;
	sum1 = document.getElementById('inputfrom').value;
	sum2 = document.getElementById('inputto').value;
	if (!sum1) {
		document.getElementById('inputto').value = "0.0";
		document.getElementById('inputfrom').focus();
		return;
	}
	temp1 = CodeValueArray[valuta1]['VAL']/CodeValueArray[valuta1]['NOM'];
	temp2 = CodeValueArray[valuta2]['VAL']/CodeValueArray[valuta2]['NOM'];
	document.getElementById('inputto').value = (sum1/temp2*temp1).toFixed(2);
	document.getElementById('inputfrom').focus();
}

function swap() {
	document.getElementById('selectfrom').value = valuta2;
	document.getElementById('selectto').value = valuta1;
	var aux = valuta2;
	valuta2 = valuta1;
	valuta1 = aux;
	onChangeSelect();
}

function clear() {
	document.getElementById('inputfrom').value = "";
	document.getElementById('inputto').value = "";
	document.getElementById('inputfrom').focus();
}

function init() {
	document.getElementById('selectfrom').onchange = onChangeSelect;
	document.getElementById('selectto').onchange = onChangeSelect;
	document.getElementById('inputfrom').onkeyup = onChangeSelect;
	document.getElementById('inputto').onkeyup = onChangeSelect;
	document.getElementById('swap').onclick = swap;
	document.getElementById('clearbtn').onclick = clear;
	showBase();
}

function showBase() {
	var tmp = "";
	for (i=0; i<baseValute.length; i++) {
		tmp	= baseValute[i]['Value'] + "<span class='textmare2'> MDL</span>";
		document.getElementById((baseValute[i]['CharCode']).toLowerCase()).innerHTML = tmp;
	}
}

(function() { // Весь модуль оформлен в виде анонимной функции
	// По окончании загрузки документа вызывается функция init()
	if (window.addEventListener) window.addEventListener("load", init2, false);
	else if (window.attachEvent) window.attachEvent("onload", init2);
	// Найти все теги <input>, для которых необходимо зарегистрировать
	// обработчик события
	function init2() {
		var inputtags = document.getElementsByTagName("input");
		for (var i = 0 ; i < inputtags.length; i++) { // Обойти все теги
			var tag = inputtags[i];
			if (tag.type != "text") continue; // Только текстовые поля
			var allowed = tag.getAttribute("allowed");
			if (!allowed) continue; // И только если есть аттрибут allowed
			// Зарегистрировать функцию-обработчик
			if (tag.addEventListener) {
				tag.addEventListener("keypress", filter, false);
			} else {
				// attachEvent не используется, потому что в этом случае
				// функции-обработчику передается некорректное значение
				// ключевого слова this.
				tag.onkeypress = filter;
			}
		}
	}
	// Это обработчик события keypress, который выполняет фильтрацию ввода
	function filter(event) {
		// Получить объект события и код символа переносимым способом
		var e = event || window.event; // Объект события клавиатуры
		var code = e.charCode || e.keyCode; // Какая клавиша была нажата
		// Если была нажата функциональная клавиша, не фильтровать ее
		if (e.charCode == 0) return true; // Функциональная клавиша (только Firefox)
		if (e.ctrlKey || e.altKey) return true; // Нажата Ctrl или Alt
		if (code < 32) return true; // Управляющий ASCII-символ
		// Теперь получить информацию из элемента ввода
		var allowed = this.getAttribute("allowed"); // Допустимые символы
		var messageElement = null; // Сообщение об ошибке
		var messageid = this.getAttribute("messageid"); // id элемента с сообщением,
		// если есть
		if (messageid) // Если существует атрибут messageid, получить элемент
			messageElement = document.getElementById(messageid);
		// Преобразовать код символа в сам символ
		var c = String.fromCharCode(code);
		// Проверить, принадлежит ли символ к набору допустимых символов
		if (allowed.indexOf(c) != -1) {
			// Если c - допустимый символ, скрыть сообщение, если существует
			if (messageElement) messageElement.style.visibility = "hidden";
			return true; // И принять ввод символа
		} else {
			// Если c - недопустимый символ, отобразить сообщение
			if (messageElement) messageElement.style.visibility = "visible";
			// И отвергнуть это событие keypress
			if (e.preventDefault) e.preventDefault();
			if (e.returnValue) e.returnValue = false;
			return false;
		}
	}
})();