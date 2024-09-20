class TopluEMailApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'CARI' }
	constructor(e) { e = e || {}; super(e) }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e) }
	paramsDuzenle(e) {
		super.paramsDuzenle(e);	 const {params} = e;
		$.extend(params, { ortak: MQOrtakParam.getInstance(), mailVT: MQVTMailParam.getInstance(), mailOrtak: MQOrtakMailParam.getInstance() })
	}
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */
		return new FRMenu({ items: [ new FRMenuChoice({ mnemonic: 'CARI', text: 'Cari Listesi', block: e => MQCari.listeEkraniAc() }) ] })
	}
	wsEMailGonder(e) {
		e = e || {}; const data = typeof e.data == 'object' ? toJSONStr(e.data) : data; delete e.data;
		return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data,
			url: app.getWSUrl({ session: null, wsPath: 'ws/eMail', api: 'send', args: e })
		})
	}
}
