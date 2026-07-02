<?php header('Content-Type: text/javascript'); require_once('config.php') ?>
const APP_NAME = '<?=$globalAppName?>', VERSION = '<?=$appVersion?>'
const CACHE_NAME = `cache-${APP_NAME}-${VERSION}`
const StreamHeaders = { 'text/event-stream': true, 'application/x-ndjson': true }

addEventListener('install', async evt => {
	 evt.waitUntil((async () => {
		let cache = await caches.open(CACHE_NAME)
		let assets = getStaticAssets()
		for (let url of assets) {
			try { await cache.add(url) }
			catch (ex) { console.debug('sw', 'install', 'cache.add', ex) }
		}
		await self.skipWaiting()
	})())
})

addEventListener('activate', evt => {
	evt.waitUntil((async () => {
		let _keys = await caches.keys()
		await Promise.all(
		  _keys.filter(k => k.startsWith(`cache-${APP_NAME}-`) && k !== CACHE_NAME)
			  .map(k => caches.delete(k))
		)
		//clients.claim()
		//self.skipWaiting()
	})())
})

addEventListener('fetch', evt => {
    let { request: req = {} } = evt
	let { headers: h = {}, url, referrer } = req
	let uh = h.get?.('Upgrade')
	let ct = h.get?.('Content-Type')
	let accept = h.get?.('Accept')
	let method = req.method?.toUpperCase()
	// if (method == 'GET' && !StreamHeaders[h?.get('Content-Type')] ) return
	if (!(referrer ? url.startsWith(new URL(referrer).origin) : true))
		return
	if (method != 'GET' || uh == 'websocket' || StreamHeaders[ct] || StreamHeaders[accept])
		return
	if (url.includes('ws/skyMES'))
		return
	let resp = handleReq(req)
	evt.respondWith(resp)
})

addEventListener('push', evt => {
    let data = evt.data?.json() ?? {}
	let { title, icon } = data
	let body = data.text ?? data.body
    console.warn('sw push notification: ', data)
    evt.waitUntil(
		registration.showNotification(title, { body, icon }))
})

addEventListener('notificationclick', evt => {
    let { data, notification } = evt
	notification.close()
    let fullPath = location.origin + data.path
	clients.openWindow(fullPath)
})

addEventListener('message', async ({ data, source }) => {
	data = data?.json?.() ?? data ?? {}
	let { type = data.cmd } = data
	type = type?.toLowerCase()
	switch (type) {
		case 'version': {
			source.postMessage(({ result: VERSION }))
			break
		}
		case 'notify': {
			let { title, icon } = data
			let body = data.text ?? data.body
		    console.warn('sw push notification: ', data)
		    try {
				await registration.showNotification(title, { body, icon })
				source.postMessage(({ result: true }))
			}
			catch (ex) {
				console.error('message', 'notify', ex)
				source.postMessage(({ result: false, isError: true, error: ex.toString() }))
			}
			break
		}
	}
})


async function handleReq(req) {
	let cache = await caches.open(CACHE_NAME)
	let withCache = async () => {
		let cachedResponse = await cache.match(req)
		if (!cachedResponse)
			throw ex
		return cachedResponse
	}
	let withFetch = async () => {
		let resp = await fetch(req)
		if (resp.ok && resp.status) {
			try { await cache.put(req, await resp.clone()) }
			catch (ex) { }
		}
		return resp
	}

	let offline = navigator?.onLine === false
	if (offline)
		return await withCache()

	try { return await withFetch() }
	catch (ex) { return await withCache() }
}


function getStaticAssets() {
	return [
		'./',
		'./images/123.png',
		'./images/a.png',
		'./images/aciklama.png',
		'./images/add-r.png',
		'./images/ajax-loader.gif',
		'./images/anaMenu_fiyatGor.png',
		'./images/arac.png',
		'./images/arrows-expand-right.pn',
		'./images/asagi.png',
		'./images/attach.png',
		'./images/attachment.png',
		'./images/attribution.png',
		'./images/ayarlar.png',
		'./images/aynideger.png',
		'./images/a_z.png',
		'./images/b.png',
		'./images/B.svg',
		'./images/background-viologo.png',
		'./images/bakim.png',
		'./images/barkod.png',
		'./images/baslat.png',
		'./images/belgeTransfer.png',
		'./images/bilgiGonder.png',
		'./images/bilgiYukle.png',
		'./images/binary.png',
		'./images/bird_mini.png',
		'./images/birlestir.png',
		'./images/blank.png',
		'./images/button_down.png',
		'./images/button_up.png',
		'./images/C.svg',
		'./images/cark.svg',
		'./images/chart.png',
		'./images/cift_asagi.png',
		'./images/cift_sag.png',
		'./images/cift_sol.png',
		'./images/cihaz_to_merkez.png',
		'./images/close-1.png',
		'./images/close.png',
		'./images/compress-right.png',
		'./images/copy.png',
		'./images/D.svg',
		'./images/damla.png',
		'./images/db_copy.png',
		'./images/degistir.png',
		'./images/deselectall.png',
		'./images/download.png',
		'./images/eIslemGonder.png',
		'./images/eIslemImza.png',
		'./images/eIslemIptal.png',
		'./images/eIslemKaldir.png',
		'./images/ekle.png',
		'./images/elterm.png',
		'./images/email.png',
		'./images/erase.png',
		'./images/excel.png',
		'./images/export.png',
		'./images/F.svg',
		'./images/file-document.png',
		'./images/filtre.png',
		'./images/firmalogo.png',
		'./images/fisListesi.png',
		'./images/fis_ozet_bilgi.png',
		'./images/fis_ozet_bilgi.svg',
		'./images/fiyatGor.png',
		'./images/font-spacing.png',
		'./images/G.svg',
		'./images/geciciFisleriSil.png',
		'./images/genel.png',
		'./images/geri.png',
		'./images/geri_blue.png',
		'./images/gib_logo.jpg',
		'./images/graydot.png',
		'./images/greendot.png',
		'./images/grid2excel.png',
		'./images/gridKolonDuzenle.png',
		'./images/Group 15.png',
		'./images/Group 21.png',
		'./images/Group 23.png',
		'./images/Group-59.png',
		'./images/Group-60.png',
		'./images/Group-61.png',
		'./images/Group-62.png',
		'./images/Group-63.png',
		'./images/Group-64.png',
		'./images/Group-65.png',
		'./images/Group-66.png',
		'./images/Group15.png',
		'./images/H.svg',
		'./images/header-background.jpg',
		'./images/hesap_makinesi.png',
		'./images/hizli_bul.png',
		'./images/home_icon.png',
		'./images/html.png',
		'./images/iletisim.png',
		'./images/iptal.png',
		'./images/izle.png',
		'./images/izle.svg',
		'./images/J.svg',
		'./images/json.gif',
		'./images/json.png',
		'./images/json2.png',
		'./images/k.png',
		'./images/K.svg',
		'./images/k2a.png',
		'./images/kalanıYaz.png',
		'./images/kaydet.png',
		'./images/kaydet_yazdir.png',
		'./images/kes.png',
		'./images/keyboard.png',
		'./images/kilitle.png',
		'./images/kilitle.svg',
		'./images/kisi.png',
		'./images/klavye.png',
		'./images/kopyala.png',
		'./images/L.svg',
		'./images/list-1.png',
		'./images/list.png',
		'./images/listeden_sec.png',
		'./images/loading.gif',
		'./images/logout.png',
		'./images/logo_217x217.png',
		'./images/logo_512x512.png',
		'./images/M.svg',
		'./images/map.png',
		'./images/maviTamam.png',
		'./images/merkez_to_cihaz.png',
		'./images/musteri_durumu.svg',
		'./images/musteri_durumu_anaMenu',
		'./images/N.svg',
		'./images/nav-toggle.png',
		'./images/numaratorler.png',
		'./images/P.svg',
		'./images/parametreler.png',
		'./images/pdf.png',
		'./images/personel.png',
		'./images/pin.png',
		'./images/play-list-add.png',
		'./images/Polygon 3.png',
		'./images/Polygon 4.png',
		'./images/Polygon 5.png',
		'./images/popup_asagi.png',
		'./images/popup_yukari.png',
		'./images/power_off.png',
		'./images/power_on.png',
		'./images/printer.png',
		'./images/promosyon.png',
		'./images/R.svg',
		'./images/raporlar.png',
		'./images/rapor_ekrana.png',
		'./images/reddot.png',
		'./images/rotaListesi.png',
		'./images/S.svg',
		'./images/sabitle.png',
		'./images/sablon.png',
		'./images/sag.png',
		'./images/sag_kalin.png',
		'./images/scrshot_620x320.png',
		'./images/scrshot_wide.png',
		'./images/search.png',
		'./images/sec.png',
		'./images/selectall.png',
		'./images/sepet.png',
		'./images/sepete_ekle.png',
		'./images/Set5_Sirali-84.png',
		'./images/Set5_Sirali-85.png',
		'./images/Set5_Sirali-87.png',
		'./images/Set5_Sirali-88.png',
		'./images/seviye_ac.png',
		'./images/seviye_kapat.png',
		'./images/sil.png',
		'./images/sky_logo.jpg',
		'./images/sky_logo.png',
		'./images/sky_logo.svg',
		'./images/sol.png',
		'./images/solmenu_raporlar.png',
		'./images/solmenu_raporlar.svg',
		'./images/sol_kalin.png',
		'./images/son_stoktan_sec.png',
		'./images/son_stoktan_sec.svg',
		'./images/son_stok_guncelle.svg',
		'./images/soru.png',
		'./images/T.svg',
		'./images/tamam.png',
		'./images/tamam_blue.png',
		'./images/tamEkranAc.png',
		'./images/tamEkranAcBeyaz.png',
		'./images/tamEkranKapat.png',
		'./images/tamEkranKapatBeyaz.png',
		'./images/tazele.png',
		'./images/telefon.png',
		'./images/temizle.png',
		'./images/tl.png',
		'./images/toplam.png',
		'./images/topluluk.png',
		'./images/trash.png',
		'./images/upload.png',
		'./images/uyari.png',
		'./images/V.svg',
		'./images/vio.png',
		'./images/viologo.png',
		'./images/vio_logo_01.png',
		'./images/vio_logo_02.png',
		'./images/web_active.png',
		'./images/web_passive.png',
		'./images/x.png',
		'./images/Y.svg',
		'./images/yazdir.png',
		'./images/yellowdot.png',
		'./images/yeni.png',
		'./images/yukari.png',
		'./images/Z.svg',
		'./images/z_a.png'
	]
}
