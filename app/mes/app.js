class MESApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'HATYONETIMI-YENI' }
	get configParamSinif() { return MQYerelParamConfig_MES } get yerelParamSinif() { return MQYerelParam } get isLoginRequired() { return false }
	get defaultWSPath() { return `ws/skyMES` } get useCloseAll() { return true }
	get sqlExecWSPath() { return `${this.defaultWSPath}/hatIzleme` } get otoTazeleYapilirmi() { return !!(this.otoTazeleFlag && !this.otoTazeleDisabledFlag) }
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
		let result = this._durumKod2KisaAdi;
		if (result === undefined) { result = this._durumKod2KisaAdi = { '': 'BOŞTA', '?': 'BOŞTA', 'BK': 'BEK', 'DV': '|&gt;', 'DR': '||' } }
		return result
	}
	get hatBilgi_recDonusum() {
		let result = this._hatBilgi_recDonusum;
		if (result === undefined) { result = this._hatBilgi_recDonusum = { hatID: 'hatKod', hatAciklama: 'hatAdi', id: 'tezgahKod', aciklama: 'tezgahAdi' } }
		return result
	}
	get sabitHatKodListe() { return this.params.config.hatKodListe } get sabitHatKodSet() { return asSet(this.sabitHatKodListe) }
	get sabitHatKodVarmi() { return !!this.sabitHatKodListe?.length }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			otoTazeleFlag: ((e.otoTazele ?? e.otoTazeleFlag ?? qs.otoTazele) && !(e.disableRefresh ?? e.disableRefreshFlag ?? asBool(qs.disableRefresh))) ?? null,
			tazeleKontrolSn: asFloat(e.tazeleKontrolSn ?? qs.tazeleKontrolSn ?? e.kontrolSn ?? qs.kontrolSn ?? 8)
		})
	}
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e) }
	async afterRun(e) { await super.afterRun(e); this.tazele_startTimer(e) }
	paramsDuzenle(e) {
		super.paramsDuzenle(e); const {params} = e; $.extend(params, {
			localData: MQLocalData.getInstance(), mes: MQParam_MES.getInstance(), hatYonetimi: MQParam_HatYonetimi.getInstance() })
	}
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */ const items = [
			new FRMenuChoice({ mne: MQHatYonetimi.kodListeTipi, text: MQHatYonetimi.sinifAdi, block: e => MQHatYonetimi.listeEkraniAc() }),
			new FRMenuChoice({ mne: HatYonetimiPart.kodListeTipi, text: HatYonetimiPart.sinifAdi, block: e => new HatYonetimiPart().run() })
		];
		/*if (config.dev) {*/
		items.push(...[MQSinyal, MQLEDDurum].map(cls =>
			new FRMenuChoice({ mne: cls.kodListeTipi || cls.classKey, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) })))
		/*}*/
		return new FRMenu({ items })
	}
	async getTezgahKod2Rec(e) {
		e = e || {}; let tezgahKodListe = e.kodListe ?? e.tezgahKodListe ?? e.hedefTezgahKodListe; if ($.isEmptyObject(tezgahKodListe)) { tezgahKodListe = null }
		let hatKodListe = e.hatKodListe ?? e.hedefHatKodListe; if ($.isEmptyObject(hatKodListe)) { hatKodListe = null }
		let sent = new MQSent({
			from: 'tekilmakina tez', fromIliskiler: [{ from: 'ismerkezi hat', iliski: 'tez.ismrkkod = hat.kod' }], where: [`tez.kod <> ''`],
			sahalar: ['RTRIM(tez.kod) tezgahKod', 'RTRIM(tez.aciklama) tezgahAdi', 'RTRIM(tez.ismrkkod) hatKod', 'RTRIM(hat.aciklama) hatAdi' ]
		});
		if (tezgahKodListe) { sent.where.inDizi(tezgahKodListe, 'tez.kod') } if (hatKodListe) { sent.where.inDizi(hatKodListe, 'tez.ismrkkod') }
		const result = {}; let recs = await app.sqlExecSelect(sent); for (const rec of recs) { result[rec.kod] = rec }
		return result
	}
	async getTezgahKod2Rec(e) {
		let result = {}, recs = await this.wsTezgahBilgileri(e); if (!recs) { return null }
		for (let _rec of recs) {
			let {ip} = _rec, tezgahKod = _rec.tezgahKod ?? _rec.tezgahkod ?? _rec.id, tezgahAdi = _rec.tezgahAdi ?? _rec.tezgahadi ?? _rec.aciklama;
			let durumKod = _rec.durumKod ?? _rec.durum ?? _rec.durum, rec = { ip, tezgahKod, tezgahAdi, durumKod }; result[tezgahKod] = rec
		}
		return result
	}
	async getTezgahIP2Rec(e) {
		let result = {}, recs = await this.wsTezgahBilgileri(e); if (!recs) { return null }
		for (let _rec of recs) {
			let {ip} = _rec, tezgahKod = _rec.tezgahKod ?? _rec.tezgahkod ?? _rec.id, tezgahAdi = _rec.tezgahAdi ?? _rec.tezgahadi ?? _rec.aciklama;
			let durumKod = _rec.durumKod ?? _rec.durum ?? _rec.durum, rec = { ip, tezgahKod, tezgahAdi, durumKod }; result[ip] = rec
		}
		return result
	}
	tazele_startTimer(e) {
		let {evtSource} = this; if (evtSource) { return this }
		const wsPath = `${this.defaultWSPath}/makineDurum`, url = this.getEventStreamURL('tezgahBilgileri', wsPath); if (!url) { return this }
		evtSource = this.evtSource = new EventSource(url);
		evtSource.onmessage = ({ data }) => { try { if (this.otoTazeleYapilirmi) { this.signalChange({ ...e, data }) } } catch (ex) { console.error(ex) } };
		evtSource.onerror = evt => this.tazeleTimerKontrol_proc({ ...e, evt });
		let {tazeleKontrolSn} = this; if (tazeleKontrolSn) { this.timer_tazeleKontrol = setInterval(() => this.tazeleTimerKontrol_proc(e), tazeleKontrolSn * 1000) }
		return this
	}
	tazele_stopTimer(e) {
		let {evtSource, timer_tazeleKontrol} = this; if (evtSource) { evtSource.close(); evtSource = this.evtSource = null }
		if (timer_tazeleKontrol) { clearInterval(timer_tazeleKontrol); timer_tazeleKontrol = this.timer_tazeleKontrol = null }
		return this
	}
	tazeleTimerKontrol_proc(e) {
		let {otoTazeleYapilirmi, evtSource, sonSyncTS, tazeleKontrolSn} = this; if (!otoTazeleYapilirmi) { return this }
		let {readyState} = evtSource ?? {}; if (readyState == null || readyState == EventSource.CLOSED) { this.tazele_stopTimer(e).tazele_startTimer(e) }
		if (sonSyncTS && now() - sonSyncTS > tazeleKontrolSn * 1000) { this.tazele_stopTimer(e).tazele_startTimer(e) }
		return this
	}
	signalChange(e) {
		e = e || {}; const {activeWndPart} = this; if (!activeWndPart) { return this }
		const {mfSinif} = activeWndPart; e.gridPart = e.sender = activeWndPart;
		if (mfSinif?.onSignalChange) { mfSinif.onSignalChange(e) } else if (activeWndPart.onSignalChange) { activeWndPart.onSignalChange(e) }
		return this
	}
	otoTazeleTempDisable(e) {
		e = e || {}; const waitMS = (typeof e == 'object' ? e.waitMS : e) || 10000;
		this.otoTazeleDisabledFlag = true; setTimeout(() => this.otoTazeleDisabledFlag = false, waitMS); return this
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); const {sonSyncTS} = this; if (sonSyncTS) { args.sonSyncTS = dateTimeToString(sonSyncTS) }
	}
	wsParams(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/params', args: e }) }) }
	wsTezgahBilgileri(e) { e = e || {}; const sync = e.sync = asBool(e.sync), timeout = sync ? ajaxInfiniteMS : 15000; return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/tezgahBilgileri', args: e }) }) }
	wsTekilTezgahBilgi(e) { e = e || {}; const sync = e.sync = asBool(e.sync), timeout = sync ? ajaxInfiniteMS : 15000; return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/tekilTezgahBilgi', args: e }) }) }
	wsEkNotlar(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/ekNotlar', args: e }) }) }
	wsGerceklemeYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gerceklemeYap', args: e }) }) }
	wsCevrimArttir(e) { return this.wsFnIslemi({ ...e, id: 'primary' }) }
	wsKesmeYap(e) { return this.wsFnIslemi({ ...e, id: 'secondary' }) }
	wsTersKesmeYap(e) { e = e ?? {}; let {delayMS} = e; return this.wsFnIslemi({ ...e, id: 'f9', delayMS }) }
	wsKartNo(e) { return this.wsFnIslemi({ ...e, id: 'kart' }) }
	wsIptal(e) { return this.wsFnIslemi({ ...e, id: 'iptal' }) }
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
	wsEkBilgiTopluSifirla(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/ekBilgiTopluSifirla', args: e }) }) }
	wsIsAta(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/isAta', args: e }) }) }
	wsBaslatDurdur(e) { return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/baslatDurdur', args: e }) }) }
	wsIsBittiYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'makineDurum/isBitti', args: e }) }) }
	wsSirayaAl(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/sirayaAl', args: e }) }) }
	wsSiradanKaldir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/siradanKaldir', args: e }) }) }
	wsBaskaTezgahaTasi(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/baskaTezgahaTasi', args: e }) }) }
	wsIsParcala(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/isParcala', args: e }) }) }
	wsCokluIsParcala(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/cokluIsParcala', args: e }) }) }
	wsBekleyenIs_yeniOperasyonlar(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/bekleyenIs_yeniOperasyonlar', args: e }) }) }
	wsBekleyenIs_devredisiYapKaldir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/bekleyenIs_devredisiYapKaldir', args: e }) }) }
	wsYeniOperListeEkle(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/yeniOperListeEkle', args: e }) }) }
	wsSureDuzenle(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/sureDuzenle', args: e }) }) }
	wsGorevZamanEtuduVeriGetir(e) {
		return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtuduVeriGetir', args: e }) })
			.catch(ex => { if (ex.statusText == 'parsererror') { return null } else { throw ex } })
	}
	wsGorevZamanEtuduDegistir(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtuduDegistir', args: e }) }) }
	wsGorevZamanEtudSureGuncelleVeKapat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/gorevZamanEtudSureGuncelleVeKapat', args: e }) }) }
	wsTopluDevamYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluDevamYap', args: e }) }) }
	wsTopluDuraksamaYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluDuraksamaYap', args: e }) }) }
	wsTopluIsBittiYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluIsBittiYap', args: e }) }) }
	wsTopluGerceklemeYap(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluGerceklemeYap', args: e }) }) }
	wsTopluZamanEtuduBaslat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluZamanEtuduBaslat', args: e }) }) }
	wsTopluZamanEtuduKapat(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/topluZamanEtuduKapat', args: e }) }) }
	wsGetLEDDurumAll(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/getLEDDurumAll', args: e }) }) }
	wsGetLEDDurum(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/getLEDDurum', args: e }) }) }
	wsSetLEDDurum(e) { return ajaxPost({ url: this.getWSUrl({ api: 'hatIzleme/setLEDDurum', args: e }) }) }
}
