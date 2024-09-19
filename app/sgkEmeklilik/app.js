class SGKEmeklilikApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' }
	get sgkWSPath() { return 'ws/sgk' } get sgkWSURL() { return qs.sgkWSURL || `https://${config.class.DefaultWSHostName_SkyServer}:9202` }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_SGKEmeklilikSorgu }
	async runDevam(e) {
		await super.runDevam(e); const {promise_login} = this; if (promise_login) { promise_login.resolve() }
		await this.promise_ready; await this.anaMenuOlustur(e); this.show()
	}
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance() }) }
	getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		let _tcKimlikNoListe = qs.tcKimlikNoListe ?? qs.tcKimlikNo ?? qs.tckn;
		const tcKimlikNoSet = asSet(_tcKimlikNoListe ? _tcKimlikNoListe.split(delimWS).filter(x => !!x).map(x => x.trim()) : {});
		return new FRMenu({ items: [ new FRMenuChoice({ mne: 'MAIN', text: MQEmeklilikSorgu.sinifAdi, block: e => MQEmeklilikSorgu.listeEkraniAc({ ...e, args: { tcKimlikNoSet } }) }) ]})
	}
	wsEmekliDurumKontrol(e) {			/* e: { tcKimlikNo: array.join(wsDelim)  |  args: { tcKimlikNo: array } } */
		e = e || {}; let args = e, {data} = args; const {sgkWSURL, sgkWSPath} = this; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		args = { vioIsyeri: '001', ...args }; return ajaxPost({ url: this.getWSUrl({ ws: { url: sgkWSURL }, wsPath: sgkWSPath, session: null, api: 'emekliDurumKontrol', args, data }) })
	}
}
