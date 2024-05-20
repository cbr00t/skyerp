<meta charset="utf-8">
<link rel="manifest" href="manifest.php"></link>
<?php require_once("$webRoot/lib/ortak/include.php") ?>
<script>
	var installPrompt;
	document.addEventListener('readystatechange', evt => {
		if (evt.currentTarget.readyState == 'complete') {
			Ortak.linkBoot();
			if (qs.install) {
				window.addEventListener('beforeinstallprompt', evt => {
					evt.preventDefault();
					installPrompt = event;
					installedText.setAttribute('hidden', '');
					installButton.removeAttribute('hidden')
				});
				const installedText = document.querySelector('#installedText');
				const installButton = document.querySelector('#install');
				installButton.addEventListener('click', async evt => {
					if (!installPrompt)
						return
					evt.currentTarget.setAttribute('hidden', '');
					setTimeout(() => evt.currentTarget.removeAttribute('hidden'), 100);
					const result = await installPrompt.prompt();
					console.log(`Install prompt was: ${result.outcome}`);d
					disableInAppInstallPrompt()
				});
				window.addEventListener('appinstalled', evt => {
					// disableInAppInstallPrompt();
					installedText.removeAttribute('hidden', '');
					setTimeout(() => location.href = '<?=$webRoot?>/<?=$startURL_postfix?>', 4000)
				});
				
				function disableInAppInstallPrompt() {
					installPrompt = null;
					installButton.setAttribute('hidden', '')
				}
			}
			else
				location.href = '<?=$webRoot?>/<?=$startURL_postfix?>'
		}
	})
</script>
