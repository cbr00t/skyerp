class EIslMustahsil extends EIslemOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'MS' }
	static get altBolum() { return 'EMustahsil' }
	static get sinifAdi() { return 'e-Müstahsil' }
	static get kisaAdi() { return 'e-Müs' }
	static get paramSelector() { return 'eMustahsil' }
	static get xmlRootTag() { 'cac:??' }
	get xsltBelirtec() { return 'EMustahsil' }
}
