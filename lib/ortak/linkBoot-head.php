<meta charset="utf-8">
<link rel="manifest" href="manifest.php"></link>
<?php
	$_partRoot = "$webRoot/lib_external/jqx"; $_partRoot_jq = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1";
	$_partRoot_jqui = "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2"
?>
<link rel="stylesheet" href="<?=$_partRoot?>/css/jquery-ui.min.css" /> <link class="theme-base" rel="stylesheet" href="<?=$_partRoot?>/css/jqx.base.min.css" /> <!--<script src="<?=$_partRoot?>/jquery-3.3.1.min.js"></script>-->
<script src="<?=$_partRoot_jq?>/jquery.min.js"></script> <script src="<?=$_partRoot?>/jquery.ajax-cross-origin.min.js"></script> <script src="<?=$_partRoot_jqui?>/jquery-ui.min.js"></script>
<?php require_once("$webRoot/lib/include/include-libExternal.php"); require_once("$webRoot/lib/ortak/include.php") ?>
<script>
	debugger;
	var webRoot = `<?=$webRoot?>`, startURL_postfix = `<?=$startURL_postfix?>`, shortAppName = `<?=$shortAppName?>`;
	var appName = `<?=$appName?>`, appVersion = `<?=$appVersion?>`, appClass, installPrompt;
	document.addEventListener('readystatechange', evt => {
		if (evt.currentTarget.readyState == 'complete') {
			Ortak.linkBoot();
			if (qs.install) {
				window.addEventListener('beforeinstallprompt', evt => {
					evt.preventDefault(); installPrompt = event;
					installedText.setAttribute('hidden', ''); installButton.removeAttribute('hidden')
				});
				const installedText = document.querySelector('#installedText'), installButton = document.querySelector('#install');
				installButton.addEventListener('click', async evt => {
					if (!installPrompt) { return }
					evt.currentTarget.setAttribute('hidden', ''); setTimeout(() => evt.currentTarget.removeAttribute('hidden'), 100);
					const result = await installPrompt.prompt(); console.log(`Install prompt was: ${result.outcome}`);
					disableInAppInstallPrompt()
				});
				window.addEventListener('appinstalled', evt => {
					/* disableInAppInstallPrompt(); */ installedText.removeAttribute('hidden', '');
					setTimeout(() => location.href = ['<?=$webRoot?>', '<?=$startURL_postfix?>'].map(x => slashTrimmed(x)).join('/'), 4000)
				});
				function disableInAppInstallPrompt() { installPrompt = null; installButton.setAttribute('hidden', '') }
			}
			else { location.href = ['<?=$webRoot?>', '<?=$startURL_postfix?>'].map(x => slashTrimmed(x)).join('/') }
		}
	})
	function slashTrimmed(value) { return value?.endsWith('/') ? value.slice(0, -1) : value }
</script>
