<script src="<?=$webRoot?>/lib_external/etc/date.js"></script>

<script src="<?=$webRoot?>/classes/mq/param/mqOrtakParam.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKod.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacli.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacliKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/detay/mqDetay.js"></script>

<?php
	require_once("$webRoot/ortak/login/include.php");
	require_once("$webRoot/ortak/login/layout.php");
	require_once("$webRoot/ortak/filtreForm/include.php");
	require_once("$webRoot/ortak/grid/gridPart.php");
	require_once("$webRoot/ortak/gridKolonDuzenle/include.php");
	require_once("$webRoot/ortak/gridKolonDuzenle/layout.php");
	require_once("$webRoot/ortak/mq/masterListe/include.php");
	require_once("$webRoot/ortak/mq/masterListe/layout.php");
	require_once("$webRoot/ortak/mq/modelKullan/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/layout.php");
?>

<!--
	<script src="./classes/myClass1.js"></script>
	<script src="./classes/myClass2.js"></script>
-->
<?php
	require_once("./ui/ekran1/include.php");
	require_once("./ui/ekran2/include.php");
?>

<div id="prefetch" class="jqx-hidden">
</div>
