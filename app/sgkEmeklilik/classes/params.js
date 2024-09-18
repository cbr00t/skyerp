class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('tip2SonDRaporRec') }
	constructor(e) { e = e || {}; super(e); for (const key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (const key of ['tip2SonRaporTanim']) { this[key] = this[key] || {} } }*/
}
class MQYerelParamConfig_SGKEmeklilikSorgu extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*yukleVeKaydetSonrasi(e) {
		super.yukleVeKaydetSonrasi(e); const {ws} = config;
		if (!(ws.url || ws.hostName)) { const host = config.class.DefaultWSHostName_SkyServer, port = 9202; ws.url = `https://${host}:${port}` }
	}*/
}
