class CRMApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get offlineMode() { return super.offlineMode ?? false } get super_offlineMode() { return super.offlineMode }
	get isLoginRequired() { return true } get dbMgrClass() { return SqlJS_DBMgr } /*get defaultWSPath() { return `${super.superDefaultWSPath}/crm` }*/
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get offlineClasses() {
		return [
			...[MQMasterOrtak, MQKAOrtak, MQSayacliOrtak, MQDetayliOrtak, MQDetayliVeAdiOrtak, MQDetayliMasterOrtak].flatMap(cls => cls.subClasses).filter(cls => !!cls.table),
			MQMusIslemDetay
		]
	}
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance(), crm: MQParam_CRM.getInstance() }) }
	async getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() } let items = [
			new FRMenuChoice({ mne: 'BILGI_YUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }),
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
	async tablolariSil(e) {
		e = e ?? {}; let classes = e.classes ?? this.offlineClasses;
		let promises = []; for (const cls of classes) { promises.push(cls.offlineDropTable().then(() => window.progressManager?.progressStep()))
		} await Promise.all(promises);
	}
	async bilgiYukleIstendi(e) {
		e = e ?? {}; if (!await ehConfirm('Bilgi Yükle yapılsın mı?', appName)) { return } showProgress('Merkezden veri alınıyor...', appName, true);
		try { await this.bilgiYukle(e) } catch (ex) { hConfirm(getErrorText(ex), appName); throw ex }
		finally { setTimeout(() => { eConfirm('Veriler yüklendi', appName); setTimeout(() => hideProgress(), 100) }, 50) }
	}
	async bilgiYukle(e) {
		e = e ?? {}; let {offlineClasses: classes} = this;
		window.progressManager?.setProgressMax(classes.length * 2 + 5); await this.tablolariSil({ ...e, classes }); await this.dbMgr_tablolariOlustur(e);
		window.progressManager?.progressStep(5); let promises = []; for (const cls of classes) {
			promises.push(cls.offlineSaveToLocalTable().then(() => window.progressManager?.progressStep()))
		} await Promise.all(promises);
		window.progressManager?.progressEnd()
		return this
	}
	async bilgiGonder(e) {
		let classes = [MQMasterOrtak, MQKAOrtak, MQSayacliOrtak, MQDetayliOrtak, MQDetayliVeAdiOrtak].flatMap(cls => cls.subClasses).filter(cls => !!cls.table);
		let promises = []; for (const cls of classes) { promises.push(cls.offlineSaveToRemoteTable()) } await Promise.all(promises);
		delete this.trnId; return this
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let db2Urls = super.dbMgr_tablolariOlustur_getQueryURLs(e) ?? {}; (db2Urls.main = db2Urls.main ?? []).push(`${webRoot_crm}/queries/main.sql`); return db2Urls }
	wsPlasiyerIcinCariler(e) {
		e = e || {}; return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e }) })
	}
	wsTicKapanmayanHesap(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null), (mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/ { name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
	}
	wsTicCariEkstre(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null), (mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/ { name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
	}
	wsTicCariEkstre_icerik(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null), (mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/ { name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
	}
}
