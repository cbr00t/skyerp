<?php
	/*require_once("$webRoot_ticari/prereq.php")*/ require_once("$webRoot_ticari/include/ortak-01.php"); require_once("$webRoot_ticari/include/ortak-02.php");
	require_once("$webRoot_ticari/classes/mq-param/include.php"); require_once("$webRoot_ticari/include/ortak-03.php"); require_once("$webRoot_ticari/classes/dRapor/include.php");
	require_once("$webRoot/../ext/etc/skyResim/layouts.php"); @include_once("$webRoot/../ext/etc/skyResim/include.php")
?>
<script src="<?=$webRoot?>/classes/offline/localData.js?<?=$appVersion?>"></script> <?php require_once("$webRoot/classes/offline/db/include.php") ?>
<link rel="stylesheet" href="<?=$webRoot_ticari?>/app.css" /> <script src="<?=$webRoot_ticari?>/app.js?<?=$appVersion?>"></script>
<?php require_once("$webRoot_crm/classes/include.php") ?> <script>var webRoot_crm = "<?=$webRoot_crm?>"</script>
