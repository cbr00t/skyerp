class CDB extends CDBLocalData_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbmi() { return true }
	get dbMgrClass() { return this.class } static get dbMgrClass() { return CDBMgr }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, 'db', this.dbMgrClass.kod, this.fsFileName] }
	get tableNames() { return Object.keys(this.shadow.tables) } get tableArray() { return Object.values(this.shadow.tables) }
	get data() { const table2Data = {}; for (const [name, table] of this.iterEntries(e)) { table2Data[name] = table.data }; return table2Data }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { autoSaveFlag: e.autoSave ?? e.autoSaveFlag ?? true, tables: e.tables ?? {} }) }
	async yukleDevam(e) {
		e = typeof e == 'object' ? e : { import: e }; const {import: importFlag} = e;
		if (!await super.yukleDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.kind == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(); let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { const {name} = fh; type2Data[name] = _data }
		}
		if (!importFlag) { this.clearTables(e) } const {shadow} = this, {tables} = shadow;
		const {version} = type2Data.metadata || {}; if (version !== undefined) { shadow.version = version }
		enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind == 'file') { continue }
			const {name} = fh; if (!this.hasTable(name)) { this.addTable(name) }
		}
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.yukle(e)) }
		await Promise.all(promises); return true
	}
	async kaydetDevam(e) {
		if (!await super.kaydetDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.kind == 'file') { return false }
		const {shadow} = this, {name, version, fsRootDir} = shadow, type2Data = { metadata: { name, version } };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.kaydet(e)) }
		await Promise.all(promises); return true
	}
	execute(e) {
		const query = e?.query ?? e, db = this; e = { query, ctx: new CDB_QueryContext({ db }) };
		return query.cDB_execute(e)
	}
	/*getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) }*/
	getData(e, _key) {
		e = e ?? {}; const tableName = typeof e == 'object' ? e?.tableName ?? e.table ?? e.name : e, key = typeof e == 'object' ? e.key : _key;
		const {tables} = this.shadow; return tables[tableName]?.getData(key)
	}
	async setData(tableName, key) { await this.shadow.tables[tableName]?.setData(key); return this }
	async clearData(tableName, key) { await this.shadow.tables[name]?.clearData(key); return this }
	addTable(name, _table) {
		const {tables} = this.shadow; let table = tables[name];
		if (table == null) { table = _table = _table ?? new CDBTable({ name }) }
		table.db = this; tables[name] = table; return table
	}
	addTables(...names) { for (const name of names) { this.addTable(name) } return this }
	removeTable(name) { delete this.shadow.tables[name]; return this }
	removeTables(...names) { for (const name of names) { this.removeTable(name) } return this }
	getTable(name) { return this.shadow.tables[name] }
	setTable(name, table) { const {tables} = this.shadow; if (table == null) { delete tables[name] } else { table.db = this; tables[name] = table } return this }
	clearTables(..._names) {
		const names = _names?.length ? _names : this.tableNames;
		if (names?.length) { for (const name of names) { this.removeTable(name) } } return this
	}
	hasTables(...names) { const {tables} = this.shadow; return names.every(name => !!tables[name]) } hasTable(...names) { return this.hasTables(...names) }
	*iterKeys() { const {tables} = this.shadow; for (const name in tables) { yield names } }
	*iterValues() { const {tables} = this.shadow; for (const table of Object.values(tables)) { yield table } }
	*iterEntries() { const {tables} = this.shadow; for (const entry of Object.entries(tables)) { yield entry } }
	forEach() { return this.iterEntries() }
	autoSave() { this.autoSaveFlag = true; return this } noAutoSave() { this.autoSaveFlag = false; return this }
}
