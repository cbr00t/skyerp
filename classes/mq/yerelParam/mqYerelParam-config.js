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
		const sender =  this, mfSinif = this, _e = $.extend({}, e, { sender, mfSinif, rootBuilder });
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e);
		rootBuilder = _e.rootBuilder; return rootBuilder
	}
	getRootFormBuilder(e) { return this.class.getRootFormBuilder(e) } static rootFormBuilderDuzenle(e) { } static rootFormBuilderDuzenleSonrasi(e) { }
	yukleSonrasi(e) {
		super.yukleSonrasi(e); if (appVersion != this.lastVersion) { app.onbellekSil(); this.lastVersion = appVersion; this.kaydet(e) }
		let temp = qs.uzakScript || qs.uzakScriptURL || qs.inject; if (temp != null) { this.uzakScriptURL = temp }
		temp = qs.uzakScriptInterval ?? qs.uzakScriptIntervalSecs; if (temp) { this.uzakScriptIntervalSecs = asFloat(temp) }
	}
	kaydetSonrasi(e) {
		super.kaydetSonrasi(e); const {_eskiInst} = this; let kritikDegisiklikVarmi = false;
		if (_eskiInst) {
			for (const key of ['wsURL', 'wsProxyServerURL']) { if (this[key] != _eskiInst[key]) { kritikDegisiklikVarmi = true; break } }
			if (!kritikDegisiklikVarmi) {
				const sql = this.sql ?? {}, _sql = _eskiInst.sql ?? {};
				for (const [key, value] of Object.entries(sql)) { if (value != _sql[key]) { kritikDegisiklikVarmi = true;  break } }
			}
			if (kritikDegisiklikVarmi) {
				config.session.afterLogin().finally(() => app.updateAppTitle());
				setTimeout(() => {
					ehConfirm(`<p>Yapılan değişikliklerin geçerli olması için programa yeniden giriş yapılmalıdır</p><p class="bold firebrick">Devam edilsin mi?</p>`, appName)
						.then(rdlg => { if (rdlg) { app.logoutIstendi() } });
					let wnd = $('.jqx-window:last'); if (wnd?.length) {
						wnd.find('div > .jqx-window-header').addClass('bg-lightred');
						wnd.find(`div > .content > .buttons > button:eq(0)`).addClass('bg-lightgreen')
					}
				}, 100)
			}
		}
		if (!kritikDegisiklikVarmi) { this._eskiInst = this.deepCopy() }
	}
	yukleVeKaydetSonrasi(e) {
		super.yukleVeKaydetSonrasi(e); const {ws} = config, {sql} = this, _config = new Config();
		if (!(qs.hostName || qs.hostname || qs.wsURL)) { ws.url = this.wsURL || _config.ws?.url }
		if (!(qs.proxyServerURL || qs.proxyServerUrl || qs.proxyServer || qs.proxy)) { ws.proxyServerURL = this.wsProxyServerURL || _config.ws?.proxyServerURL }
		if (sql) {
			const wsSQL = app.wsSQL = app.wsSQL || {};
			for (const key in sql) { const value = sql[key]; if (value) { wsSQL[key] = value } }
		}
		if (this.uzakScriptURL && app._initFlag) { setTimeout(() => app.uzakScript_startTimer(), 1000) }
	}
}
