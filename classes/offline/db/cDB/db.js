class CDB extends CDBLocalData_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbmi() { return true }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, 'db', this.fsFileName] }
	get tableNames() { return Object.keys(this.tables) } get tableArray() { return Object.values(tables) }
	get data() { const table2Data = {}; for (const [name, table] of this.iterEntries(e)) { table2Data[name] = table.data }; return table2Data }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { tables: e.tables ?? {} }) }
	async yukle(e) {
		e = typeof e == 'object' ? e : { import: e }; const {import: importFlag} = e;
		let dh = await super.yukle(e); if (!dh || dh.type == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(); let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { const {name} = fh; type2Data[name] = _data }
		}
		const {version} = type2Data.metadata || {}; if (version !== undefined) { this.version = version }
		enm = dh.values(); if (!importFlag) { this.clearTables(e) } const {tables} = this;
		while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind == 'file') { continue }
			const {name} = fh; if (!this.hasTable(name)) { this.addTable(name) }
		}
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.yukle(e)) }
		await Promise.all(promises); return true
	}
	async kaydet(e) {
		let dh = await super.kaydet(e); if (!dh || dh.type == 'file') { return false }
		const {name, version, fsRootDir} = this, type2Data = { metadata: { name, version } };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.kaydet(e)) }
		await Promise.all(promises); return true
	}
	/*getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) }*/
	getData(e, _key) {
		e = e ?? {}; const tableName = typeof e == 'object' ? e?.tableName ?? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		return tables[tableName]?.getData(key)
	}
	async setData(tableName, key) { await this.tables[tableName]?.setData(key); return this }
	async clearData(tableName, key) { await this.tables[name]?.clearData(key); return this }
	addTable(name, _table) {
		const {tables} = this; let table = tables[name];
		if (table == null) { table = _table = _table ?? new CDBTable({ name }) }
		table.db = this; tables[name] = table; return table
	}
	addTables(...names) { for (const name of names) { this.addTable(name) } return this }
	removeTable(name) { delete this.tables[name]; return this }
	removeTables(...names) { for (const name of names) { this.removeTable(name) } return this }
	getTable(e) { return this.tables[name] }
	setTable(name, table) { if (table == null) { delete this.tables[name] } else { table.db = this; this.tables[name] = table } return this }
	clearTables(..._names) {
		const names = _names?.length ? _names : this.tableNames, {tables} = this; 
		if (names?.length) { for (const name of names) { this.removeTable(name) } } return this
	}
	hasTables(...names) { const {tables} = this; return names.every(name => !!tables[name]) } hasTable(...names) { return this.hasTables(...names) }
	*iterKeys() { const {tables} = this; for (const name in tables) { yield names } }
	*iterValues() { const {tables} = this; for (const table of Object.values(tables)) { yield table } }
	*iterEntries() { const {tables} = this; for (const entry of Object.entries(tables)) { yield entry } }
}
