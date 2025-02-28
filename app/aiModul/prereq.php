<?php require_once("$webRoot/prereq.php") ?>
	<!-- WARN: kütüphane dosya içeriği mevcut değil, iptal edildi ama kullanım şekli doğru -->
<!--<link rel="stylesheet" href="<?=$webRoot?>/lib/custom/ai.css" /> <script src="<?=$webRoot?>/lib/custom/ai-lib.js"></script>-->

	<!-- ERROR: Gerekli bağımlılıkları ekle -->
<?php require_once("$webRoot/ortak/mq/modelKullan/include.php") ?>

	<!-- INFO: sürüm değişimlerinde browser ve cacheStorage cache'den kurtulması için url sonuna ?(< ?php $appVersion?>) ekledik -->
	<!-- ERROR: AIPart sınıfının kullanıma dahil edilebilmesi için aşağıdaki gibi 'prereq.php' de script src direktifi eklenmeli idi -->
<script src="./aiPart.js?<?=$appVersion?>"></script>
