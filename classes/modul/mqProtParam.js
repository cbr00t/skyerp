class MQProtParam extends MQOrtakParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'PROT' } static get sinifAdi() { return 'Protection Parametreleri' }
	get paketSet() { return asSet(this.paketListe || []) } set paketSet(value) { this.paketListe = Object.keys(value || {}) }
	constructor(e) { e = e || {}; super(e); this.paketListe = e.paketListe || [] }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent(); form.addAltArray('paketListe')
	}
	async tekilOku(e) {
		let inst = await super.tekilOku(e);
		if (inst) { let {paketListe} = inst; if (paketListe) { paketListe = inst.paketListe = Object.values(await app.xdec(paketListe)) } }
		return inst
	}
}
