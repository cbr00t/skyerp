<?php if (isset($_GET['install'])) { require_once("$webRoot/lib/ortak/linkBoot-body.php"); exit(); } ?>
<?php include_once("$webRoot/lib/boot/include.php"); require_once("$webRoot/prereq.ortak.php"); require_once("$webRoot/prereq.php"); include_once('prereq.php'); ?>
<?php @include_once("$webRoot/libs.php"); @include_once('libs.php'); ?>
<script>
	var webRoot = `<?=$webRoot?>`, startURL_postfix = `<?=$startURL_postfix?>`, shortAppName = `<?=$shortAppName?>`;
	var appName = `<?=$appName?>`, appVersion = `<?=$appVersion?>`, appClass;
	$(() => { appClass = <?=$appClass?>; Ortak.boot() })
</script>

<div class="bg-image-wrapper"></div>
<div class="bg-image"></div>
<div class="header-image"></div>
<!--<button id="cacheReset" class="app-header-button"></button> <button id="fullScreen" class="app-header-button"></button> <button id="logout" class="app-header-button"></button>-->
<div class="app-titlebar">
	<div class="flex-row">
		<span class="db-name"></span>
		<span class="app-title veri"></span>
		<span class="app-version-parent"><span class="ek-bilgi">(v</span> <span class="app-version veri"></span> <span class="ek-bilgi">)</span></span>
	</div>
	<div><span class="user"></span></div>
</div>
