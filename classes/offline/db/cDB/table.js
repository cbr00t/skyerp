class CDBTable extends CDBLocalData_Base {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get tablemi() { return true } get dbName() { return this.db?.name } get lastKey() { return this._lastKey } get size() { return this.data?.size ?? this.data?.length }
	get fsRootDirPaths() { return [...super.fsRootDirPaths, ...(this.dbName ? ['db', this.dbName] : ['tables']), this.fsFileName] }
	constructor(e) {
		e = e ?? {}; super(e); let data = asMap(e.data || {}), indexes = e.indexes || { primary: new Map(), secondary: new Map() };
		for (const key of ['primary', 'secondary']) { indexes[key] = asMap(indexes[key]) }
		const db = e.db ?? e.database, primaryKeys = e.primaryKeys ?? [], indexKeys = e.indexKeys ?? [];
		$.extend(this, { db, data, indexes, primaryKeys, indexKeys, maxRowId: e.maxRowId ?? e.rowId ?? e.rowid ?? 0 })
		/* (secondary) indexKeys: { grupKod: new Map(), xyz: new Map() } .. gibi attrGrupKeys2Map şeklinde olmalı */
	}
	async yukleDevam(e) {
		e = typeof e == 'object' ? e : { import: e }; const {import: importFlag} = e;
		if (!await super.yukleDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.type == 'file') { return false }
		const type2Data = {}; let enm = dh.values(); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const file = await fh.getFile(); let _data = await file.text(); _data = _data ? JSON.parse(_data) : undefined;
			if (_data) { const {name} = fh; type2Data[name] = _data }
		}
		const {version, maxRowId, primaryKeys, indexKeys} = type2Data.metadata || {}, {data, 'primary.idx': idxPrimary, 'secondary.idx': idxSecondary} = type2Data;
		const {shadow} = this; if (!importFlag) { this.clearData(e) } const {indexes} = shadow;
		if (version != null) { shadow.version = maxRowId } if (maxRowId != null) { shadow.maxRowId = maxRowId }
		if (primaryKeys != null) { shadow.primaryKeys = primaryKeys } if (indexKeys != null) { shadow.indexKeys = indexKeys }
		if (data != null) { shadow.data = asMap(data) } if (idxPrimary != null) { indexes.primary = asMap(idxPrimary) } if (idxSecondary != null) { indexes.secondary = asMap(idxSecondary) }
		return true
	}
	async kaydetDevam(e) {
		if (!await super.kaydetDevam(e)) { return false } const {fh: dh} = this; if (!dh || dh.type == 'file') { return false }
		const {shadow} = this, {dbName, name, version, maxRowId, data, indexes, fsRootDir} = shadow;
		const type2Data = { metadata: { dbName, name, version, maxRowId }, data, 'primary.idx': indexes.primary, 'secondary.idx': indexes.secondary };
		const create = true; for (const [name, value] of Object.entries(type2Data)) {
			let fileContent = typeof value == 'object'? toJSONStr(value) : value; if (fileContent === undefined) { continue }
			const fh = await dh.getFileHandle(name, { create }); if (!fh) { return false }
			fileContent += CrLf; const wr = await fh.createWritable(); try { await wr.write(fileContent) } finally { try { wr.close() } catch (ex) { } }
		}
		return true
	}
	/* getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) } */
	getData(e) {
		e = e != null && typeof e == 'object' ? e : { key: e }; const {ifAbsent, ifAbsentPut, ifPresent} = e, key = e.key?.toString(), {data} = this.shadow;
		let value = data.get(key); if (value === undefined && ifAbsentPut) {
			value = getFuncValue.call(this, ifAbsentPut, { ...e, value }); if (value !== undefined) { this.setData(key, value) } }
		if (value === undefined) { return ifAbsent ? getFuncValue.call(this, ifAbsent, { ...e, value }) : undefined }
		return ifPresent ? getFuncValue.call(this, ifPresent, { ...e, value }) : value
	}
	setData(key, value) { return this.insertOrUpdateData(key, value) }
	insertData(value) { return this.insertOrUpdateData(null, value) } updateData(key, value) { return this.insertOrUpdateData(key, value) } deleteData(key) { return this.insertOrUpdateData(key, undefined) }
	insertOrUpdateData(key, value) {
		const {shadow} = this, {data} = shadow, deleteFlag = value === undefined;
		if (!(deleteFlag || key)) { key = key || this.newKey().toString() } shadow._lastKey = key
		if (!this.updateIndexes(deleteFlag, key, value)) { return this }
		if (deleteFlag) { data.delete(shadow._lastKey = key) } else { data.set((key = shadow._lastKey = key || this.newKey()).toString(), value) }
		this.onChange({ type: deleteFlag ? 'deleteData' : 'insertOrUpdateData', key, value }); return this
	}
	clearData(e) { $.extend(this.shadow, { maxRowId: 0, data: new Map(), indexes: { primary: new Map(), secondary: new Map() } }); this.onChange({ type: 'clearData', e }); return this }
	from(e) { return new CDB_QueryProcessor_From({ table: this }) }
	updateIndexes(deleteFlag, key, rec) {
		if (rec == null) { return false }
		const {shadow} = this, {indexes, primaryKeys, indexKeys} = shadow; let action;
		if (deleteFlag) {
			action = (recKeys, idxMap) => {
				if (!recKeys?.length || idxMap == null) { return true } const idxKey = shadow.getIndexKey(rec, recKeys);
				const idSet = idxMap.get(idxKey) || {}; if (!idSet[key]) { return false }
				delete idSet[key]; if (Object.keys(idSet).length) { idxMap.set(idxKey, idSet) } else { idxMap.delete(idxKey) } return true
			}
		}
		else {
			action = (recKeys, idxMap) => {
				if (!recKeys?.length || idxMap == null) { return true } const idxKey = shadow.getIndexKey(rec, recKeys);
				const idSet = idxMap.get(idxKey) || {}; if (idSet[key]) { return false }
				idSet[key] = true; idxMap.set(idxKey, idSet); return true
			};
		}
		return action(primaryKeys, indexes.primary) && action(indexKeys, indexes.secondary)
	}
	newKey(e) { const {shadow} = this; return shadow.maxRowId = (shadow.maxRowId || 0) + 1 }
	getIndexKey(rec, ...keys) { const {DelimIndex, NullKey} = this.shadow.class; return keys.flat().map(key => (rec[key] ?? NullKey).toString()).join(DelimIndex) }
	setMaxRowId(value) { this.shadow.maxRowId = value; return this } resetMaxRowId(value) { return this.setMaxRowId(0) }
	setPrimaryKeys(...value) { this.shadow.primaryKeys = value.flat(); return this } setIndexKeys(...value) { this.shadow.indexKeys = value.flat(); return this }
}
