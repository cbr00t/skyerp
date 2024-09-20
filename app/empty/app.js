class EmptyApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'MAIN' } get isLoginRequired() { return super.isLoginRequired }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { localData: MQLocalData.getInstance() }) }
	getAnaMenu(e) {
		const {noMenuFlag} = this; if (noMenuFlag) { return new FRMenu() }
		return new FRMenu({ items: [ new FRMenuChoice({ mne: 'MAIN', text: 'MAIN', block: e => {} }) ]})
	}
	wsX(e) {
		e = e || {}; let args = e, {data} = args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		return ajaxPost({ url: this.getWSUrl({ api: 'x', args, data }) })
	}
}
