class SkyApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); await this.initLayout(e) }
	initLayout(e) { } getAnaMenu(e) { return new FRMenu() }

	async fetchVioConfig(e) {
		const promise = this.promise_vioConfig = new $.Deferred();
		try {
			const result = await this.wsReadVioConfigBasitWithTanitim();
			if (result) { this.vioConfig = result; this.vioMerkezHostName = result.vioMerkezHostName; this.tanitim = result.tanitim }
			promise.resolve(result); return result
		}
		catch (ex) { promise.reject(ex); throw ex }
	}
	wsReadVioConfigBasitWithTanitim(e) { e = e || {}; return this.wsReadVioConfigBasit($.extend({}, e, { tanitim: true })) }
	wsReadVioConfigBasit(e) { e = e || {}; const url = this.getWSUrl({ api: 'readVioConfigBasit', args: e }); return ajaxPost({ timeout: 13000, url: url }) }
	vioMerkez_getWSUrlBase(e) { e = e || {}; return this.getWSUrlBase($.extend({}, e, { ws: this.vioMerkez_getWSConfigModifiers(e) })) }
	vioMerkez_getWSUrl(e) { e = e || {}; return this.getWSUrl($.extend({}, e, { ws: this.vioMerkez_getWSConfigModifiers(e), buildAjaxArgs: this.vioMerkez_buildAjaxArgs })) }
	vioMerkez_getWSConfigModifiers(e) { return { ssl: true, hostName: this.vioMerkezHostName, port: 9200 } }
	buildAjaxArgs(e) {
		e = e || {}; const args = e.args = e.args || {};
		const tanitim = e.tanitim || args.tanitim // || this.vioConfig?.tanitim?.trim()
		if (tanitim) { args.tanitim = tanitim }
		super.buildAjaxArgs(e)
	}
	vioMerkez_buildAjaxArgs(e) {
		e = e || {}; const args = e.args = e.args || {};
		const tanitim = e.tanitim || args.tanitim // || this.vioConfig?.tanitim?.trim()
		if (tanitim) { args.tanitim = tanitim }
		else { throw { isError: true, rc: 'noData', errorText: 'Tanıtım belirsiz iken VIO Merkez sunucu ile iletişim kurulamaz' } }
		this.buildAjaxArgs(e)
	}
}
