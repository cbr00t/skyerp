class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*yukleSonrasi(e) {
		if (!app.isAdmin) {
			for (const key of ['sql', 'wsProxyServerURL']) { delete this[key] }
			const {DefaultWSHostName_SkyServer: host, DefaultSSLWSPort: port} = config.class;
			this.wsURL = `https://${host}:${port}`
		}
		super.yukleSonrasi(e)
	}*/
}
class MQParam_CRM extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'CRM Parametreleri' } static get paramKod() { return 'CRMPARAM' }
	constructor(e) { e = e || {}; super(e) /*$.extend(this, { sablon: e.sablon }) */ }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		/*let form = paramci.addFormWithParent()*/
	}
	paramHostVarsDuzenle(e) { super.paramHostVarsDuzenle(e); const {hv} = e /*; $.extend(hv, { sablon: this.sablon })*/ }
	paramSetValues(e) { super.paramSetValues(e); const {rec} = e /*; $.extend(this, { sablon: rec.sablon }); this.fix(e)*/ }
}
