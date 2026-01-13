class SqlJS_DB extends SqlJS_DBMgrBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get dbmi() { return true } get dbMgrClass() { return this.class } static get dbMgrClass() { return SqlJS_DBMgr } static get defaultName() { return 'main' }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, this.fsFileName] } get fsFileName() { return `${this.name || 'main'}.db` }
	constructor(e = {}) {
		super(e)
		$.extend(this, { dbMgr: e.dbMgr, autoSaveFlag: e.autoSave ?? e.autoSaveFlag ?? true, internalDB: e.internalDB })
	}
	async open(e) {
		await super.open(e)
		await this.openDB(e)
		if (!this._beforeUnloadHandler) {
			let handler = this._beforeUnloadHandler = evt => this.onBeforeUnload({ ...e, evt })
			window.addEventListener('beforeunload', handler)
		}
		return this
	}
	async openDB(e) {
		if (!this._sql) {
			await initSqlJsPromise
			this._sql = await initSqlJs({ locateFile: fileName => `${webRoot}/lib_external/webSQL/${fileName}` })
		}
		if (!this.internalDB) {
			let {_sql: sql} = this
			this.internalDB = new sql.Database(e?.data)
			await this.dbInit(e)
		}
		return this
	}
	async close(e) {
		let {internalDB: db} = this
		if (db) {
			if (this.changedFlag)
				await this.kaydet(e)
			await this.closeDB(e)
			db = null
		}
		await super.close(e)
		if (this._beforeUnloadHandler) {
			window.removeEventListener('beforeunload', this._beforeUnloadHandler)
			delete this._beforeUnloadHandler
		}
		return this
   }
	async closeDB(e) {
		clearTimeout(this._timer_kaydetDefer)
		let {internalDB: db} = this
		if (db) {
			await db.close()
			db = this.internalDB = null
		}
		return this
	}
	async yukleDevam(e) {
		await this.open(e)
		if (!await super.yukleDevam(e)) {
			// await this.openDB(e)
			return false
		}
		let {fh} = this, data
		if (fh?.kind == 'file') {
			let file = await fh.getFile()
			data = await file?.arrayBuffer()
		}
		let {_sql: sql} = this
		data = data ? new Uint8Array(data) : undefined
		if (!data?.length)
			data = undefined
		await this.closeDB(e)
		await this.openDB({ ...e, data })
		return true
	}
	async kaydetDevam(e) {
		let {internalDB} = this
		if (!internalDB)
			return false
		if (!await super.kaydetDevam(e))
			return false
		let {fh} = this
		if (fh?.kind != 'file')
			return false
		let writeFile = async (fh, data) => {
			let wr = await fh.createWritable()
			try { return await wr.write(data) }
			finally { try { wr.close() } catch {} }
		}
		try { this.execute('COMMIT') }    // trn varsa kapansın
		catch (ex) { }
		let data = internalDB.export()
		let {fsRootDir: filePath} = this, {name} = fh
		let bckName = `${name}.bck`
		try {
			let file = await fh.getFile()
			if (file.size > 64 * 1024) {
				let {fsRootDirPaths} = this
				let bckPath = [...fsRootDirPaths.slice(0, -1), bckName].join('/')
				let fh_bck = await getFSFileHandle(bckPath, null, true)
				let sr = file.stream()
				let sw = await fh_bck.createWritable()
				await sr.pipeTo(sw)
				// fh = this.fh = await this.getFSHandle(true)
			}
		}
		catch (ex) { console.error(ex) }
		await writeFile(fh, data)
		return true
	}
	async dosyadanYukle(e = {}) {
		let {data, fh} = e
		await this.open(e)
		if (!data) {
			if (!fh) {
				let {file} = e
				if (!file) {
					let files = await showOpenFilePicker({
						multiple: false, excludeAcceptAllOption: true,
						types: [{ accept: { 'application/x-db': ['.db'] }, description: 'SQLite DB Dosyaları' }]
					})
					file = files?.[0]
				}
				fh = await file.getFile()
			}
			data = new Uint8Array(await fh.arrayBuffer())
			if (!data?.length)
				data = undefined
		}
		if (data) {
			fh = this.fh = this.fh ?? await this.getFSHandle(true)
			if (fh) {
				let wr = fh.createWritable()
				try { await wr.write(data) }
				finally { try { wr.close() } catch (ex) { } }
				if (!await this.yukle(e))
					return false
			}
		}
		let db = this
		return {db, fsRootDir, fh, data}
	}
	async dbInit(e) {
		this.execute([
			`PRAGMA page_size = ${64 * 1024}`,    // Page size in Bytes
			`PRAGMA cache_size=-${256 * 1024}`,   // (-): Memory Size in KB | (+): n Page Count
			`PRAGMA synchronous = OFF`,
			// 'PRAGMA synchronous = NORMAL',
			// 'PRAGMA journal_mode = WAL',
			'PRAGMA journal_mode = MEMORY',
			`PRAGMA temp_store = MEMORY`,
			'VACUUM'
		].join(`; ${CrLf}`))
		let {autoSaveFlag: wasAutoSave} = this
		try {
			if (wasAutoSave)
				this.noAutoSave()
			if (window?.app)
				try { return await app.dbMgr_tablolariOlustur?.(e) }
				catch (ex) { cerr(ex); return }
		}
		finally {
			if (wasAutoSave)
				this.autoSave()
		}
	}
	async executeAsync(e, params, isRetry) {
		return await this.execute(e, params, isRetry)
	}
	execute(e, params, isRetry, noAutoTrim) {
		if (this.internalDB) { return this._execute(e, params, isRetry, noAutoTrim) }
		return this.open(e).then(() => this._execute(e, params, isRetry, noAutoTrim))
	}
	_execute(e = {}, _params, isRetry, _noAutoTrim) {
		if (window?.app)
			app.sqlType = 'sqlite'
		if (typeof e == 'object' && !$.isPlainObject(e)) {
			let queryObj = e; e = { query: queryObj.toString() }
			e.params = queryObj.params
		}
		if (!e.query)
			e = { query: e }
		if (_params !== undefined)
			e.params = _params
		e.noAutoTrim = e.noAutoTrim ?? _noAutoTrim;
		if (e.query?.toplumu) {
			let {liste} = e.query, result
			for (let subQuery of liste) {
				subQuery.params = []
				let queryYapi = subQuery.getQueryYapi()
				if (empty(queryYapi))
					continue
				app?.onAjaxStart?.(true)
				try { 
					result = this._execute({ ...e, ...queryYapi })
					app?.onAjaxEnd?.(false)
				}
				catch (ex) {
					app?.onAjaxEnd?.(true)
					throw ex
				}
			}
			return result
		}
		let savedParams = e.params, _query = e.query, isDBWrite = this.isDBWrite(_query)
		e = { ...e }
		if (_query?.getQueryYapi)
			$.extend(e, _query.getQueryYapi())
		else if (_query?.query)
			$.extend(e, _query)
		else
			e.query = _query?.toString() ?? ''
		if (!e.query)
			return null
		if (!empty(savedParams)) {
			let {params} = e
			if (empty(params)) { params = e.params = savedParams }
			else if (params != savedParams) {
				if ($.isArray(params)) { params.push(...savedParams) }
				else { $.extend(params, savedParams) }
			}
			e.params = params
		}
		if (typeof e.query == 'string') {
			if (e.query.toUpperCase().includes('NOT NULL AUTO')) { e.query = e.query.replaceAll('rowid\t', '--rowid\t').replaceAll('rowid ', '--rowid ') }
			e.query = e.query.replaceAll('ORTAK..', '').replaceAll(`N'`, `'`)
		}
		/*let {dbOpCallback} = this; if (!$.isFunction(dbOpCallback)) { dbOpCallback = null } if (dbOpCallback) { await dbOpCallback.call(this, { operation: 'executeSql', state: true }, e) }*/
		let _result; this.dbLastExec = e
		app?.onAjaxStart?.(true)
		try {
			_result = this.internalDB[isDBWrite ? 'run' : 'exec'](e.query, e.params)
			// _result = this.internalDB.exec(e.query, e.params)
			try { console.debug('db exec', { ...e, db: this, isDBWrite, result: _result }) }
			catch (ex) { }
		}
		catch (ex) {
			if (!isRetry) {
				let message = ex.message || ''
				if (message.includes('no such column') && window?.app?.dbMgr_tabloEksikleriTamamla) {
					app.dbMgr_tabloEksikleriTamamla({ ...e, db: this, noCacheReset: true })
					return this.execute(e, _params, true)
				}
			}
			/*if (dbOpCallback) { await dbOpCallback.call(this, { operation: 'executeSql', state: null, error: ex }, e) }*/
			clearTimeout(this._timer_dbIndicatorReset)
			this._timer_dbIndicatorReset = setTimeout(() => app?.onAjaxEnd?.(true), 10)
			if (ex?.toString().includes( 'no transaction is active') || ex?.toString().includes('cannot start a transaction within a transaction'))
				console.debug('sqlite exec', { ...e, db: this, isDBWrite, ex })
			else
				throw ex
		}
		if (!_result) {
			clearTimeout(this._timer_dbIndicatorReset)
			this._timer_dbIndicatorReset = setTimeout(() => app?.onAjaxEnd?.(false), 1)
			return _result
		}
		_result = isArray(_result) ? _result[0] : null
		if (empty(_result) && (isDBWrite || (typeof _result == 'number' && result)))
			this.onChange(e)
		let result = { rows: [] }, {columns, values} = _result || {}
		if (values) {
			let {noAutoTrim} = e
			for (let _rec of values) {
				let rec = {}
				for (let i = 0; i < columns.length; i++) {
					let value = _rec[i]
					if (!noAutoTrim && typeof value == 'string')
						value = value.trimEnd()
					rec[columns[i]] = value
				}
				result.rows.push(rec)
			}
		}
		result = result.rows ?? result /*if (dbOpCallback) { setTimeout(() => dbOpCallback.call(this, { operation: 'executeSql', state: false }, e), 20) }*/
		clearTimeout(this._timer_dbIndicatorReset)
		this._timer_dbIndicatorReset = setTimeout(() => app?.onAjaxEnd?.(false), 1)
		return result
	}
	getTables(...names) {
		// PRAGMA table_info()
		//  {cid: 0, name: 'kod', type: 'TEXT', pk: 1, notnull: 1, dflt_value: null, …}
		let sent = new MQSent({
			from: 'sqlite_master', sahalar: ['*'],
			where: { degerAta: 'table', saha: 'type' }
		})
		let {where: wh} = sent
		if (names?.length) { wh.inDizi(names, 'name') }
		let recs = this.execute(sent) ?? []
		return fromEntries(recs.map(_ => [_.name, _]))
	}
	hasTables(...names) { return !empty(this.getTables(...names)) }
	hasTable(...names) { return this.hasTables(...names) }
	getColumns(table, ...names) {
		let nameSet = empty(names) ? null : asSet(names)
		let recs = this.execute(`PRAGMA table_info(${table})`) ?? []
		let result = {}
		for (let rec of recs) {
			let {name} = rec
			if (!nameSet?.[name])
				result[name] = rec
		}
		return result
	}
	hasColumns(table, ...names) { return !empty(this.getColumns(table, ...names)) }
	hasColumn(...names) { return this.hasColumns(...names) }
	getFSHandle(e) {
		let createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag
		return getFSFileHandle(this.fsRootDir, null, createFlag)
	}
	onChange(e = {}) {
		this.changed(e)
		if (this.autoSaveFlag) {
			let target = this.dbMgr ?? this
			target.kaydetDefer({ ...e, onlyIfChanged: true })
		}
	}
	onBeforeUnload(e) {
		if (!this.changedFlag)
			return
		clearTimeout(this._timer_kaydetDefer)
		this.kaydet(e)
	}
	autoSave() { this.autoSaveFlag = true; return this }
	noAutoSave() { this.autoSaveFlag = false; return this }
}
