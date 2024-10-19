class CDBMgr extends CDBLocalData_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbMgrmi() { return true }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, 'db'] }
	get dbNames() { return Object.keys(this.databases) } get dbArray() { return Object.values(databases) }
	get db2Table() { const db2Table = {}; for (const [name, db] of this.iterEntries(e)) { db2Table[name] = db.tables }; return db2Table }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { databases: e.databases ?? e.dbList ?? {} }) }
	async yukleDevam(e) {
		e = typeof e == 'object' ? e : { import: e }; const {import: importFlag} = e;
		if (!await super.yukleDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.type == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(); let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { const {name} = fh; type2Data[name] = _data }
		}
		if (!importFlag) { this.clearDatabases(e) } const {shadow} = this, {databases} = shadow;
		const {version} = type2Data.metadata || {}; if (version !== undefined) { this.version = version }
		enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind == 'file') { continue }
			const {name} = fh; if (!this.hasDatabase(name)) { this.addDatabase(name) }
		}
		let promises = []; for (const db of this.iterValues(e)) { promises.push(db.yukle(e)) }
		await Promise.all(promises); return true
	}
	async kaydetDevam(e) {
		if (!await super.kaydetDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.type == 'file') { return false }
		const {shadow} = this, {name, version, fsRootDir} = shadow, type2Data = { metadata: { name, version } };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		let promises = []; for (const db of this.iterValues(e)) { promises.push(db.kaydet(e)) }
		await Promise.all(promises); return true
	}
	/*getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) }*/
	async clearData(e, _key) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {databases} = this.shadow;
		await databases[name]?.clearData(key); return this
	}
	addDatabase(name, _db) {
		const {databases} = this.shadow; let db = databases[name];
		if (db == null) { databases[name] = db = _db = _db ?? new CDB({ name }) } return db
	}
	addDatabases(...names) { for (const name of names) { this.addDatabase(name) } return this }
	removeDatabase(name) { delete this.shadow.databases[name]; return this }
	removeDatabases(...names) { for (const name of names) { this.removeDatabase(name) } return this }
	getDatabase(name) { return this.shadow.databases[name] }
	setDatabase(name, db) { const {databases} = this.shadow; if (db == null) { delete databases[name] } else { databases[name] = db } return this }
	clearDatabases(..._names) {
		const names = _names?.length ? _names : this.dbNames;
		if (names?.length) { for (const name of names) { this.removeDatabase(name) } } return this
	}
	hasDatabases(...names) { const {databases} = this.shadow; return names.every(name => !!databases[name]) } hasDatabase(...names) { return this.hasDatabases(...names) }
	*iterKeys() { const {databases} = this.shadow; for (const name in databases) { yield names } }
	*iterValues() { const {databases} = this.shadow; for (const db of Object.values(databases)) { yield db } }
	*iterEntries() { const {databases} = this.shadow; for (const entry of Object.entries(databases)) { yield entry } }
}

/*
let dbMgr = new CDBMgr(); await dbMgr.sil(); await dbMgr.yukle();
let db = dbMgr.addDatabase('main'), table = db.addTable('main');
table.insertData({ kod: 'x', aciklama: 'yz' }).insertData({ kod: 'x', aciklama: 'yz' });
await dbMgr.kaydet();
dbMgr = new CDBMgr(); await dbMgr.yukle();
dbMgr.databases.main.tables.main.data
*/
