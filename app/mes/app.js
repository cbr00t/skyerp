class MESApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'HAT-YONETIMI' }
	get configParamSinif() { return MQYerelParamConfig_MES } get defaultWSPath() { return `ws/skyMES` }
	get sqlExecWSPath() { return `${this.defaultWSPath}/hatIzleme` } get otoTazeleYapilirmi() { return this.otoTazeleFlag && this.tazele_timeout }
	get durumKod2Aciklama() {
		let result = this._durumKod2Aciklama; if (result === undefined) {
			result = this._durumKod2Aciklama = {
				'': 'BOŞTA', '?': 'BELİRSİZ', 'BK': 'BEKLEMEDE', 'DV': '|&gt; &nbsp;[ DEVAM ]', 'DR': '|| &nbsp;[ DURDU ]', 'AT': 'İŞ ATANDI', 'PI': 'PERSONEL İSTENDİ', 'PR': 'PERSONEL GİRİŞİ',
				'MI': 'MİKTAR İSTENDİ', 'MK': 'MİKTAR GİRİŞİ', 'BI': 'BİTTİ İSTENDİ', 'KP': 'İŞ KAPANDI', 'BT': 'İŞ BİTTİ'
			}
		}
		return result
	}
	get durumKod2KisaAdi() {
		let result = this._durumKod2KisaAdi; if (result === undefined) { result = this._durumKod2KisaAdi = { '': 'YOK', '?': 'YOK', 'DV': '|&gt;', 'DR': '||' } }
		return result
	}
	get sabitHatKod() { return this.params.config.hatKod }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			otoTazeleFlag: ((e.otoTazele ?? e.otoTazeleFlag ?? asBool(qs.otoTazele)) && !(e.disableRefresh ?? e.disableRefreshFlag ?? asBool(qs.disableRefresh))) ?? false,
			tazele_timeout: asFloat(e.tazele_timeout ?? qs.tazele_timeout ?? qs.timeout ?? 3000)
		})
	}
	async runDevam(e) {
		await super.runDevam(e); /* await this.loginIstendi(e); */ const {promise_login} = this; if (promise_login) { promise_login.resolve() }
		await this.promise_ready; await this.anaMenuOlustur(e)
	}
	afterRun(e) { super.afterRun(e); this.tazele_startTimer(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { yerel: MQYerelParam.getInstance(), mes: MQParam_MES.getInstance() }) }
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */
		const items = [ new FRMenuChoice({ mnemonic: 'HAT-YONETIMI', text: 'Hat Yönetimi', block: e => MQHatYonetimi.listeEkraniAc() }) ]
		return new FRMenu({ items })
	}
	tazele_startTimer(e) {
		const {tazele_timeout} = this; this.tazele_stopTimer(e);
		this._timer_tazele = setTimeout(async () => { try { await this.tazele_timerProc(e) } catch (ex) { console.error('timerError', ex, getErrorText(ex)) } finally { this.tazele_startTimer(e)} }, tazele_timeout);
		return this
	}
	tazele_stopTimer(e) { const key = '_timer_tazele'; clearTimeout(this[key]); return this }
	tazele_timerProc(e) {
		if (!(this.otoTazeleYapilirmi && appActivatedFlag)) { return }
		this.signalChange(e)
	}
	wsParams(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/params', args: e }) }) }
	wsTezgahBilgileri(e) { e = e || {}; const sync = e.sync = asBool(e.sync), timeout = sync ? ajaxInfiniteMS : 15000; return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/tezgahBilgileri', args: e }) }) }
	wsTekilTezgahBilgi(e) { e = e || {}; const sync = e.sync = asBool(e.sync), timeout = sync ? ajaxInfiniteMS : 15000; return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/tekilTezgahBilgi', args: e }) }) }
	wsEkNotlar(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/ekNotlar', args: e }) }) }
	wsGerceklemeYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gerceklemeYap', args: e }) }) }
	wsCevrimArttir(e) { return this.wsFnIslemi($.extend({}, e, { id: 'primary' })) }
	wsKesmeYap(e) { return this.wsFnIslemi($.extend({}, e, { id: 'secondary' })) }
	wsTersKesmeYap(e) { return this.wsFnIslemi($.extend({}, e, { id: 'tersKesme' })) }
	wsKartNo(e) { return this.wsFnIslemi($.extend({}, e, { id: 'kart' })) }
	wsIptal(e) { return this.wsFnIslemi($.extend({}, e, { id: 'iptal' })) }
	wsFnIslemi(e) { return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/fnIslemi', args: e }) }) }
	wsSiradakiIsler(e) { const timeout = 15000; return ajaxPost({ timeout, url: this.getWSUrl({ api: 'hatIzleme/siradakiIsler', args: e }) }) }
	wsBekleyenIsler(e) { const timeout = 20000; return ajaxPost({ timeout, url: this.getWSUrl({ api: 'hatIzleme/bekleyenIsler', args: e }) }) }
	wsSiraDuzenle(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/siraDuzenle', args: e }) }) }
	wsBekleyenIsEmirleri(e) { const timeout = 20000; return ajaxPost({ timeout, url: this.getWSUrl({ api: 'hatIzleme/bekleyenIsEmirleri', args: e }) }) }
	wsBekleyenOperasyonlar(e) { const timeout = 20000; return ajaxPost({ timeout, url: this.getWSUrl({ api: 'hatIzleme/bekleyenOperasyonlar', args: e }) }) }
	wsPersoneller(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/personeller', args: e }) }) }
	wsPersonelAta(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/personelAta', args: e }) }) }
	wsDuraksamaNedenleri(e) { return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/duraksamaNedenleri', args: e }) }) }
	wsEkBilgiAta(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/ekBilgiAta', args: e }) }) }
	wsEkBilgiTopluSifirla(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/wsEkBilgiTopluSifirla', args: e }) }) }
	wsIsAta(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/isAta', args: e }) }) }
	wsBaslatDurdur(e) { return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/baslatDurdur', args: e }) }) }
	wsIsBittiYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/isBittiYap', args: e }) }) }
	wsSirayaAl(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/sirayaAl', args: e }) }) }
	wsSiradanKaldir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/siradanKaldir', args: e }) }) }
	wsBaskaTezgahaTasi(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/baskaTezgahaTasi', args: e }) }) }
	wsIsParcala(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/isParcala', args: e }) }) }
	wsCokluIsParcala(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/cokluIsParcala', args: e }) }) }
	wsBekleyenIs_yeniOperasyonlar(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/bekleyenIs_yeniOperasyonlar', args: e }) }) }
	wsBekleyenIs_devredisiYapKaldir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/bekleyenIs_devredisiYapKaldir', args: e }) }) }
	wsYeniOperListeEkle(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/yeniOperListeEkle', args: e }) }) }
	wsSureDuzenle(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/sureDuzenle', args: e }) }) }
	wsGorevZamanEtuduVeriGetir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtuduVeriGetir', args: e }) }) }
	wsGorevZamanEtuduDegistir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtuduDegistir', args: e }) }) }
	wsGorevZamanEtudSureGuncelleVeKapat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtudSureGuncelleVeKapat', args: e }) }) }
	wsTopluDuraksamaYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluDuraksamaYap', args: e }) }) }
	wsTopluIsBittiYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluIsBittiYap', args: e }) }) }
	wsTopluGerceklemeYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluGerceklemeYap', args: e }) }) }
	wsTopluZamanEtuduBaslat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluZamanEtuduBaslat', args: e }) }) }
	wsTopluZamanEtuduKapat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluZamanEtuduKapat', args: e }) }) }
	wsGetLEDDurumAll(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/getLEDDurumAll', args: e }) }) }
	wsGetLEDDurum(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/getLEDDurum', args: e }) }) }
	wsSetLEDDurum(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/setLEDDurum', args: e }) }) }
	signalChange(e) {
		e = e || {}; const {activeWndPart} = this; if (activeWndPart?.tazele) { activeWndPart.tazele(e) }
		for (const pageInfo of Object.values(app.mainWindowsPart.id2TabPage)) {
			const {asilPart} = pageInfo?.content?.data('part') || {}; if (asilPart && asilPart != this) {
				let {gridWidget} = asilPart?.gridPart ?? asilPart; if (asilPart.tazele) { asilPart.tazele() }
				/*if (gridWidget) { gridWidget.beginupdate(); gridWidget.endupdate() } else if (asilPart.tazele) { asilPart.tazele() }*/
			}
		}
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); const {sonSyncTS} = this; if (sonSyncTS) { args.sonSyncTS = dateTimeToString(sonSyncTS) }
	}
}