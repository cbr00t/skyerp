class UzakDosyaSecApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get yerelParamSinif() { return MQYerelParam }
	get autoExecMenuId() { return 'MAIN' } get defaultWSPath() { return 'ws/genel' }
	constructor(e) { e = e || {}; super(e) }
	async runDevam(e) { await super.runDevam(e); const {promise_ready} = this; if (promise_ready) { promise_ready.resolve() } await this.anaMenuOlustur(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e, {yerelParamSinif} = this.class; $.extend(params, { yerel: yerelParamSinif.getInstance() }) }
	getAnaMenu(e) {
		return new FRMenu({
			items: [
				new FRMenuChoice({
					mne: 'MAIN', text: appName, block: e => {
						let part = MQMain.listeEkraniAc(e)?.part; if (qs.closeOnExit && part?.kapaninca) { part.kapaninca(e => window.close()) } }
				})
			]
		})
	}
}
