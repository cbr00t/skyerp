class SqlJS_DBMgrBase extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static DBWriteClauses = ['INTO ', 'INSERT ', 'UPDATE', 'DELETE', 'CREATE ', 'DROP ', 'ALTER ', 'EXEC ', 'IMPORT ', 'BEGIN TRAN', 'COMMIT', 'ROLLBACK']
	get sqlJSmi() { return this.class.sqlJSmi } static get sqlJSmi() { return true }
	static get defaultDeferSaveMS() { return 2000 } static get defaultVersion() { return 1 } get fsRootDirPaths() { return [app.rootName, app.appName, 'db', SqlJS_DBMgr.kod] }
	get fsRootDir() { return '/' + this.fsRootDirPaths.filter(x => !!x).join('/') } get fsFileName() { return this.name || SqlJS_DB.defaultName } get isOpen() { return !!this.fh }
	constructor(e) {
		e = e ?? {}; super(e); $.extend(this, {
			changedFlag: e.changed ?? e.changedFlag, deferSaveMS: e.deferSaveMS ?? this.class.defaultDeferSaveMS,
			fh: e.fh ?? e.fileHandle, name: e.name, version: e.version ?? this.class.defaultVersion
		})
	}
	async yukle(e = {}) {
		app.onAjaxStart?.('loading')
		let result
		try {
			await this.open(e)
			let {fh} = this
			if (!fh) {
				try { fh = this.fh = await this.getFSHandle(false) }
				catch { return false }
			}
			app.onAjaxStart?.('loading')
			result = await this.yukleDevam(e)
			app.onAjaxStart?.('loading')
			app.onAjaxEnd?.(false)
		}
		catch (ex) {
			app.onAjaxEnd?.(true)
			throw ex
		}
		this.notChanged(e)
		return result
	}
	yukleDevam() { return true }
	async kaydet({ onlyIfChanged } = {}) {
		let {fh, changedFlag} = this
		if (onlyIfChanged && !changedFlag)
			return false
		let result
		app.onAjaxStart?.('saving')
		try {
			if (!fh)
				fh = this.fh = await this.getFSHandle(true)
			app.onAjaxStart?.('saving')
			result = await this.kaydetDevam(e)
			app.onAjaxEnd?.(false)
		}
		catch (ex) {
			app.onAjaxEnd?.(true)
			throw ex
		}
		this.notChanged(e)
		return result
	}
	kaydetDevam() { return true }
	kaydetDefer(e) {
		clearTimeout(this._timer_kaydetDefer)
		this._timer_kaydetDefer = setTimeout(async e => {
			try { await this.kaydet(e) }
			catch (ex) { console.error(ex) }
			finally { delete this._timer_kaydetDefer }
		}, this.deferSaveMS)
		return this
	}
	async sil(e) {
		clearTimeout(this._timer_kaydetDefer)
		let {fh} = this
		if (!fh) {
			try { fh = this.fh = await this.getFSHandle(false) }
			catch (ex) { }
		}
		if (!fh)
			return false
		try {
			await this.close(e)
			await (fh.kind == 'file' ? fh.remove() : fh.remove({ recursive: true }))
			this.open(e)
			return true
		}
		catch (ex) { return false }
	}
	open(e) { return this }
	close(e) { clearTimeout(this._timer_kaydetDefer); this.fh = null; return this }
	forEach() { return this.iterEntries() }
	onChange(e) {
		this.changed(e)
		this.kaydetDefer(e)
	}
	getFSHandle(e) {
		let createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag
		return getFSDirHandle(this.fsRootDir, createFlag)
	}
	setName(value) { return this.name = value } setFH(value) { return this.fh = value }
	changed() { this.changedFlag = true; return this }
	notChanged() { this.changedFlag = false; return this }
	static isDBWrite(e) {
		let query = e?.query ?? e; if (query) {
			let query = e.query ?? e; if (query.isDBWriteClause) { return true }
			if (typeof query == 'string') {
				let queryUpper = query.toUpperCase(), {DBWriteClauses} = this;
				return DBWriteClauses.some(clause => queryUpper.includes(clause))
			}
		}
		return false
	}
	isDBWrite(e) { return this.class.isDBWrite(e) }
}
