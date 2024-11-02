class CRMApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get offlineMode() { return super.offlineMode ?? false } get super_offlineMode() { return super.offlineMode }
	get isLoginRequired() { return true } get dbMgrClass() { return SqlJS_DBMgr } /*get defaultWSPath() { return `${super.superDefaultWSPath}/crm` }*/
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance(), crm: MQParam_CRM.getInstance() }) }
	async getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() } let items = [
			new FRMenuCascade({ mne: 'TANIM', text: 'Sabit Tanımlar', items: [
				...[MQGorev, MQIslemTuru, MQZiyaretKonu, MQIl, MQPersonel, MQCari].map(cls =>
						new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } }))
			] }),
			...[MQZiyaretPlani, MQZiyaret, MQMusIslem].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } })),
			...[MQDurumDegerlendirme].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.tanimla({ ...e, islem: 'izle' }) } }))
		];
		/*items.push(new FRMenuChoice({ mne: 'MAIN', text: 'Main', block: e => { } }))*/
		return new FRMenu({ items })
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let db2Urls = super.dbMgr_tablolariOlustur_getQueryURLs(e) ?? {};
		(db2Urls.main = db2Urls.main ?? []).push(`${webRoot_crm}/queries/main.sql`);
		return db2Urls
	}
	wsPlasiyerIcinCariler(e) {
		e = e || {}; return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e })
		})
	}
	wsTicKapanmayanHesap(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
	}
	wsTicCariEkstre(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
	}
	wsTicCariEkstre_icerik(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
	}
}
