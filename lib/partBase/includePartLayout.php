<?php
	global $partName, $partRoot, $partCSS, $partJS;
	if (empty($partRoot))
		$partRoot = "$webRoot/ortak/$partName";
	if (empty($partCSS))
		$partCSS = $partName . 'Part.css';
	if (empty($partJS))
		$partJS = $partName . 'Part.js';
?>
<link rel="stylesheet" href="<?=$partRoot?>/<?=$partCSS?>?<?=$appVersion?>"/>
<script src="<?=$partRoot?>/<?=$partJS?>?<?=$appVersion?>"></script>
