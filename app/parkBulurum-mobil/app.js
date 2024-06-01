class ParkBulurumMobilApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'CYON' }
	get defaultWSPath() { return `${super.superDefaultWSPath}/parkBulurum` }
	async run(e) { await super.run(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e /*; $.extend(params, { })*/ }
	getAnaMenu(e) {
		const {dev} = config, items = [].filter(x => !!x);
		return new FRMenu({ items })
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); const {sonSyncTS} = this; if (sonSyncTS) { args.sonSyncTS = dateTimeToString(sonSyncTS) }
	}
	wsYakindakiOtoparklar(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'yakindakiOtoparklar', args: e }) }) }
	wsOtoparkCihazlari(e) { return ajaxPost({ contentType: wsContentTypeVeCharSet, processData: false, url: app.getWSUrl({ api: 'otoparkCihazlari', args: e }) }) }
}
