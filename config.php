<?php
	global $globalAppName, $appName, $appVersion, $appClass, $shortAppName, $webRoot, $webRoot_ticari;
	$globalAppName = 'SkyERP'; $appVersion = '1.26.70';
	$shortAppName = empty($appClass) ? $globalAppName : $appClass;
	$webRoot = isset($webRoot) ? $webRoot : '../..'; $webRoot_ticari = "$webRoot/app/ticari"; $webRoot_rapor = "$webRoot/app/rapor"
?>
