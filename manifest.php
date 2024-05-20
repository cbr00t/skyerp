<?php
	header('Content-Type: application/json');
	require_once('config.php');
?>
{
	"manifest_version": 3,
	"id": "<?=$appClass?>", "version": "<?=$appVersion?>",
	"short_name": "<?=$appName?>", "name": "<?=$appName?>", "offline_enabled": true,
	"display": "standalone", "display_override": ["fullscreen", "minimal-ui"],
	"scope": "/skyerp", "start_url": "/skyerp<?=$startURL_postfix?>/",
	"orientation": "any", "form_factor": "wide",
	"background_color": "#3367D6", "theme_color": "#3367D6",
	"protocol_handlers": [
	    { "protocol": "web+erp", "url": "./skyerp/app/%s/" }
	],
	"bluetooth": { "socket": true, "uuids": ["00001101-0000-1000-8000-00805f9b34fb"] },
	"icons": [
	  { "src": "<?=$webRoot?>/images/sky_logo.png", "type": "image/png", "sizes": "217x217" }
	]
}
