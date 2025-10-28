class CRMApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get isLoginRequired() { return true } get dbMgrClass() { return SqlJS_DBMgr } /*get defaultWSPath() { return `${super.superDefaultWSPath}/crm` }*/
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		$.extend(params, { localData: MQLocalData.getInstance(), crm: MQParam_CRM.getInstance() })
	}
	async getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() } let items = [
			new FRMenuCascade({ mne: 'TANIM', text: 'Sabit Tanımlar', items: [
				...[MQGorev, MQIslemTuru, MQZiyaretKonu, MQIl, MQPersonel, MQCari].map(cls =>
						new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } }))
			] }),
			...[MQZiyaretPlani, MQZiyaret, MQMusIslem].map(cls =>
					new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => { cls.listeEkraniAc(e) } }))
		];
		/*items.push(new FRMenuChoice({ mne: 'MAIN', text: 'Main', block: e => { } }))*/
		return new FRMenu({ items })
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let db2Urls = super.dbMgr_tablolariOlustur_getQueryURLs(e) ?? {};
		(db2Urls.main = db2Urls.main ?? []).push(`${webRoot_crm}/queries/main.sql`);
		return db2Urls
	}
	wsX(e) { let args = e || {}; delete args.data; return ajaxPost({ url: this.getWSUrl({ api: 'x', args }) }) }
	wsY(e) {
		let args = e || {}, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ timeout: 13 * 1000, processData: false, ajaxContentType: wsContentType, url: this.getWSUrl({ api: 'y', args }), data })
	}
}
