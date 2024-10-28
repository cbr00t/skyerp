class SqlJS_DBMgr extends SqlJS_DBMgrBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbMgrmi() { return this.class.dbMgrmi }
	static get kod() { return 'sqlJS' } static get aciklama() { return 'SqlJS' } static get dbMgrmi() { return true }
	static get default() { const dbMgr = new this(); dbMgr.addDatabase(); return dbMgr }
	get dbNames() { return Object.keys(this.databases) } get dbArray() { return Object.values(databases) }
	get main() { return this.getDatabase(SqlJS_DB.defaultName) } constructor(e) { e = e ?? {}; super(e); $.extend(this, { databases: e.databases ?? e.dbList ?? {} }) }
	async yukleDevam(e) {
		e = typeof e == 'object' ? e : { import: e }; const {import: importFlag} = e;
		if (!await super.yukleDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.kind == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(), {name} = fh; if (name.endsWith('.db')) { continue }
			let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { type2Data[name] = _data }
		}
		if (!importFlag) { this.clearDatabases(e) } const {databases} = this;
		const {version} = type2Data.metadata || {}; if (version !== undefined) { this.version = version }
		enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			let {name} = fh; if (name.endsWith('.db')) { name = name.slice(0, -3); if (!this.hasDatabase(name)) { this.addDatabase(name) } }
		}
		let promises = []; for (const db of this.iterValues(e)) { promises.push(db.yukle(e)) }
		await Promise.all(promises); return true
	}
	async kaydetDevam(e) {
		if (!await super.kaydetDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.kind == 'file') { return false }
		const {name, version, fsRootDir} = this, type2Data = { metadata: { name, version } };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		let promises = []; for (const db of this.iterValues(e)) { promises.push(db.kaydet(e)) }
		await Promise.all(promises); return true
	}
	addDatabase(name, _db) {
		name = name || SqlJS_DB.defaultName; const {databases} = this; let db = databases[name];
		if (db == null) { databases[name] = db = _db = _db ?? new SqlJS_DB({ name }) } return db
	}
	addDatabases(...names) { for (const name of names) { this.addDatabase(name) } return this }
	removeDatabase(name) { delete this.databases[name]; return this }
	removeDatabases(...names) { for (const name of names) { this.removeDatabase(name) } return this }
	getDatabase(name) { name = name || SqlJS_DB.defaultName; return this.databases[name] }
	setDatabase(name, db) { name = name || SqlJS_DB.defaultName; const {databases} = this; if (db == null) { delete databases[name] } else { databases[name] = db } return this }
	clearDatabases(..._names) {
		const names = _names?.length ? _names : this.dbNames;
		if (names?.length) { for (const name of names) { this.removeDatabase(name) } } return this
	}
	hasDatabases(...names) { const {databases} = this; return names.every(name => !!databases[name]) } hasDatabase(...names) { return this.hasDatabases(...names) }
	*iterKeys() { const {databases} = this; for (const name in databases) { yield names } }
	*iterValues() { const {databases} = this; for (const db of Object.values(databases)) { yield db } }
	*iterEntries() { const {databases} = this; for (const entry of Object.entries(databases)) { yield entry } }
}


/*
// TEST //
let dbMgr = new SqlJS_DBMgr(), db = dbMgr.addDatabase(); console.table(await db.execute(`CREATE TABLE test (kod TEXT NOT NULL); INSERT INTO test (kod) VALUES ('x'); SELECT * FROM test `)); await dbMgr.kaydet();

dbMgr = new SqlJS_DBMgr(); await dbMgr.yukle(), db = dbMgr.main; console.table(await db.execute(`SELECT * FROM test`))
*/
