class CRMApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get offlineMode() { return super.offlineMode ?? false } get super_offlineMode() { return super.offlineMode }
	get isLoginRequired() { return true } get dbMgrClass() { return SqlJS_DBMgr } /*get defaultWSPath() { return `${super.superDefaultWSPath}/crm` }*/
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get offlineClasses() {
		return [
			...[MQMasterOrtak, MQKAOrtak, MQSayacliOrtak, MQDetayliOrtak,
					MQDetayliVeAdiOrtak, MQDetayliMasterOrtak].flatMap(cls => cls.subClasses)
			.filter(cls => !!cls.table && cls.gonderildiDesteklenirmi),
			MQMusIslemDetay
		]
	}
	get yukleOfflineClasses() { return [...this.offlineClasses, ...MQApiOrtak.subClasses] } get dropOfflineClasses() { return this.yukleOfflineClasses }
	get gonderOfflineClasses() { return this.offlineClasses }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		extend(params, {
			zorunlu: MQZorunluParam.getInstance(),
			finans: MQFinansParam.getInstance(),
			crm: MQParam_CRM.getInstance(),
			tablet: MQTabletParam.getInstance()
		})
	}
	async paramsDuzenleSonrasi(e) {
		try { await super.paramsDuzenleSonrasi(e) }
		finally { this.params.localData = await this.localDataSinif.getInstance() }
		await this.yaslandirmaGunleriDuzenle(e)
	}
	async getAnaMenu(e) {
		const {noMenuFlag, offlineMode} = this; if (noMenuFlag) { return new FRMenu() }
		let items = [
			(offlineMode ? new FRMenuChoice({ mne: 'BILGIYUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }) : null),
			/*items.push(new FRMenuChoice({ mne: 'MAIN', text: 'Main', block: e => { } }))*/
			new FRMenuCascade({ mne: 'TANIM', text: 'Sabit Tanımlar', items: [
				...[MQGorev, MQIslemTuru, MQZiyaretKonu, MQIl, MQPersonel, MQCari].map(cls =>
						new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } }))
			] }),
			...[MQZiyaretPlani, MQZiyaret, MQMusIslem].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } })),
			...[MQDurumDegerlendirme].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.tanimla({ ...e, islem: 'izle' }) } })),
			new FRMenuCascade({
				mne: 'PARAM', text: 'Parametreler', items: [
					/*new FRMenuChoice({ mne: 'CRM', text: 'CRM Parametreleri', block: e => app.params.crm.tanimla(e) }),*/
					new FRMenuChoice({ mne: 'TABLET', text: 'Tablet Parametreleri', block: e => app.params.tablet.tanimla(e) })
				]
			}),
			(offlineMode ? new FRMenuChoice({ mne: 'BILGIGONDER', text: 'Bilgi Gönder', block: e => this.bilgiGonderIstendi(e) }) : null),
		].filter(x => !!x);
		return new FRMenu({ items })
	}
	async tablolariSil(e) {
		e = e ?? {}; let classes = e.classes ?? this.dropOfflineClasses;
		let promises = []; for (const cls of classes) { promises.push(cls.offlineDropTable().then(() => window.progressManager?.progressStep()))
		} await Promise.all(promises); return this
	}
	async bilgiYukleIstendi(e) {
		e = e ?? {}; if (!await ehConfirm('Bilgi Yükle yapılsın mı?', appName)) { return } showProgress('Merkezden veri alınıyor...', appName, true);
		try { await this.bilgiYukle(e); setTimeout(() => eConfirm('Veriler yüklendi', appName), 10) }
		catch (ex) { hConfirm(getErrorText(ex), appName); throw ex }
		finally { setTimeout(() => hideProgress(), 100) }
	}
	async bilgiYukle(e) {
		e = e ?? {}; let {yukleOfflineClasses: classes} = this, promises = []; window.progressManager?.setProgressMax(classes.length * 2 + 5);
		await this.tablolariSil({ ...e, classes: undefined }); await this.dbMgr_tablolariOlustur(e); window.progressManager?.progressStep(5);
		for (const cls of classes) { promises.push(cls.offlineSaveToLocalTable().then(() => window.progressManager?.progressStep())) }
		await Promise.all(promises); window.progressManager?.progressEnd(); return this
	}
	async bilgiGonderIstendi(e) {
		e = e ?? {}; if (!await ehConfirm('Bilgi Gönder yapılsın mı?', appName)) { return } showProgress('Merkeze veri aktarılıyor...', appName, true);
		try { await this.bilgiGonder(e); eConfirm('Veriler merkeze gönderildi', appName) }
		catch (ex) { hConfirm(getErrorText(ex), appName); throw ex }
		finally { setTimeout(() => hideProgress(), 100) }
	}
	async bilgiGonder(e) {
		let classes = this.gonderOfflineClasses.filter(cls => !cls.detaymi), promises = []; window.progressManager?.setProgressMax(classes.length * 2);
		for (const cls of classes) { promises.push(cls.offlineSaveToRemoteTable().then(() => window.progressManager?.progressStep())) }
		await Promise.all(promises); delete this.trnId; window.progressManager?.progressEnd(); return this
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let db2Urls = super.dbMgr_tablolariOlustur_getQueryURLs(e) ?? {}; (db2Urls.main = db2Urls.main ?? []).push(`${webRoot_crm}/queries/main.sql`);
		return db2Urls
	}

	wsPlasiyerIcinCariler(e = {}) {
		let timeout = 10 * 60000, processData = false
		let ajaxContentType = wsContentTypeVeCharSet
		let url = app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e })
		return ajaxPost({ timeout, processData, ajaxContentType, url })
	}
	wsTopluDurum({ plasiyerKod, mustKod } = {}) {
		let params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null)
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_topluDurum', params })
	}
	wsTicKapanmayanHesap({ plasiyerKod, mustKod } = {}) {
		let { params: par } = app
		let { yaslandirmaTarihmi } = par.finans ?? {}
		let params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', type: 'bit', value: bool2Int(!!plasiyerKod) },
			( yaslandirmaTarihmi ? { name: '@argGecikmeTarihten', type: 'bit', value: bool2Int(yaslandirmaTarihmi) } : null )
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
	}
	wsTicCariEkstre({ plasiyerKod, mustKod } = {}) {
		let params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
	}
	wsTicCariEkstre_icerik({ plasiyerKod, mustKod, cariTipKod } = {}) {
		let params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
	}
	wsCariEkstre_normal(e) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_normal', args: e }) })
	}
	wsCariEkstre_fiili(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_fiili', args: e }) })
	}
	wsCariEkstre_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_detaylar', args: e }) })
	}
}
