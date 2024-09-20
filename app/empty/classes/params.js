class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*constructor(e) { e = e || {}; super(e); for (const key of ['xyz']) { this[key] = this[key] || {} } }
	 paramSetValues(e) { super.paramSetValues(e); for (const key of ['xyz']) { this[key] = this[key] || {} } }*/
}
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*yukleVeKaydetSonrasi(e) {
		super.yukleVeKaydetSonrasi(e); const {ws} = config;
		if (!(ws.url || ws.hostName)) { const host = config.class.DefaultWSHostName_SkyServer, port = 9202; ws.url = `https://${host}:${port}` }
	}*/
}
