<?php
	global $globalAppName, $appName, $appVersion, $appClass, $shortAppName, $webRoot, $webRoot_ticari;
	global $webRoot_misc, $webRoot_sahaDurum, $webRoot_tablet;

	$globalAppName = 'SkyERP'; $appVersion = '1.39.113';
	$shortAppName = empty($appClass) ? $globalAppName : $appClass;
	$webRoot = isset($webRoot) ? $webRoot : '../..'; $webRoot_ticari = "$webRoot/app/ticari";
	$webRoot_rapor = "$webRoot/app/rapor"; $webRoot_misc = "$webRoot/app/misc";
	$webRoot_sahaDurum = "$webRoot/app/sahaDurum"; $webRoot_tablet = "$webRoot/app/tablet"
?>
