<template id="yerelParamConfigTanim">
    <div>
		<button id="tamam"></button>
		<div class="content full-wh">
	        <div class="title">Sky WebServis</div>
	        <div class="parent full-width">
	            <div id="wsURL" class="full-wh">
	                <div><input type="textbox" class="veri" placeholder="SkyWS URL"></input></div>
	                <div class="ek-bilgi"><b>https://SERVER_IP:9200</b> veya <b>http://SERVER_IP:8200</b> ... gibi yazınız</div>
	            </div>
	        </div>
			<div id="sql" class="parent flex-row full-width">
				<div id="sql-server" class="sub-parent">
					<div><input type="textbox" class="veri" placeholder="SQL Ana Sistem"></input></div>
				</div>
				<div id="sql-db" class="sub-parent">
					<div><input type="textbox" class="veri" placeholder="SQL Veritabanı"></input></div>
				</div>
	        </div>
			<div id="sql" class="parent flex-row full-width">
				<div id="sql-user" class="sub-parent">
					<div><input type="textbox" class="veri" placeholder="SQL User" autocomplete="off"></input></div>
				</div>
				<div id="sql-pass" class="sub-parent">
					<div><input type="password" class="veri" placeholder="SQL Pass" autocomplete="new-password"></input></div>
				</div>
	        </div>
			<div class="parent full-width">
	            <div id="wsProxyServerURL" class="full-wh">
	                <div><input type="textbox" class="veri" placeholder="Yönlendirme URL"></input></div>
	                <div class="ek-bilgi"><b>https://SERVER_IP:9200</b> veya <b>http://SERVER_IP:8200</b> ... gibi yazınız</div>
					<div class="ek-bilgi"><b>*</b> <u>SkyWS URL</u> kısmında yazan WebServis üzerinden, buraya yazılan <b>Asıl Merkez Sunucu</b> ile iletişim kurulur</div>
	            </div>
	        </div>
			<div class="uzakScript parent flex-row full-width">
				<div id="uzakScriptURL" class="sub-parent">
					<div><input type="textbox" class="veri" placeholder="Uzak Script URL"></input></div>
					<div class="ek-bilgi">
						<div><b>https://SERVER_IP:9200/remote.js</b> veya <b>http://SERVER_IP:8200/remote.js</b> ... gibi yazınız</div>
						<div><b>* NOT:</b> Bu alan genellikle hata ayıklama gibi amaçlarla, Yazılım Ekibi tarafından kullanılır</div>
					</div>
				</div>
				<div id="uzakScriptIntervalSecs" class="sub-parent flex-row">
					<input type="number" class="veri" placeholder="Tekrar Süre"></input>
					<div class="ek-bilgi">sn</div>
				</div>
			</div>
		</div>
    </div>
</template>
