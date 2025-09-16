class MQLocalData extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultName() { return 'localData' }
	static get super_paramKod() { return super.paramKod } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'fh'] }
	static get paramKod() { return super.paramKod } get paramKod() { return this.class.paramKod }
	get rootTable() { return app.rootName } get tableWithPrefix() { let {name} = this; return name ? `.${name}` : '' }
	get fullTableName() { return `${this.rootTable}.${this.paramKod || ''}${this.tableWithPrefix || ''}` }
	get fsRootDir() { let value = this.fullTableName?.split('.')?.slice(0, -1)?.join('/'); return value ? '/' + value : value }
	get fsFileName() { let tokens = this.fullTableName?.split('.'); return tokens ? tokens.at(-1) : null }
	get data() { return this._data = this._data || {} } set data(value) { this._data = value }
	get length() { return Object.keys(this.data ?? {}).length }

	constructor(e, __data) {
		e ??= { key: e, data: __data };
		super(e); let {class: { defaultName }} = this;
		let {name = e.table, fh = e.fileHandle, data: _data} = e;
		name ??= defaultName; _data ??= {};
		$.extend(this, { name, fh, _data })
	}
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments);
		liste.push('data')
	}
	static getInstance() { return super.getInstance() }
	yukle(e) { return super.yukle(e) } kaydet(e) { return super.kaydet(e) }
	async yukleIslemi(e) {
		let fh; try { fh = await this.getFSFileHandle({ create: false }) } catch (ex) { } if (!fh) { return null }
		let file = await fh.getFile(); if (!file) { return null }
		try {
			let data = await file.text();
			if (typeof data == 'string') { data = JSON.parse(data) }
			return data
		} catch (ex) { console.error(ex); return null }
	}
	async kaydetIslemi(e) {
		let fh = await this.getFSFileHandle({ create: true }); if (!fh) { return null }
		let {rec, hv} = e;
		if (rec == null || $.isEmptyObject(hv.data)) {
			try {
				await fh.remove(); fh = this.fh = null;
				this.clearData()
			}
			catch (ex) { console.error(ex) }
			return false
		}
		let data = typeof rec == 'string' ? rec : toJSONStr(rec);
		let wr = await fh.createWritable();
		try { await wr.write(data); await wr.write('\r\n') }
		finally { try { await wr.close() } catch (ex) { } }
		return true
		/*sw = await wh?.getWriter();
		try { await sw.write(data); await sw.write('\r\n') }
		finally { try { await sw.releaseLock(); await wh.close() } catch (ex) { } }*/
	}
	sil(e) { this.clearData(e); return this.kaydet(e) }
	get(e, _ifAbsent, _ifAbsentPut, _ifPresent) {
		let {data} = this; if (data == null) { return undefined }
		if (typeof e != 'object') { e = { key: e, ifAbsent: _ifAbsent, ifAbsentPut: _ifAbsentPut, ifPresent: _ifPresent } }
		let {key, ifAbsent, ifAbsentPut, ifPresent} = e;
		let value = data[key];
		if (value === undefined && ifAbsentPut) {
			value = ifAbsentPut.call(this, { ...e, value });
			if (value !== undefined) { data[key] = value }
		}
		if (value === undefined) { return ifAbsent?.call(this, { ...e, value }) }
		return ifPresent ? getFuncValue.call(this, ifPresent, { ...e, value }) : value
	}
	set(e, _value) {
		let {data} = this; if (data == null) { return this }
		if (typeof e != 'object') { e = { key: e, value: _value } }
		let {key, value = e.ifAbsentPut} = e;
		if (value === undefined) { delete data[key] }
		else { data[key] = value.call ? value.call(this, key) : value }
		return this
	}
	add(e, _value) { return this.set(e, value) }
	addAll(...entries) {
		let {data} = this; if (data != null) { return this }
		for (let [k, v] of entries) {
			if (v === undefined) { continue }
			data[k] = v
		}
		return this
	}
	delete(e) {
		let key = typeof e == 'object' ? e.key : e;
		let {data} = this, hasKey; if (data != null) {
			hasKey = data[key] !== undefined;
			delete data[key]
		}
		return !!hasKey
	}
	deleteAll(...keys) {
		let key = typeof e == 'object' ? e.key : e;
		let {data} = this, hasKey; if (data != null) {
			for (let key of keys) { delete data[key] }
		}
		return this
	}
	clear(e) { this.data = {}; return this }
	initProps() {
		let {data} = this; if (data == null) { return this }
		for (let key in data) {
			Object.defineProperty(this, key, {
				configurable: true,
				get() { return this.get(key) },
				set(value) { this.set(key, value) }
			})
		}
		return this
	}
	clearProps() {
		let {data} = this; if (data == null) { return this }
		for (let key in data) { delete this[key] }
		return this
	}
	*keys() { for (let key in this.data) { yield key } }
	*values() { let {data} = this; for (let key in data) { yield data[key] } }
	*entries() { let {data} = this; for (let key in data) { yield [key, data[key]] } }
	forEach(block) { for (let [k, v] of this) { block(k, v) } }
	[Symbol.iterator]() { return this.entries() }
	async getFS(e) { let {fs} = this; if (!fs) { fs = this.fs = (await getFS())?.fs } return fs }
	async getFSDirHandle(e, createFlag) {
		e ??= {}; let fs = await this.getFS(e); if (!fs) { return null }
		let {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; let {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSDirHandle(dir, createFlag ?? true)
   }
	async getFSFileHandle(e, createFlag) {
		e ??= {}; let {relPath} = e; let {fh} = this; if (fh && !relPath) { return fh }
		let fs = await this.getFS(e); if (!fs) { return null }
		let {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return fh = this.fh = await getFSFileHandle(fsFileName, dir, createFlag ?? true)
   }
	async getFSFile(e, createFlag) {
		e ??= {}; let fs = await this.getFS(e); if (!fs) { return null }
		let {fsRootDir, fsFileName} = this; if (!fsFileName) { return null }
		let dir = fsRootDir; let {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSFile(fsFileName, dir, createFlag ?? true)
   }
}
class MQLocalTable extends MQLocalData {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tablemi() { return true }
	static get paramKod() { return super.super_paramKod }
	get table() { return this.name } set table(value) { this.name = value }
	get tableWithPrefix() { let {table} = this; return table ? `.db.${table}` : '' }
	setName(value) { this.name = value; return this }
}
class MQLocalDB extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get dbmi() { return true }
	static get paramKod() { return `${MQLocalData.paramKod}.db` } get paramKod() { return this.class.paramKod }
	get rootTable() { return app.rootName } get tableWithPrefix() { let {name} = this; return name ? `.${name}` : '' }
	get fullTableName() { return `${this.rootTable}.${this.paramKod || ''}${this.tableWithPrefix || ''}` }
	get tableNames() { return Object.keys(this.tables) }
	get tableArray() { return Object.values(this.tables) }
	get data() {
		let table2Data = {};
		for (let [name, table] of this) { table2Data[name] = table.data }
		return table2Data
	}
	get length() { return Object.keys(this.tables ?? {}).length }
	constructor(e, _tables) {
		if (typeof e != 'object') { e = { name: e, tables: _tables } }
		super(e); let {name, tables = {}} = e; $.extend(this, { name, tables })
	}
	async yukle(e) {
		let {fullTableName, tables} = this, dh;
		try { dh = await getFSDirHandle(`/${fullTableName.split('.').join('/')}`) } catch (ex) { }
		if (!dh) { return this }
		let enm = dh.values(); this.clearTables(e); while (true) {
			let {done, value: fh} = await enm.next();
			if (done) { break }
			if (fh.kind != 'file') { continue }
			let {name} = fh; if (tables[name] == null) { this.addTable(name) }
		}
		let promises = [];
		for (let table of this.iterValues(e)) { promises.push(table.yukle(e)) }
		await Promise.all(promises);
		return this
	}
	async kaydet(e) {
		let promises = [];
		for (let table of this.iterValues(e)) { promises.push(table.kaydet(e)) }
		await Promise.all(promises);
		return this
	}
	kaydetDefer(e) {
		clearTimeout(this._timer_kaydetDefer);
		this._timer_kaydetDefer = setTimeout(async e => {
			try { await this.kaydet(e) }
			finally { delete this._timer_kaydetDefer }
		}, 500)
	}
	async sil(e) {
		let promises = [];
		for (let table of this.iterValues(e)) { promises.push(table.sil(e)) }
		await Promise.all(promises);
		let {fullTableName} = this, dh;
		try { dh = await getFSDirHandle(fullTableName) } catch (ex) { }
		if (dh) { await dh.remove({ recursive: true }) }
		return this
	}
	getData(e, _key) {
		e ??= {}; let name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		return tables[name]?.getData(key)
	}
	async setData(e, _key) {
		e ??= {}; let name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		await tables[name]?.setData(key); return this
	}
	async clearData(e, _key) {
		e ??= {}; let name = typeof e == 'object' ? e.name : e, key = typeof e == 'object' ? e.key : _key, {tables} = this;
		await tables[name]?.clearData(key); return this
	}
	get(e) { e ??= {}; let name = typeof e == 'object' ? e.name : e; return this.tables[name] }
	set(e) {
		e ??= {}; let name = typeof e == 'object' ? e.name : e, table = typeof e == 'object' ? e.table : _table;
		let {tables} = this;
		if (table) { tables[name] = table }
		else { delete tables[name] }
		return this
	}
	add(e, _table) {
		e ??= {}; let name = typeof e == 'object' ? e.name : e, {tables} = this;
		let table = tables[name]; if (table == null) {
			tables[name] = table =
				(typeof e == 'object' ? e.table : _table) ?? new MQLocalTable(name)
		}
		return table
	}
	addAll(...names) { for (let name of names) { this.addTable(name) }; return this }
	delete(e) { e ??= {}; let name = typeof e == 'object' ? e.name : e; delete this.tables[name]; return this }
	deleteAll(..._names) {
		let names = _names?.length ? _names : this.tableNames, {tables} = this; 
		if (names?.length) { for (let name of names) { this.removeTable(name) } }
		return this
	}
	clear() { return this.delete() }
	*keys() { for (let key in this.tables) { yield key } }
	*values() { for (let value of Object.values(this.tables)) { yield value } }
	*entries() { for (let entry of Object.entries(this.tables)) { yield entry } }
	forEach(block) { for (let [k, v] of this) { block(k, v) } }
	[Symbol.iterator]() { return this.entries() }
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
let enm = await dh?.values(); if (enm) { while (true) { let {done, value} = await enm.next(); if (done) { break } console.info(value) } }
// await l.sil()
*/
