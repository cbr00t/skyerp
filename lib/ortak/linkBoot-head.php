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
	debugger
	var webRoot = `<?=$webRoot?>`, startURL_postfix = `<?=$startURL_postfix?>`, shortAppName = `<?=$shortAppName?>`
	var appName = `<?=$appName?>`, appVersion = `<?=$appVersion?>`, appClass
	let installPrompt, disableInAppInstallPrompt, installedText, installButton
	window.addEventListener('beforeinstallprompt', evt => {
		evt.preventDefault()
		installPrompt = evt
		installedText?.setAttribute('hidden', '')
		installButton?.removeAttribute('hidden')
	})
	document.addEventListener('readystatechange', ({ currentTarget: target }) => {
		if (target.readyState == 'complete') {
			Ortak.linkBoot()
			if (qs.install) {
				installedText = document.querySelector('#installedText')
				installButton = document.querySelector('#install')
				if (installPrompt) {
					installedText?.setAttribute('hidden', '')
					installButton?.removeAttribute('hidden')
				}
				installButton.addEventListener('click', async ({ currentTarget: target }) => {
					if (!installPrompt)
						return
					target.setAttribute('hidden', '')
					setTimeout(() => target.removeAttribute('hidden'), 100)
					let result = await installPrompt.prompt()
					console.log(`Install prompt was: [ ${result.outcome} ]`)
					disableInAppInstallPrompt()
				})
				window.addEventListener('appinstalled', evt => {
					// disableInAppInstallPrompt()
					installedText.removeAttribute('hidden', '')
					setTimeout(goToApp, 2_000)
				})
				disableInAppInstallPrompt = () => {
					installPrompt = null
					installButton?.setAttribute('hidden', '')
				}
			}
			else
				goToApp()
		}
	})
	function goToApp() {
		location.href = ['<?=$webRoot?>', '<?=$startURL_postfix?>']
			.map(slashTrimmed)
			.join('/')
	}
	function slashTrimmed(value) {
		return value?.endsWith('/') ? value.slice(0, -1) : value
	}
</script>
