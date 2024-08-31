class MQOrtakParam extends MQOrtakParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'ORTAK' } static get sinifAdi() { return 'Ortak Parametreler' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { autoComplete_maxRow: 500 }) }
	static paramYapiDuzenle(e) { super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`) }
}
