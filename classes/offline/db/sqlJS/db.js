class SqlJS_DB extends SqlJS_DBMgrBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get dbmi() { return true } get dbMgrClass() { return this.class } static get dbMgrClass() { return SqlJS_DBMgr } static get defaultName() { return 'main' }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, this.fsFileName] } get fsFileName() { return `${this.name || 'main'}.db` }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { autoSaveFlag: e.autoSave ?? e.autoSaveFlag ?? true, internalDB: e.internalDB }) }
	async open(e) { await super.open(e); await this.openDB(e); return this }
	async openDB(e) {
		if (!this._sql) { await initSqlJsPromise; this._sql = await initSqlJs({ locateFile: fileName => `${webRoot}/lib_external/webSQL/${fileName}` }) }
		if (!this.internalDB) { const {_sql: sql} = this; this.internalDB = new sql.Database(e?.data); await this.dbInit(e) }
		if (!this._beforeUnloadHandler) { const handler = this._beforeUnloadHandler = evt => this.onBeforeUnload({ ...e, evt }); window.addEventListener('beforeunload', handler) }
		return this
	}
	async close(e) {
		let {internalDB: db} = this; if (db) { if (this.changedFlag) { await this.kaydet(e) } await this.closeDB(e); db = null }
		await super.close(e); return this
   }
	async closeDB(e) {
		clearTimeout(this._timer_kaydetDefer); let {internalDB: db} = this;
		if (db) { await db.close(); delete this.internalDB; db = null }
		if (this._beforeUnloadHandler) { window.removeEventListener('beforeunload', this._beforeUnloadHandler); delete this._beforeUnloadHandler }
		return this
	}
	async yukleDevam(e) {
		await this.open(e); if (!await super.yukleDevam(e)) { return false }
		const {fh} = this; let data; if (fh?.kind == 'file') { const file = await fh.getFile(); data = await file?.arrayBuffer() }
		const {_sql: sql} = this; data = data ? new Uint8Array(data) : undefined; if (!data?.length) { data = undefined }
		await this.closeDB(e); await this.openDB({ ...e, data }); return true
	}
	async kaydetDevam(e) {
		const {internalDB} = this; if (!internalDB) { return false }
		if (!await super.kaydetDevam(e)) { return false } const {fh} = this; if (fh?.kind != 'file') { return false }
		const create = true, data = internalDB.export(), wr = await fh.createWritable(); try { await wr.write(data) } finally { try { wr.close() } catch (ex) { } }
		return true
	}
	async dosyadanYukle(e) {
		e = e || {}; let {data, fh} = e; await this.open(e);
		if (!data) {
			if (!fh) {
				let {file} = e; if (!file) {
					const files = await showOpenFilePicker({ multiple: false, excludeAcceptAllOption: true, types: [{ accept: { 'application/x-db': ['.db'] }, description: 'SQLite DB Dosyaları' }] });
					file = files?.[0]
				} fh = await file.getFile()
			}
			data = new Uint8Array(await fh.arrayBuffer()); if (!data?.length) { data = undefined }
		}
		if (data) {
			fh = this.fh = this.fh ?? await this.getFSHandle(true);
			if (fh) {
				const wr = fh.createWritable(); try { await wr.write(data) } finally { try { wr.close() } catch (ex) { } }
				if (!await this.yukle(e)) { return false }
			}
		}
		const db = this; return {db, fsRootDir, fh, data}
	}
	dbInit(e) {
		this.execute([
			`PRAGMA page_size = ${32 * 1024}`, 'PRAGMA journal_mode = WAL',
			`PRAGMA synchronous = NORMAL`, `PRAGMA cache_size=-${4 * 1024}`,
			`PRAGMA temp_store=MEMORY`, 'VACUUM'
		].join(`; ${CrLf}`));
		if (window?.app) { return app.dbMgr_tablolariOlustur?.(e) }
	}
	async executeAsync(e, params, isRetry) { await this.execute(e, params, isRetry) }
	execute(e, params, isRetry) {
		if (this.internalDB) { return this._execute(e, params, isRetry) }
		return this.open(e).then(() => this._execute(e, params, isRetry))
	}
	_execute(e, _params, isRetry) {
		e = e || {}; if (window?.app) { app.sqlType = 'sqlite' }
		if (typeof e == 'object' && !$.isPlainObject(e)) { const queryObj = e; e = { query: queryObj.toString() }; e.params = queryObj.params }
		if (!e.query) { e = { query: e } } if (_params !== undefined) { e.params = _params }
		let savedParams = e.params, _query = e.query, isDBWrite = this.isDBWrite(_query);
		e = { ...e }; if (_query?.getQueryYapi) { $.extend(e, _query.getQueryYapi()) } else if (_query?.query) { $.extend(e, _query) } else { e.query = _query?.toString() ?? '' }
		if (!e.query) { return null }
		if (!$.isEmptyObject(savedParams)) {
			let {params} = e; if ($.isEmptyObject(params)) { params = e.params = savedParams }
			else if (params != savedParams) { if ($.isArray(params)) { params.push(...savedParams) } else { $.extend(params, savedParams) } }
		}
		if (typeof e.query == 'string') {
			if (e.query.toUpperCase().includes('NOT NULL AUTO')) { e.query = e.query.replaceAll('rowid\t', '--rowid\t').replaceAll('rowid ', '--rowid ') }
			e.query = e.query.replaceAll('ORTAK..', '')
		}
		/*let {dbOpCallback} = this; if (!$.isFunction(dbOpCallback)) { dbOpCallback = null } if (dbOpCallback) { await dbOpCallback.call(this, { operation: 'executeSql', state: true }, e) }*/
		let _result; this.dbLastExec = e; try { console.debug('db exec', e) } catch (ex) { }
		try { _result = this.internalDB[isDBWrite ? 'run' : 'exec'](e.query, e.params) }
		catch (ex) {
			if (!isRetry) {
				const message = ex.message || ''; if (message.includes('no such column')) {
					if (window?.app?.dbMgr_tabloEksikleriTamamla) { app.dbMgr_tabloEksikleriTamamla({ ...e, db: this, noCacheReset: true }); return this.execute(e, _params, true) } }
			}
			/*if (dbOpCallback) { await dbOpCallback.call(this, { operation: 'executeSql', state: null, error: ex }, e) }*/
			throw ex
		}
		if (!_result) { return _result } _result = $.isArray(_result) ? _result[0] : null;
		if ($.isEmptyObject(_result) && (isDBWrite || (typeof _result == 'number' && result) )) { this.onChange(e) }
		let result = { rows: [] }, {columns, values} = _result || {};
		if (values) { for (const _rec of values) { const rec = {}; for (let i = 0; i < columns.length; i++) { rec[columns[i]] = _rec[i] } result.rows.push(rec) } }
		result = result.rows ?? result; /*if (dbOpCallback) { setTimeout(() => dbOpCallback.call(this, { operation: 'executeSql', state: false }, e), 20) }*/
		return result
	}
	getTables(...names) {
		let sent = new MQSent({ from: 'sqlite_master', where: { degerAta: 'table', saha: 'type' }, sahalar: 'name' });
		if (names?.length) { sent.where.inDizi(names, 'name') }
		return asSet(this.execute(sent)?.map(rec => rec.name) ?? [])
	}
	hasTables(...names) { names = Object.keys(asSet(names ?? [])); let size = names?.length; return size ? Object.keys(this.getTables(...names)).length == size : false }
	hasTable(...names) { return this.hasTables(...names) }
	getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSFileHandle(this.fsRootDir, null, createFlag) }
	onBeforeUnload(e) { if (this.changedFlag) { clearTimeout(this._timer_kaydetDefer); this.kaydet(e) } }
}
