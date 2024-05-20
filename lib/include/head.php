<?php if (isset($_GET['install'])) { require_once("$webRoot/lib/ortak/linkBoot-head.php"); return; } ?>
<meta charset="utf-8">
<link rel="manifest" href="manifest.php"></link>
<title><?=$appName?></title>
<meta name="description" content="<?=$appName?>" />
<meta name="viewport" content="width=device-width, minimum-scale=.7, maximum-scale=.7, user-scalable=yes, shrink-to-fit=yes" />
<?php require_once("$webRoot/lib/include/include-libExternal.php") ?> <?php require_once("$webRoot/lib/include/include-libExternal-jqx.php") ?>
