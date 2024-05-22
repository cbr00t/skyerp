class MQLocalData extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return `${super.paramKod}.localData` }
	static get fsRootDir() { let value = this.fullTableName?.split('.')?.slice(0, -1)?.join('/'); return value ? '/' + value : value }
	static get fsFileName() { let tokens = this.fullTableName?.split('.'); return tokens ? tokens[tokens.length - 1] : null }
	get data() { return this._data = this._data || {} } set data(value) { this._data = value }

	constructor(e) { e = e || {}; super(e); this.fh = e.fh ?? e.fileHandle; for (const key of ['_data']) { this[key] = this[key] || {} } }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('data') }
	async yukleIslemi(e) {
		const fh = await this.getFSFileHandle({ create: false }); if (!fh) { return null }
		const file = await fh.getFile(); if (!file) { return null }
		try { let data = await file.text(); if (data != null && typeof data == 'string') { data = JSON.parse(data) } return data } catch (ex) { console.error(ex); return null }
	}
	async kaydetIslemi(e) {
		const fh = await this.getFSFileHandle({ create: true }); if (!fh) { return null }
		const {rec} = e; if (rec == null) { try { await fh.delete(); fh = this.fh = null } catch (ex) { console.error(ex) }; return }
		let data = rec; if (typeof data != 'string') { data = toJSONStr(data) }
		const wh = await fh.createWritable(), sw = await wh?.getWriter();
		try { await sw.write(data); await sw.write('\r\n') }
		finally { try { await sw.releaseLock(); await wh.close() } catch (ex) { } }
	}
	getData(e) {
		const key = typeof e == 'object' ? e.key : e, {data} = this;
		if (typeof e != 'object') e = {}; const {ifAbsent, ifAbsentPut, ifPresent} = e;
		let value = data[key];
		if (value === undefined && ifAbsentPut) {
			value = getFuncValue.call(this, ifAbsentPut, $.extend({}, e, { value: value }));
			if (value !== undefined) { data[key] = value }
		}
		if (value === undefined) { return ifAbsent ? getFuncValue.call(this, ifAbsent, $.extend({}, e, { value: value })) : undefined }
		return ifPresent ? getFuncValue.call(this, ifPresent, $.extend({}, e, { value: value })) : value
	}
	setData(e, _value) {
		const key = typeof e == 'object' ? e.key : e, value = typeof e == 'object' ? e.value : _value, {data} = this;
		if (value == null) { delete data[key] } else { data[key] = value }
		return this
	}
	clearData(e) { this.data = null; return this }
	async getFS(e) { let {fs} = this; if (!fs) { fs = this.fs = (await getFS())?.fs } return fs }
	async getFSDirHandle(e, createFlag) {
		e = e || {}; const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this.class; if (!fsFileName) { return null }
		let dir = fsRootDir; const {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSDirHandle(dir, createFlag ?? true)
   }
	async getFSFileHandle(e, createFlag) {
		e = e || {}; const {relPath} = e; let {fh} = this; if (fh && !relPath) { return fh }
		const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this.class; if (!fsFileName) { return null }
		let dir = fsRootDir; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return fh = this.fh = await getFSFileHandle(fsFileName, dir, createFlag ?? true)
   }
	async getFSFile(e, createFlag) {
		e = e || {}; const fs = await this.getFS(e); if (!fs) { return null }
		const {fsRootDir, fsFileName} = this.class; if (!fsFileName) { return null }
		let dir = fsRootDir; const {relPath} = e; if (relPath) { dir = `${fsRootDir.trimEnd('/')}/${relPath.trim('/')}` }
		if (createFlag == null) { createFlag = e.create ?? e.createFlag }
		return await getFSFile(fsFileName, dir, createFlag ?? true)
   }
}
