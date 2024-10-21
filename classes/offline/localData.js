class MQLocalData extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return `${super.paramKod}.localData` }
	static get super_paramKod() { return super.paramKod } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'fh'] }
	get fsRootDir() { let value = this.fullTableName?.split('.')?.slice(0, -1)?.join('/'); return value ? '/' + value : value }
	get fsFileName() { let tokens = this.fullTableName?.split('.'); return tokens ? tokens[tokens.length - 1] : null }
	get data() { return this._data = this._data || {} } set data(value) { this._data = value }
	static getInstance() { return super.getInstance() }

	constructor(e) { e = e ?? {}; super(e); this.fh = e.fh ?? e.fileHandle; for (const key of ['_data']) { this[key] = this[key] || {} } }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('data') }
	yukle(e) { return super.yukle(e) } kaydet(e) { return super.kaydet(e) }
	async yukleIslemi(e) {
		const fh = await this.getFSFileHandle({ create: false }); if (!fh) { return null }
		const file = await fh.getFile(); if (!file) { return null }
		try { let data = await file.text(); if (data != null && typeof data == 'string') { data = JSON.parse(data) } return data } catch (ex) { console.error(ex); return null }
	}
	async kaydetIslemi(e) {
		let fh = await this.getFSFileHandle({ create: true }); if (!fh) { return null }
		const {rec, hv} = e; if (rec == null || (hv && $.isEmptyObject(hv.data))) {
			try { await fh.remove(); fh = this.fh = null; this.data = {} } catch (ex) { console.error(ex) }; return }
		let data = rec; if (typeof data != 'string') { data = toJSONStr(data) }
		const wr = await fh.createWritable(); try { await wr.write(data); await wr.write('\r\n') } finally { try { await wr.close() } catch (ex) { } } return true
		/*sw = await wh?.getWriter(); try { await sw.write(data); await sw.write('\r\n') } finally { try { await sw.releaseLock(); await wh.close() } catch (ex) { } }*/
	}
	sil(e) { this.clearData(e); return this.kaydet(e) }
	getData(e) {
		const key = typeof e == 'object' ? e.key : e, {data} = this;
		if (typeof e != 'object') e = {}; const {ifAbsent, ifAbsentPut, ifPresent} = e;
		let value = data[key]; if (value === undefined && ifAbsentPut) { value = getFuncValue.call(this, ifAbsentPut, { ...e, value }); if (value !== undefined) { data[key] = value } }
		if (value === undefined) { return ifAbsent ? getFuncValue.call(this, ifAbsent, { ...e, value }) : undefined }
		return ifPresent ? getFuncValue.call(this, ifPresent, { ...e, value }) : value
	}
	setData(e, _value) {
		const key = typeof e == 'object' ? e.key : e, value = typeof e == 'object' ? e.value : _value, {data} = this;
		if (value == null) { delete data[key] } else { data[key] = value }
		return this
	}
	clearData(e) { this.data = {}; return this }
	async getFS(e) { let {fs} = this; if (!fs) { fs = this.fs = (await getFS())?.fs } return fs }
	async getFSDirHandle(e, createFlag) {
		e = e ?? {}; const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; const {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSDirHandle(dir, createFlag ?? true)
   }
	async getFSFileHandle(e, createFlag) {
		e = e ?? {}; const {relPath} = e; let {fh} = this; if (fh && !relPath) { return fh }
		const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return fh = this.fh = await getFSFileHandle(fsFileName, dir, createFlag ?? true)
   }
	async getFSFile(e, createFlag) {
		e = e ?? {}; const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; const {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSFile(fsFileName, dir, createFlag ?? true)
   }
}
class MQLocalTable extends MQLocalData {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tablemi() { return true }
	get tableWithPrefix() { const {table} = this; return table ? `.db.tables.${table}` : '' } static get paramKod() { return super.super_paramKod }
	get name() { return this.table } set name(value) { this.table = value }
	constructor(e) { e = e ?? {}; super(e); if (e.name != null) { this.name = e.name } }
	setName(value) { return this.name = value }
}
class MQLocalDB extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbmi() { return true }
	static get paramKod() { return `${MQLocalData.superClass.paramKod}.db` } get paramKod() { return this.class.paramKod }
	get tableWithPrefix() { const {name} = this; return name ? `.${name}` : '' } get rootTable() { return app.rootName }
	get fullTableName() { return `${this.rootTable}.${this.paramKod || ''}${this.tableWithPrefix || ''}` }
	get tableNames() { return Object.keys(this.tables) } get tableArray() { return Object.values(tables) }
	get data() { const table2Data = {}; for (const [name, table] of this.iterEntries(e)) { table2Data[name] = table.data }; return table2Data }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { name: e.name, tables: e.tables || {} }) }
	async yukle(e) {
		const {fullTableName, tables} = this; let dh; try { dh = await getFSDirHandle(`/${fullTableName.split('.').join('/')}/tables`) } catch (ex) { }
		if (!dh) { return this } let enm = dh.values(); this.clearTables(e); while (true) {
			const {done, value: fh} = await enm.next(); if (done) { break } if (fh.kind != 'file') { continue }
			const {name} = fh; if (tables[name] == null) { this.addTable(name) }
		}
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.yukle(e)) } await Promise.all(promises); return this
	}
	async kaydet(e) { let promises = []; for (const table of this.iterValues(e)) { promises.push(table.kaydet(e)) } await Promise.all(promises); return this }
	kaydetDefer(e) { clearTimeout(this._timer_kaydetDefer); this._timer_kaydetDefer = setTimeout(e => { try { this.kaydet(e) } finally { delete this._timer_kaydetDefer } }, 500) }
	async sil(e) {
		let promises = []; for (const table of this.iterValues(e)) { promises.push(table.sil(e)) } await Promise.all(promises);
		const {fullTableName} = this; let dh; try { await getFSDirHandle(fullTableName) } catch (ex) { } if (!dh) { return this }
		await dh.remove({ recursive: true }); return this
	}
	getData(e, _key) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		return tables[name]?.getData(key)
	}
	async setData(e, _key) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		await tables[name]?.setData(key); return this
	}
	async clearData(e, _key) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		await tables[name]?.clearData(key); return this
	}
	addTable(e, _table) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, {tables} = this;
		let table = tables[name]; if (table == null) { tables[name] = table = (typeof e == 'object' ? e.table : _table) ?? new MQLocalTable({ table: name }) }
		return table
	}
	addTables(...names) { for (const name of names) { this.addTable(name) } }
	removeTable(e) { e = e ?? {}; const name = typeof e == 'object' ? e.name : e; delete this.tables[name]; return this }
	getTable(e) { e = e ?? {}; const name = typeof e == 'object' ? e.name : e; return this.tables[name] }
	setTable(e) {
		e = e ?? {}; const name = typeof e == 'object' ? e.name : e, table = typeof e == 'object' ? e.table : _table;
		if (table) { this.tables[name] = table } else { delete this.tables[name] } return this
	}
	clearTables(..._names) {
		const names = _names?.length ? _names : this.tableNames, {tables} = this; 
		if (names?.length) { for (const name of names) { this.removeTable(name) } } return this
	}
	*iterKeys() { const {tables} = this; for (const name in tables) { yield names } }
	*iterValues() { const {tables} = this; for (const table of Object.values(tables)) { yield table } }
	*iterEntries() { const {tables} = this; for (const entry of Object.entries(tables)) { yield entry } }
}

/*
let db = new MQLocalDB(); await db.yukle();
let tbl = db.addTable('a'); tbl.setData('item', { x: 1, y: 2 });
tbl = db.addTable('b'); tbl.setData('item', { x: 3, y: 4 });
await db.kaydet();

db = new MQLocalDB(); await db.yukle();
tbl = db.getTable('a'); tbl.getData('item')

l = new MQLocalTable({ table: 'b' }); l.setData('a', {x:1,y:2}); await l.kaydet(); 
l = new MQLocalTable({ table: 'b' }); try { await l.yukle().then(() => console.info(l.getData('a'))) } catch (ex) { }
let dh = l.fs; for (let name of l.fullTableName.split('.').slice(0, -1)) { if (dh) { dh = await dh.getDirectoryHandle(name) } }
let enm = await dh?.values(); if (enm) { while (true) { const {done, value} = await enm.next(); if (done) { break } console.info(value) } }
// await l.sil()
*/
