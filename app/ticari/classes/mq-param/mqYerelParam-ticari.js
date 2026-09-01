class MQYerelParamTicari extends MQYerelParamApp {
	static{window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.yerel` }

	constructor(e = {}) {
		super(e)
		let { paramAttrListe: _keys } = this.class
		;_keys.forEach(k =>
			this[k] ??= {})
	}
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push(
			'mfSinif2KolonAyarlari', 'mfSinif2Globals', 'partGlobals',
			'tip2SonDRaporRec', 'tip2DRaporGlobals'
		)
	}
	paramSetValues(e) {
		super.paramSetValues(e)
		let { paramAttrListe: _keys } = this.class
		;_keys.forEach(k =>
			this[k] ??= {})
	}
}
