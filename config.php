<?php
	global $globalAppName, $appName, $appVersion, $appClass, $shortAppName, $webRoot, $webRoot_ticari;
	$globalAppName = 'SkyERP'; $appVersion = '1.22.13';
	$shortAppName = empty($appClass) ? $globalAppName : $appClass;
	$webRoot = isset($webRoot) ? $webRoot : '../..'; $webRoot_ticari = "$webRoot/app/ticari";
?>
