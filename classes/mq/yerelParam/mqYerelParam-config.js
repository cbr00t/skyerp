class MQYerelParamConfig extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.config` } static get tanimUISinif() { return MQYerelParamConfigTanimPart }

	constructor(e) { e = e || {}; super(e) }
	static paramAttrListeDuzenle(e) {
		super.paramAttrListeDuzenle(e); const {liste} = e;
		liste.push('lastVersion', 'wsURL', 'wsProxyServerURL', 'sql', 'uzakScriptURL', 'uzakScriptIntervalSecs', 'viewportScale')
	}
	static async getRootFormBuilder(e) {
		e = e || {}; let rootBuilder = new RootFormBuilder(e);
		const _e = $.extend({}, e, { sender: this, mfSinif: this, rootBuilder: rootBuilder });
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e);
		rootBuilder = _e.rootBuilder; return rootBuilder
	}
	getRootFormBuilder(e) { return this.class.getRootFormBuilder(e) }
	static rootFormBuilderDuzenle(e) { }
	static rootFormBuilderDuzenleSonrasi(e) { }
	yukleSonrasi(e) {
		super.yukleSonrasi(e);
		if (appVersion != this.lastVersion) { app.onbellekSil(); this.lastVersion = appVersion; this.kaydet(e) }
		let temp = qs.uzakScript || qs.uzakScriptURL || qs.inject; if (temp != null) { this.uzakScriptURL = temp }
		temp = qs.uzakScriptInterval ?? qs.uzakScriptIntervalSecs; if (temp) { this.uzakScriptIntervalSecs = asFloat(temp) }
	}
	yukleVeKaydetSonrasi(e) {
		super.yukleVeKaydetSonrasi(e); const _config = new Config(); const {ws} = config, {sql} = this;
		if (!(qs.hostName || qs.hostname || qs.wsURL)) { ws.url = this.wsURL || _config.ws?.url }
		if (!(qs.proxyServerURL || qs.proxyServerUrl || qs.proxyServer || qs.proxy)) { ws.proxyServerURL = this.wsProxyServerURL || _config.ws?.proxyServerURL }
		if (sql) {
			const wsSQL = app.wsSQL = app.wsSQL || {};
			for (const key in sql) { const value = sql[key]; if (value) { wsSQL[key] = value } }
		}
		if (this.uzakScriptURL && app._initFlag) { setTimeout(() => app.uzakScript_startTimer(), 1000) }
	}
}
