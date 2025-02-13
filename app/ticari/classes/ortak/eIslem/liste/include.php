<?php require_once("$webRoot/ortak/mq/masterListe/include.php"); $_partRoot = "$webRoot_ticari/classes/ortak/eIslem/liste" ?>
<script src="<?=$_partRoot?>/baseFiltre.js?<?=$appVersion?>"></script> <link rel="stylesheet" href="<?=$_partRoot?>/basePart.css?<?=$appVersion?>"/>
<script src="<?=$_partRoot?>/basePart.js?<?=$appVersion?>"></script> <script src="<?=$_partRoot?>/classes/callback.js?<?=$appVersion?>"></script>
<?php
	require_once("$webRoot_ticari/classes/ortak/eIslem/liste/part/akibet/include.php");
	require_once("$webRoot_ticari/classes/ortak/eIslem/liste/giden/include.php"); require_once("$webRoot_ticari/classes/ortak/eIslem/liste/gelen/include.php")
?>
