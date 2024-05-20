<template id="secimler" class="part">
	<div class="part">
		<div class="header">
			<div id="filtreForm">
				<?php require("$webRoot/ortak/filtreForm/ic-layout.php") ?>
			</div>
			<div class="islemTuslari"></div>
		</div>
		<div id="tabPanel" class="dock-bottom">
			<ul class="tabs">
				<li id="secimler" class="tabPage"><div class="header"></div></li>
			</ul>
			<div id="secimler" class="content">
				<div class="secimler-kolonFiltre-bilgi-parent flex-row jqx-hidden">
					<div><button class="kolonFiltre-temizle"></button></div>
					<div class="kolonFiltre-bilgi flex-row"></div>
				</div>
				<div class="secimler-form"></div>
			</div>
		</div>

		<template id="kolonFiltre" class="part">
			<div class="kolonFiltre part"></div>
		</template>
	</div>
</template>
