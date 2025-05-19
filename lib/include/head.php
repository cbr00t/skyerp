<?php if (isset($_GET['install'])) { require_once("$webRoot/lib/ortak/linkBoot-head.php"); return; } ?>
<meta charset="utf-8">
<link rel="manifest" href="manifest.php"></link>
<title><?=$appName?></title>
<meta name="description" content="<?=$appName?>" />
<meta name="viewport" content="width=device-width, minimum-scale=.7, maximum-scale=.7, user-scalable=yes, shrink-to-fit=yes" />
<link rel="preload" fetchpriority="high" as="image" type="image/svg+xml" href="<?=$webRoot?>/images/sky_logo.png"/>
<link rel="preload" fetchpriority="high" as="image" type="image/png" href="<?=$webRoot?>/images/header-background.jpg"/>
<?php require_once("$webRoot/lib/include/include-libExternal.php") ?> <?php require_once("$webRoot/lib/include/include-libExternal-jqx.php") ?>
