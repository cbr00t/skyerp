class SkyApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); await this.initLayout(e) }
	initLayout(e) { } getAnaMenu(e) { return new FRMenu() }

	async afterRun(e) {
		await this._promise_login
		this.mustKod = await app.wsGetMustKod()
		await super.afterRun(e)
	}
	async fetchVioConfig(e) {
		const promise = this.promise_vioConfig = new $.Deferred();
		try {
			const result = await this.wsReadVioConfigBasitWithTanitim()
			if (result) { this.vioConfig = result; this.vioMerkezHostName = result.vioMerkezHostName; this.tanitim = result.tanitim }
			promise.resolve(result); return result
		}
		catch (ex) { promise.reject(ex); throw ex }
	}
	wsReadVioConfigBasitWithTanitim(e) { e = e || {}; return this.wsReadVioConfigBasit($.extend({}, e, { tanitim: true })) }
	wsReadVioConfigBasit(e) { e = e || {}; const url = this.getWSUrl({ api: 'readVioConfigBasit', args: e }); return ajaxPost({ timeout: 13000, url: url }) }
	vioMerkez_getWSUrlBase(e = {}) {
		return this.getWSUrlBase({
			...e,
			ws: this.vioMerkez_getWSConfigModifiers(e)
		})
	}
	vioMerkez_getWSUrl(e = {}) { 
		return this.getWSUrl({
			...e,
			ws: this.vioMerkez_getWSConfigModifiers(e),
			buildAjaxArgs: this.vioMerkez_buildAjaxArgs
		})
	}
	vioMerkez_getWSConfigModifiers(e) {
		return { ssl: true, hostName: this.vioMerkezHostName, port: 9200 }
	}
	buildAjaxArgs(e = {}) {
		let args = e.args ?? {}
		let { mustKod = args.mustKod } = e
		if (mustKod)
			args.mustKod = mustKod
		super.buildAjaxArgs(e)
	}
	vioMerkez_buildAjaxArgs(e = {}) {
		let args = e.args ??= {}
		let { mustKod = args.mustKod } = e
		if (mustKod)
			args.mustKod = mustKod
		else
			throw { isError: true, rc: 'noData', errorText: 'Müşteri belirsiz iken VIO Merkez sunucu ile iletişim kurulamaz' }
		
		this.buildAjaxArgs(e)
	}
}
