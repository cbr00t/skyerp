class MQOrtakParamBase extends MQParam {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return `ORTAK..${super.table}` }
	constructor(e) { e = e || {}; super(e) }
}
