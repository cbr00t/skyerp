<?php require_once('config.php')?>
<!DOCTYPE html>
<html lang="tr">
<head>
	<?php include("$webRoot/lib/include/head.php") ?>
</head>
<body>
	<?php include("$webRoot/lib/include/ortak-layout.php")?>
	<main class="sky-content jqx-hidden"></main>
	<template id="payment" class="part">
		<div>
			<div class="payment-form" align="center">
				<form class="container" action="#">
					<div class="item">
						<label for="cardholder-name">Kart Sahibi İsmi</label>
						<input type="textbox" id="cardholder-name" name="cardholder-name" placeholder="ADI SOYADI" minlength="5" maxlength="40" required>
					</div>
					<div class="item">
						<label for="card-number">Kart Numarası</label>
						<input type="textbox" id="card-number" name="card-number" placeholder="1234 5678 9012 3456" minlength="19" maxlength="19" required>
					</div>
					<div class="item">
						<label for="expiry-date">Son Kullanım</label>
						<input type="textbox" id="expiry-date" name="expiry-date" placeholder="AA/YY" minlength="5" maxlength="5" required>
					</div>
					<div class="item">
						<label for="cvv">CVV</label>
						<input type="number" id="cvv" name="cvv" placeholder="123" minlength="3" maxlength="3" required>
					</div>
				</form>
				<footer>
					<button id="tamam">Ödemeyi Tamamla</button>
				</footer>
			</div>
		</div>
	</template>
</body>
</html>
