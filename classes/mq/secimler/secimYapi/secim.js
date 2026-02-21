class Secim extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static _tip2Sinif = {}; static get anaTip() { return null } static get tip() { return null }
	get parentPart() { return this._parentPart ?? app.activePart } set parentPart(value) { this._parentPart = value }
	get builder() { return this._builder ?? this.parentPart?.builder } set builder(value) { this._builder = value }
	get bosmu() { let {value} = this; return !value || empty(value) } get bosDegilmi() { return !this.bosmu }
	get ozetBilgiValue() {
		if (this.bosmu)
			return null
		let {disindakilermi, value: result} = this
		if (disindakilermi)
			result = `<b class=firebrick>HARİÇ:</b> ${result}`
		return result
	}
	get super_ozetBilgiValue() { return super.ozetBilgiValue }
	get ozetBilgiValueDuzenlenmis() {
		let {ozetBilgiValueGetter, ozetBilgiValue: value} = this
		if (ozetBilgiValueGetter)
			value = getFuncValue.call(this, ozetBilgiValueGetter, { secim: this, value })
		return value
	}

	constructor(e) { e = e || {}; super(e); this.readFrom(e) }
	static getClass(e) {
		let cls = Secim; if (e) { let {tip} = e; if (tip) cls = this._tip2Sinif[tip] ?? cls }
		return cls
	}
	static from(e) {
		if (!e) return null
		let cls = this.getClass(e); if (!cls) return null
		let result = new cls(e); return result.readFrom(e) ? result : null
	}
	get asObject() {
		let _e = { _reduce: true }
		this.writeTo(_e)
		delete _e._reduce
		for (let key of keys(_e)) {
			if (key[0] == '_') {
				delete _e[key]
				continue
			}
			let item = _e[key]
			if (empty(item)) {
				delete _e[key]
				continue
			}
		}
		return _e
	}
	readFrom(e) {
		if (!e)
			return false
		this.userData = e.userData
		this.isHidden = asBool(e.hidden)
		this.isDisabled = asBool(e.disabled)
		this.etiket = e.etiket
		this.grupKod = e.grupKod ?? e.grup?.kod ?? null
		this.placeHolder = e.placeHolder ?? e.placeholder ?? ''
		let {mfSinif} = e
		if (typeof mfSinif == 'string')
			mfSinif = getFunc.call(this, mfSinif, e)
		this.mfSinif = mfSinif
		this.ozetBilgiValueGetter = e.ozetBilgiValueGetter
		return true
	}
	writeTo(e) {
		if (this.isHidden) { e.isHidden = true }
		if (this.isDisabled) { e.isDisabled = true }
		return true
	}
	temizle(e) { return this }
	uiSetValues(e) { }
	get asHTMLElementString() { let _e = { target: '' }; this.buildHTMLElementStringInto(_e); return _e.target }
	buildHTMLElementStringInto(e) { }
	initHTMLElements(e) { }
	ozetBilgiHTMLOlustur({ liste }) {
		/*if (this.isHidden)
			return this*/
		let {ozetBilgiValueDuzenlenmis: result} = this
		if (result?.bosmu == true)
			result = null
		if (result && !isArray(result))
			result = [result]
		if (result) {
			result = result.filter(value => !!value).map(value => `<div class="float-left ozetBilgi-item">${value}</div>`)
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
	let tip2Sinif = Secim.prototype.constructor._tip2Sinif, subClasses = [Secim];
	for (let cls of subClasses) { let {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})()
