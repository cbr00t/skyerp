class MQYerelParamTicari extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return `${super.paramKod}.yerel` }
	constructor(e) { e = e || {}; super(e); for (const key of ['mfSinif2KolonAyarlari', 'mfSinif2Globals']) this[key] = this[key] || {} }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('mfSinif2KolonAyarlari', 'mfSinif2Globals') }
	paramSetValues(e) { super.paramSetValues(e); for (const key of ['mfSinif2KolonAyarlari', 'mfSinif2Globals']) this[key] = this[key] || {} }
}
