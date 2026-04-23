class MQYerelParamConfig extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.config` } static get tanimUISinif() { return MQYerelParamConfigTanimPart }
	constructor(e) { e = e || {}; super(e) }
	static paramAttrListeDuzenle(e) {
		super.paramAttrListeDuzenle(e); let {liste} = e;
		liste.push('lastVersion', 'wsURL', 'wsProxyServerURL', 'sql', 'colorScheme', 'uzakScriptURL', 'uzakScriptIntervalSecs', 'viewportScale')
	}
	static tanimla(e) {
		let {tanimUISinif} = this; if (!tanimUISinif) { return null }
		e = e || {}; e._eskiInst = e._eskiInst ?? e.inst?._eskiInst; let _e = { ...e, islem: e.islem || 'yeni', mfSinif: e.mfSinif ?? this };
		try {
			let part = new tanimUISinif(_e), result = part.run(), content = part.layout, {title} = part, args = part.wndArgs;
			let wnd = part.wnd = createJQXWindow({ content, title, args });
			wnd.on('close', evt => { part.destroyPart(); $('body').removeClass('bg-modal') });
			setTimeout(() => $('body').addClass('bg-modal'), 1); return { part, wnd, result }
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	static async getRootFormBuilder(e) {
		e = e || {}; let rootBuilder = new RootFormBuilder(e);
		let sender =  this, mfSinif = this, _e = extend({}, e, { sender, mfSinif, rootBuilder });
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e);
		rootBuilder = _e.rootBuilder; return rootBuilder
	}
	getRootFormBuilder(e) { return this.class.getRootFormBuilder(e) }
	static rootFormBuilderDuzenle(e) { } static rootFormBuilderDuzenleSonrasi(e) { }
	paramHostVarsDuzenle(e) {
		super.paramHostVarsDuzenle(e); let {colorScheme} = this; if (colorScheme?.char !== undefined) { colorScheme = colorScheme.char }
		let {hv} = e; extend(hv, { colorScheme })
	}
	paramSetValues(e) {
		super.paramSetValues(e); let {rec} = e; let {colorScheme} = rec;
		if (colorScheme !== undefined && colorScheme?.char === undefined) { colorScheme = new ColorScheme(colorScheme) }
		extend(this, { colorScheme })
	}
	yukleSonrasi(e) {
		super.yukleSonrasi(e); if (appVersion != this.lastVersion) { app.onbellekSil(); this.lastVersion = appVersion; this.kaydet(e) }
		let temp = qs.dark ? 'dark' : qs.light ? '' : this.colorScheme;
		if (temp != null) { if (temp.char === undefined) { temp = new ColorScheme(temp) } this.colorScheme = temp }
		temp = qs.uzakScript || qs.uzakScriptURL || qs.inject; if (temp != null) { this.uzakScriptURL = temp }
		temp = qs.uzakScriptInterval ?? qs.uzakScriptIntervalSecs; if (temp) { this.uzakScriptIntervalSecs = asFloat(temp) }
	}
	async kaydetSonrasi(e) {
		await super.kaydetSonrasi(e)
		let { _eskiInst } = this, kritikDegisiklikVarmi = false
		if (_eskiInst) {
			for (let key of ['wsURL', 'wsProxyServerURL']) {
				if (this[key] != _eskiInst[key]) {
					kritikDegisiklikVarmi = true
					break
				}
			}
			if (!kritikDegisiklikVarmi) {
				let sql = this.sql ?? {}, _sql = _eskiInst.sql ?? {}
				for (let [key, value] of entries(sql)) {
					if (value != _sql[key]) {
						kritikDegisiklikVarmi = true
						break
					}
				}
			}
			if (kritikDegisiklikVarmi) {
				config.session?.afterLogin?.().finally(() =>
					app.updateAppTitle())
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
		if (!kritikDegisiklikVarmi)
			this._eskiInst = this.deepCopy()
	}
	async yukleVeKaydetSonrasi(e) {
		await super.yukleVeKaydetSonrasi(e)
		let { ws } = config, { sql } = this
		let _config = new Config()
		if (!(qs.hostName || qs.hostname || qs.wsURL))
			ws.url = this.wsURL || _config.ws?.url
		if (!(qs.proxyServerURL || qs.proxyServerUrl || qs.proxyServer || qs.proxy))
			ws.proxyServerURL = this.wsProxyServerURL || _config.ws?.proxyServerURL
		if (sql) {
			let wsSQL = app.wsSQL = app.wsSQL || {};
			for (let key in sql) {
				let value = sql[key]
				if (value)
					wsSQL[key] = value
			}
		}
		this.applyColorScheme(e)
		if (this.uzakScriptURL && app._initFlag)
			setTimeout(() => app.uzakScript_startTimer(), 1000)
	}
	applyColorScheme(e) {
		let { colorScheme } = this
		if (colorScheme != null)
			config.colorScheme = colorScheme?.char ?? colorScheme
		config.applyColorScheme(e)
	}
}
