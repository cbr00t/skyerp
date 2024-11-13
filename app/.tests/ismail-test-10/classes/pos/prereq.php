<?php
	$_partRoot = "https://cdnjs.cloudflare.com/ajax/libs/jqwidgets/17.0.2/jqwidgets";
	$_partRoot_jq = "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2"
?>
<link async defer rel="stylesheet" href="<?=$_partRoot_jq?>/themes/base/jquery-ui.min.css" />
<script async defer src="<?=$_partRoot_jq?>/jquery-ui.min.js"></script>
<link class="theme-base" rel="stylesheet" href="<?=$_partRoot?>/styles/jqx.base.min.css" />
<script src="<?=$_partRoot?>/jqxcore.min.js"></script>
<script src="<?=$_partRoot?>/jqxbuttons.min.js"></script>
<script src="./parts.js?<?=$appVersion?>"></script>
