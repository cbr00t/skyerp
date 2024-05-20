class MQYerelParamOrtak extends MQYerelParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'ORTAK' }
	constructor(e) { e = e || {}; super(e) }
}
