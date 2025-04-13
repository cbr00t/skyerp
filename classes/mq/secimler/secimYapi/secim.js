class Secim extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static _tip2Sinif = {}; static get anaTip() { return null } static get tip() { return null }
	get parentPart() { return this._parentPart ?? app.activePart } set parentPart(value) { this._parentPart = value }
	get builder() { return this._builder ?? this.parentPart?.builder } set builder(value) { this._builder = value }
	get bosmu() { const {value} = this; return !value || $.isEmptyObject(value) } get bosDegilmi() { return !this.bosmu }
	get ozetBilgiValue() { return this.bosmu ? null : this.value } get super_ozetBilgiValue() { return super.ozetBilgiValue } 
	get ozetBilgiValueDuzenlenmis() {
		const {ozetBilgiValueGetter} = this; let value = this.ozetBilgiValue;
		if (ozetBilgiValueGetter) { value = getFuncValue.call(this, ozetBilgiValueGetter, { secim: this, value }) }
		return value
	}

	constructor(e) { e = e || {}; super(e); this.readFrom(e) }
	static getClass(e) {
		let cls = Secim; if (e) { const {tip} = e; if (tip) cls = this._tip2Sinif[tip] ?? cls }
		return cls
	}
	static from(e) {
		if (!e) return null
		const cls = this.getClass(e); if (!cls) return null
		const result = new cls(e); return result.readFrom(e) ? result : null
	}
	get asObject() {
		const _e = { _reduce: true }; this.writeTo(_e); delete _e._reduce;
		for (const key of Object.keys(_e)) {
			if (key[0] == '_') { delete _e[key]; continue }
			const item = _e[key]; if ($.isEmptyObject(item)) { delete _e[key]; continue }
		}
		return _e
	}
	readFrom(e) {
		if (!e) { return false }
		this.userData = e.userData;
		this.isHidden = asBool(e.hidden); this.isDisabled = asBool(e.disabled);
		this.etiket = e.etiket; this.grupKod = e.grupKod ?? e.grup?.kod ?? null;
		this.placeHolder = e.placeHolder ?? e.placeholder ?? '';
		let {mfSinif} = e; if (typeof mfSinif == 'string') mfSinif = getFunc.call(this, mfSinif, e); this.mfSinif = mfSinif
		this.ozetBilgiValueGetter = e.ozetBilgiValueGetter;
		return true
	}
	writeTo(e) { e = e || {}; if (this.isHidden) { e.isHidden = true } if (this.isDisabled) { e.isDisabled = true } return true }
	temizle(e) { return this }
	uiSetValues(e) { }
	get asHTMLElementString() { const _e = { target: '' }; this.buildHTMLElementStringInto(_e); return _e.target }
	buildHTMLElementStringInto(e) { }
	initHTMLElements(e) { }
	ozetBilgiHTMLOlustur({ liste }) {
		if (this.isHidden) { return this }
		let result = this.ozetBilgiValueDuzenlenmis; if (result?.bosmu == true) { result = null }
		if (result && !$.isArray(result)) { result = [result] }
		if (result) {
			result = result.filter(value => !!value).map(value => `<div class="float-left ozetBilgi-item">${value}</div>`);
			liste.push(...result)
		}
		return this
	}
	getConvertedValue(value) { return value } getConvertedUIValue(value) { return value }
	visible() { this.isHidden = false; return this } hidden() { this.isHidden = true; return this }
	enabled() { this.isDisabled = false; return this } disabled() { this.isDisabled = true; return this }
	setOzetBilgiValueGetter(handler) { this.ozetBilgiValueGetter = handler; return this }
}

(function() {
	const tip2Sinif = Secim.prototype.constructor._tip2Sinif, subClasses = [Secim];
	for (const cls of subClasses) { const {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})()
