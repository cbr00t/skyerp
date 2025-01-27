<?php
	global $globalAppName, $appName, $appVersion, $appClass, $shortAppName, $webRoot, $webRoot_ticari, $webRoot_sahaDurum;
	$globalAppName = 'SkyERP'; $appVersion = '1.30.54';
	$shortAppName = empty($appClass) ? $globalAppName : $appClass;
	$webRoot = isset($webRoot) ? $webRoot : '../..'; $webRoot_ticari = "$webRoot/app/ticari";
	$webRoot_rapor = "$webRoot/app/rapor"; $webRoot_sahaDurum = "$webRoot/app/sahaDurum"
?>
