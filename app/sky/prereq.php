<script>
	var parentAppRoot = `<?=$parentAppRoot?>`;
</script>

<script src="<?=$webRoot?>/lib_external/etc/date.js"></script>

<script src="../ticari/classes/mq-param/mqTicariParamBase.js"></script>
<script src="../ticari//classes/mq-param/mqZorunluParam.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKod.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/kod/mqKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacli.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqSayacliKA.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/fis/mqDetayli.js"></script>
<script src="<?=$webRoot?>/classes/mq/cogul/detay/mqDetay.js"></script>
<script src="../ticari/classes/ortak/mq-ozelSaha/mqOzelSaha.js"></script>
<?php
	require_once("$webRoot/ortak/barkod/include.php");
	require_once("$webRoot/ortak/login/include.php");
	require_once("$webRoot/ortak/login/layout.php");
	require_once("$webRoot/ortak/filtreForm/include.php");
	require_once("$webRoot/ortak/gridKolonDuzenle/include.php");
	require_once("$webRoot/ortak/gridKolonDuzenle/layout.php");
	require_once("$webRoot/ortak/mq/modelKullan/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/include.php");
	require_once("$webRoot/ortak/gridliKolonFiltre/layout.php");
	require_once("$webRoot/classes/mq/secimler/include.php");
	require_once("$webRoot/classes/mq/secimler/part/include.php");
	require_once("$webRoot/classes/mq/secimler/part/layout.php");
	require_once("$webRoot/ortak/mq/modelTanim/include.php");
	require_once("$webRoot/ortak/mq/modelTanim/layout.php");
	require_once("$webRoot/classes/mq/cogul/kod/tanim/include.php");
	require_once("$webRoot/classes/mq/cogul/kod/tanim/layout.php");
	require_once("$webRoot/ortak/mq/masterListe/include.php");
	require_once("$webRoot/ortak/mq/masterListe/layout.php");
?>

<!--<script src="./classes/mq-master/mqBarkodRec.js"></script>-->
<?php
	/* require_once("./ui/barkodluGercekleme/include.php"); */
?>

<div id="prefetch" class="jqx-hidden">
</div>

