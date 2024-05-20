<?php
	require_once("$webRoot/ortak/grid/gridPart/window/gridliGirisWindowPart.include.php");
	require_once("$webRoot/ortak/mq/numarator/form/include.php");
	require_once("$webRoot/ortak/mq/ticNumarator/form/include.php");
	require_once("$webRoot/ortak/mq/fisGiris/fisDip/include.php");
	require_once("$webRoot/ortak/mq/fisGiris/fisEkVergi/include.php");
?>
<?php $_partRoot = "$webRoot/ortak/mq/fisGiris" ?>
<script src="<?=$_partRoot?>/fisBaslikOlusturucu.js?<?=$appVersion?>"></script>
<script src="<?=$_partRoot?>/fisBaslikOlusturucu_templates.js?<?=$appVersion?>"></script>
<link rel="stylesheet" href="<?=$_partRoot?>/part.css?<?=$appVersion?>"/>
<script src="<?=$_partRoot?>/part.js?<?=$appVersion?>"></script>
<?php require_once("$_partRoot/layout.php") ?>
