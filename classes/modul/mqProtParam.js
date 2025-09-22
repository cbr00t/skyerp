class MQProtParam extends MQOrtakParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'PROT' } static get sinifAdi() { return 'Protection Parametreleri' }
	get paketSet() { return asSet(this.paketListe || []) } set paketSet(value) { this.paketListe = Object.keys(value || {}) }
	constructor(e) { e = e || {}; super(e); this.paketListe = e.paketListe || [] }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('paketListe')
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); let {paramci} = e
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		let form = paramci.addFormWithParent();
		form.addAltArray('paketListe')
	}
	/*async yukleSonrasiIslemler(e) {
		await super.yukleSonrasiIslemler(e); let {rec} = e, {paketListe} = rec;
		if (paketListe) { this.paketListe = Object.values(await app.xdec(paketListe)) }
		return inst
	}*/
}
