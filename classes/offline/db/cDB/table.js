class CDBTable extends CDBLocalData_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tablemi() { return true } get dbName() { return this.db?.name }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, ...(this.dbName ? ['db', this.dbName] : ['tables']), this.fsFileName] }
	get lastKey() { return this._lastKey }
	constructor(e) {
		e = e ?? {}; super(e); $.extend(this, {
			db: e.db ?? e.database, data: e.data || {}, indexes: e.indexes || {}, maxRowId: e.maxRowId ?? e.rowId ?? e.rowid ?? 0 })
	}
	async yukle(e) {
		let dh = await super.yukle(e); if (!dh || dh.type == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(); let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { const {name} = fh; type2Data[name] = _data }
		}
		const {version, maxRowId} = type2Data.metadata || {}, {data, indexes} = type2Data;
		if (version !== undefined) { this.version = maxRowId } if (maxRowId !== undefined) { this.maxRowId = maxRowId }
		if (data !== undefined) { this.data = data } if (indexes !== undefined) { this.indexes = indexes }
		return true
	}
	async kaydet(e) {
		let dh = await super.kaydet(e); if (!dh || dh.type == 'file') { return false }
		const {dbName, name, version, maxRowId, data, indexes, fsRootDir} = this, type2Data = { metadata: { dbName, name, version, maxRowId }, data, indexes };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		return true
	}
	/* getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) } */
	getData(e) {
		e = e != null && typeof e == 'object' ? e : { key: e }, {key, ifAbsent, ifAbsentPut, ifPresent} = e, {data} = this;
		let value = data[key]; if (value === undefined && ifAbsentPut) {
			value = getFuncValue.call(this, ifAbsentPut, { ...e, value }); if (value !== undefined) { this.setData(key, value) } }
		if (value === undefined) { return ifAbsent ? getFuncValue.call(this, ifAbsent, { ...e, value }) : undefined }
		return ifPresent ? getFuncValue.call(this, ifPresent, { ...e, value }) : value
	}
	setData(key, value) { return this.insertOrUpdateData(key, value) }
	insertData(value) { return this.insertOrUpdateData(null, value) }
	updateData(key, value) { return this.insertOrUpdateData(e, value) }
	deleteData(key) { return this.insertOrUpdateData(key, undefined) }
	insertOrUpdateData(key, value) {
		const {data} = this; if (value === undefined) { delete data[this._lastKey = key]; return this }
		data[this._lastKey = key || this.newKey()] = value; return this
	}
	clearData(e) { $.extend(this, { maxRowId: 0, data: {}, indexes: {} }); return this }
	newKey(e) { return this.maxRowId = (this.maxRowId || 0) + 1 }
	setMaxRowId(value) { this.maxRowId = value; return this } resetMaxRowId(value) { return this.setMaxRowId(0) }
}
