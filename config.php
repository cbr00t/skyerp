<?php
	global $globalAppName, $appName, $appVersion, $appClass, $shortAppName, $webRoot, $webRoot_ticari;
	$globalAppName = 'SkyERP'; $appVersion = '1.20.2';
	$shortAppName = empty($appClass) ? $globalAppName : $appClass;
	$webRoot = isset($webRoot) ? $webRoot : '../..'; $webRoot_ticari = "$webRoot/app/ticari";
?>