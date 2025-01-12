class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('x') }
	constructor(e) { e = e || {}; super(e); for (const key of ['y']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (const key of ['y']) { this[key] = this[key] || {} } }*/
}
