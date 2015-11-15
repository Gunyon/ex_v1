<?php
	// load the error handling module
	require_once('error_handler.php');
	// specify that we're outputting an XML document
	header('Content-Type: text/xml');
	// calculate the the result
	$date = $_GET['date'];
	$doc = new DOMDocument();
	$doc->load('http://bnm.md/md/official_exchange_rates?get_xml=1&date='.$date);
	echo $doc->saveXML();
?>
