<style>
	#install {
		font-size: 150%; font-weight: bold;
		width: 300px; height: 55px;
		background-color: lightgreen
	}
	#install:hover { background-color: springgreen }
	#install:focus { color: whitesmoke; background-color: #555 }
</style>
<h2><?=$appName?></h2>
<h3>(v<?=$appVersion?>)</h3>
<div id="installedText">
	<div class="text">Uygulama yüklendi!</div>
	<div class="progress-parent"><progress></progress></div>
</div>
<button id="install" hidden>Yükle</button>
