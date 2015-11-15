var xmlHttp = createXmlHttpRequestObject();
var d = new Date();
var dd = d.getDate();
var mm = d.getMonth()+1; 
var yyyy = d.getFullYear();
if (dd < 10) { dd = '0' + dd; }
if (mm < 10) { mm = '0' + mm; }
var date = dd + "." + mm + "." + yyyy;

var valuteArray = new Array();

function createXmlHttpRequestObject() {
	var xmlHttp;
	try {
		xmlHttp = new XMLHttpRequest();
	} catch(e) {
		try  { 
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
			alert("There was a problem retrieving the data:\n" + 
				xmlHttp.statusText);
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
	if(xmlRoot) {
		var valute = xmlRoot.firstChild.nextSibling;
	}
	var j = 0;
	for (var i=0; valute != null; valute = valute.nextSibling.nextSibling, i++) {
		valuteArray[i] = new Array(4);
		cct = valuteArray[i]['CharCode'] = valute.firstChild.nextSibling.nextSibling.nextSibling.firstChild.data;
		nomt = valuteArray[i]['Nominal'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
		namet = valuteArray[i]['Name'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
		valt = valuteArray[i]['Value'] = valute.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling.firstChild.data;
	}
	init();
}

function init() {
	showAll();
}

function showAll() {
	var tmp = "<table class='table3' border='0' cellspacing='0' cellpadding='0'>";
	for (var i=0; i<valuteArray.length; i++) {
		if (valuteArray[i]['Nominal'] == 1)
			tmp += "<tr><td class='tabel_c1'><img class='v_align' src='img/countries/" + (valuteArray[i]['CharCode']).toLowerCase() + ".jpg' alt='" + valuteArray[i]['CharCode'] + "'><span class='textmare'>" + valuteArray[i]['CharCode'] + "</span><span class='textspacer'></span><span class='namevalute'>" + valuteArray[i]['Name'] + "</span></td><td class='tabel_c2'>" + valuteArray[i]['Value'] + "<span class='textspacer'><span class='textmare2'>MDL</span></td></tr> ";
		else
			tmp += "<tr><td class='tabel_c1'><img class='v_align' src='img/countries/" + (valuteArray[i]['CharCode']).toLowerCase() + ".jpg' alt='" + valuteArray[i]['CharCode'] + "'><span class='textmare'>" + valuteArray[i]['CharCode'] + "</span><span class='textspacer'></span><span class='namevalute'>" + valuteArray[i]['Name'] + " (" + valuteArray[i]['Nominal'] + ")" + "</span></td><td class='tabel_c2''>" + valuteArray[i]['Value'] + "<span class='textspacer'><span class='textmare2'>MDL</span></td></tr> ";
	}
	tmp += "</table>";
	document.getElementById('allcourses').innerHTML = tmp;
}
