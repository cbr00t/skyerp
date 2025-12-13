class SqlJS_DBMgr extends SqlJS_DBMgrBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbMgrmi() { return this.class.dbMgrmi }
	static get kod() { return 'sqlJS' } static get aciklama() { return 'SqlJS' } static get dbMgrmi() { return true }
	static get default() { let dbMgr = new this(); dbMgr.addDatabase(); return dbMgr }
	get dbNames() { return Object.keys(this.databases) } get dbArray() { return Object.values(this.databases) } get default() { return this.dbArray[0] }
	get main() { return this.getDatabase(SqlJS_DB.defaultName) } get param() { return this.getDatabase('param') }
	get sabit() { return this.getDatabase('sabit') } get data() { return this.getDatabase('data') }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { databases: e.databases ?? e.dbList ?? {} }) }
	async yukleDevam(e) {
		e = typeof e == 'object' ? e : { import: e }
		let {import: importFlag} = e
		if (!await super.yukleDevam(e))
			return false
		let {fh: dh} = this
		if (!dh || dh.kind == 'file')
			return false
		let type2Data = {}, enm = dh.values()
		while (true) {
			let {done, value: fh} = await enm.next()
			if (done)
				break
			if (fh.kind != 'file')
				continue
			let file = await fh.getFile(), {name} = fh
			if (name[0] != '.' && name.includes('.'))
				continue
			let _data = await file.text()
			try { _data = _data ? JSON.parse(_data) : undefined }
			catch (ex) { _data = null; console.error(ex) }
			if (_data)
				type2Data[name] = _data
		}
		if (!importFlag)
			this.clearDatabases(e)
		let {databases} = this, {metadata: { version } = {}} = type2Data
		if (version !== undefined)
			this.version = version
		enm = dh.values()
		let ext = '.db'
		while (true) {
			let {done, value: fh} = await enm.next()
			if (done)
				break
			if (fh.kind != 'file')
				continue
			let {name} = fh
			if (!name.endsWith(ext))
				continue
			name = name.slice(0, -ext.length)
			if (!this.hasDatabase(name))
				this.addDatabase(name)
		}
		for (let db of this.iterValues(e)) {
			try { await db.yukle(e) }
			catch (ex) { console.error(ex, getErrorText(ex), db) }
		}
		return true
	}
	async kaydetDevam(e) {
		if (!await super.kaydetDevam(e))
			return false
		let {fh: dh} = this
		if (!dh || dh.kind == 'file')
			return false
		let {name, version, fsRootDir} = this
		let type2Data = { metadata: { name, version } }
		let create = true
		for (let [name, value] of entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value
			if (fileContent === undefined)
				continue
			let fh = await dh.getFileHandle(name, { create })
			if (!fh)
				return false
			fileContent += CrLf
			let wr = await fh.createWritable()
			try { await wr.write(fileContent) }
			finally { try { wr.close() } catch { } }
		}
		let promises = []
		for (let db of this.iterValues(e))
			promises.push(db.kaydet(e))
		await Promise.allSettled(promises)
		return true
	}
	addDatabase(name, _db) {
		name = name || SqlJS_DB.defaultName
		let {databases} = this
		let db = databases[name] ?? _db
		if (!db)
			db = databases[name] = new SqlJS_DB({ name })
		db.dbMgr = this
		return db
	}
	addDatabases(...names) { for (let name of names) { this.addDatabase(name) } return this }
	removeDatabase(name) { delete this.databases[name]; return this }
	removeDatabases(...names) { for (let name of names) { this.removeDatabase(name) } return this }
	getDatabase(name) { name = name || SqlJS_DB.defaultName; return this.databases[name] }
	setDatabase(name, db) { name = name || SqlJS_DB.defaultName; let {databases} = this; if (db == null) { delete databases[name] } else { databases[name] = db } return this }
	clearDatabases(..._names) {
		let names = _names?.length ? _names : this.dbNames;
		if (names?.length) { for (let name of names) { this.removeDatabase(name) } } return this
	}
	hasDatabases(...names) { let {databases} = this; return names.every(name => !!databases[name]) } hasDatabase(...names) { return this.hasDatabases(...names) }
	*iterKeys() { let {databases} = this; for (let name in databases) { yield names } }
	*iterValues() { let {databases} = this; for (let db of Object.values(databases)) { yield db } }
	*iterEntries() { let {databases} = this; for (let entry of Object.entries(databases)) { yield entry } }
}


/*
// TEST //
let dbMgr = new SqlJS_DBMgr(), db = dbMgr.addDatabase(); console.table(await db.execute(`CREATE TABLE test (kod TEXT NOT NULL); INSERT INTO test (kod) VALUES ('x'); SELECT * FROM test `)); await dbMgr.kaydet();

dbMgr = new SqlJS_DBMgr(); await dbMgr.yukle(), db = dbMgr.main; console.table(await db.execute(`SELECT * FROM test`))


await app.dbMgr.main.sil(); await app.dbMgr.main.close(); await app.dbMgr.main.open();
app.dbMgr.main.execute(new MQInsert({ table: 'test3', hvListe: [{ kod: 'x1' }] }));
app.dbMgr.main.execute(new MQSent({ from: 'test3', sahalar: 'kod' }));
app.dbMgr.main.execute(`drop table if exists test3`);
app.dbMgr.main.execute(`drop table if exists test3`)
*/
