class MQYerelParamApp extends MQYerelParamBase {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return app.appName }

	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('secimler')
	}
}
