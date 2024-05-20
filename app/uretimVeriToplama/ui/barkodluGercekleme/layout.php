<template id="barkodluGercekleme">
	<div class="full-wh">
		<header id="header" class="full-width">
			<!--<div class="parent flex-row full-width">
				<div id="hat" class="parent modelKullan-parent flex-row"><button id="listedenSec">L</button><div class="veri"></div></div>
			</div>-->
			<div class="full-width flex-row">
				<div id="barkod" name="barkod" class="parent flex-row" autocomplete="all">
					<button id="ek-bilgiler-toggle" class="jqx-hidden"></button>
					<button id="listedenSec">L</button><input type="textbox" class="veri center" placeholder="Barkod okutunuz"></input>
				</div>
				<div id="miktar" class="parent jqx-hidden"><input type="number" class="veri center" placeholder="Miktar"></input></div>
				<div id="gonder" class="parent"><button class="full-wh">SEÇİLENLERİ<br/>GÖNDER</button></div>
				<div id="ekle" class="parent jqx-hidden"><button class="full-wh">EKLE</button></div>
				<div id="iskarta" class="parent"><button class="full-wh">ISK.</button></div>
				<div id="kalite" class="parent"><button class="full-wh">KAL.</button></div>
				<div id="topluDegistir" class="parent"><button class="full-wh">T.DEĞ</button></div>
				<div id="topluSil" class="parent"><button class="full-wh">T.SİL</button></div>
				<div id="gerceklemeler" class="parent"><button class="full-wh">GER.<br/>LİSTE</button></div>
			</div>
			
			<div id="ek-bilgiler">
				<div class="flex-row full-width">
					<div class="parent flex-row">
						<!--<label id="otoGonder" class="islem-tuslari full-height"><input type="checkbox" class="veri"></input><span class="etiket">Oto Akt.</span></label>-->
						<div id="paletliGiris" class="parent"><button class="full-wh">PALET</button></div>
					</div>
					<div id="tezgah" class="parent modelKullan-parent flex-row"><button id="listedenSec">L</button><div class="veri"></div></div>
					<div id="personel" class="parent modelKullan-parent flex-row"><button id="listedenSec">L</button><div class="veri"></div></div>
				</div>
				<div class="flex-row full-width">
					<div class="ara-parent flex-row">
						<div class="title">Zaman:</div>
						<div id="suan-parent" class="parent">
							<input type="checkbox" id="suan" name="suan"></input>
							<label for="suan">Şuan</label>
						</div>
						<div id="bas-zaman" class="parent flex-row">
							<input type="date" class="date"></input>
							<input type="time" class="veri no-secs" placeholder="Zamanı"></input>
							<span class="bs-ayirac"> &nbsp;-&gt;</span>
						</div>
						<div id="bit-zaman" class="parent flex-row">
							<input type="date" class="date"></input>
							<input type="time" class="veri no-secs" placeholder="Zamanı"></input>
						</div>
					</div>
				</div>
			</div>
		</header>
		
		<div class="grid-parent full-width dock-bottom">
			<div class="grid" class="full-wh"></div>
		</div>
	</div>
</template>
