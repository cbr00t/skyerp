<?php
	header('Content-Type: application/json');
	require_once('config.php')
	/* "display_override": ["fullscreen", "standalone", "window-controls-overlay"] */
?>
{
	"manifest_version": 3, "offline_enabled": true, "id": "<?=$appClass?>", "version": "<?=$appVersion?>",
	"short_name": "<?=$appName?>", "name": "<?=$appName?>", "description": "<?=$appName?> Uygulaması",
	"categories": ["business"], "display": "fullscreen", "display_override": ["fullscreen", "standalone"],
	"launch_handler": { "client_mode": ["focus-existing", "auto"] },
	"scope": "/skyerp", "start_url": "/skyerp<?=$startURL_postfix?>/", "orientation": "any",
	"scope_extensions": ["*"],
	"prefer_related_applications": false, "related_applications": [],
	"background_color": "#3367D6", "theme_color": "#3367D6", "lang": "tr", "dir": "ltr",
	"protocol_handlers": [{ "protocol": "web+erp", "url": "app/%s/" }],
	"bluetooth": { "socket": true, "uuids": ["00001101-0000-1000-8000-00805f9b34fb"] },
	"icons": [
	  { "src": "<?=$webRoot?>/images/logo_217x217.png", "type": "image/png", "sizes": "217x217" },
	  { "src": "<?=$webRoot?>/images/logo_512x512.png", "type": "image/png", "sizes": "512x512" }
	],
	"screenshots": [
		{ "src": "<?=$webRoot?>/images/scrshot_wide.png", "form_factor": "wide", "sizes": "1024x768", "type": "image/png", "label": "login page" },
		{ "src": "<?=$webRoot?>/images/scrshot_620x320.png", "sizes": "620x320", "type": "image/png", "label": "config page" }
	]
}
