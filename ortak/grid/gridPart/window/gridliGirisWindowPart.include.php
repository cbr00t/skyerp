<?php
	$_partRoot = "$webRoot/ortak/grid";
	require_once("$_partRoot/gridPart.php");
?>
<?php
	$_partRoot = "$webRoot/ortak/grid/gridPart/window";
	$_partName = 'gridliGirisWindow';
?>
<link rel="stylesheet" href="<?=$_partRoot?>/<?=$_partName?>Part.css?<?=$appVersion?>"/>
<script src="<?=$_partRoot?>/<?=$_partName?>Part.js?<?=$appVersion?>"></script>
