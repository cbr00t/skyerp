class MQYerelParamApp extends MQYerelParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return app.appName }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('secimler') }
}
