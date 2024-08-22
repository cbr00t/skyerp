class UzakDosyaSecApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get yerelParamSinif() { return MQYerelParam } get autoExecMenuId() { return 'MAIN' }
	get defaultWSPath() { return 'ws/genel' } get currentRelDir() { const {subDirs} = this; return (subDirs || []).filter(x => !!x).join('/').trim('/') }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			rootDir: (e.url ?? e.rootDir ?? qs.url ?? qs.rootDir)?.trim('/'), includeDirs: e.includeDirs ?? qs.includeDirs,
			ipcCallbackKey: e.ipc ?? e.ipcKey ?? qs.ipc ?? qs.ipcKey, subDirs: (e.dir ?? qs.dir ?? e.subDir ?? qs.subDir)?.trim('/')?.split('/')?.filter(x => !!x) || []
		})
	}
	async runDevam(e) { await super.runDevam(e); const {promise_ready} = this; if (promise_ready) { promise_ready.resolve() } await this.anaMenuOlustur(e) }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e, {yerelParamSinif} = this.class; $.extend(params, { yerel: yerelParamSinif.getInstance() }) }
	getAnaMenu(e) {
		return new FRMenu({
			items: [
				new FRMenuChoice({
					mne: 'MAIN', text: appName, block: e => {
						let part = MQMain.listeEkraniAc(e)?.part; if (qs.closeOnExit && part?.kapaninca) { part.kapaninca(e => window.close()) } }
				})
			]
		})
	}
}
