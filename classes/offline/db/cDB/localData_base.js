class CDBLocalData_Base extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get DelimIndex() { return '\x01' } static get NullKey() { return '\x00' } static get defaultDeferSaveMS() { return 2000 }
	static get defaultVersion() { return 1 } get shadow() { return this.transaction ?? this } get hasTransaction() { return !!this.transaction }
	get fsRootDirPaths() { return [app.rootName, app.appName] } get fsRootDir() { return '/' + this.fsRootDirPaths.filter(x => !!x).join('/') } get fsFileName() { return this.name || 'main' }
	constructor(e) {
		e = e ?? {}; super(e); $.extend(this, {
			changedFlag: e.changed ?? e.changedFlag, deferSaveMS: e.deferSaveMS ?? this.class.defaultDeferSaveMS,
			fh: e.fh ?? e.fileHandle, name: e.name, version: e.version ?? this.class.defaultVersion
		})
	}
	async yukle(e) { let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(false); let result = await this.yukleDevam(e); this.notChanged(e); return result } catch (ex) { } } return fh }
	yukleDevam() { return true }
	async kaydet(e) { let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(true); let result = await this.kaydetDevam(e); this.notChanged(e); return result } catch (ex) { } } return fh }
	kaydetDevam() { return true }
	kaydetDefer(e) { clearTimeout(this._timer_kaydetDefer); this._timer_kaydetDefer = setTimeout(e => { try { this.kaydet(e) } finally { delete this._timer_kaydetDefer } }, this.deferSaveMS) }
	async sil(e) {
		clearTimeout(this._timer_kaydetDefer); let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(false) } catch (ex) { } } if (!fh) { return false }
		try { await (fh.kind == 'file' ? fh.remove() : fh.remove({ recursive: true })); this.close(e); return true }
		catch (ex) { return false }
	}
	close(e) { clearTimeout(this._timer_kaydetDefer); this.fh = null; return this }
	tranBegin(e) {
		let {transaction: trn} = this; if (!trn) {
			this._autoSaveFlag = this.autoSaveFlag; this.autoSaveFlag = false;
			trn = this.shallowCopy().close(); trn.autoSaveFlag = false; for (let key of ['data']) { let value = this[key]; if (value !== undefined) { trn[key] = new Map(value) } }
			let {indexes} = this; if (indexes) { trn.indexes = {}; for (let [key, value] of Object.entries(indexes)) { if (value != null) { trn.indexes[key] = new Map(value) } } }
			this.transaction = trn
		}
		return trn
	}
	tranEnd(e) { e = e != null && typeof e == 'object' ? e : { save: e }; let saveFlag = e.save ?? e.saveFlag; return this[saveFlag ? 'tranCommit' : 'tranEnd'](e) }
	tranCommit(e) {
		let {transaction: trn} = this; if (!trn) { return null }
		for (let key of ['data, indexes, lastRowId']) { let value = trn[key]; if (value !== undefined) { this[key] = value } }
		delete this.transaction; trn = null; this.afterTransaction(e); return trn
	}
	tranRollback(e) {
		let {transaction: trn} = this; if (!trn) { return null }
		delete this.transaction; trn = null; this.afterTransaction(e); return trn
	}
	afterTransaction(e) { let {_autoSaveFlag} = this; if (_autoSaveFlag !== undefined) { this.autoSaveFlag = _autoSaveFlag } delete this._autoSaveFlag }
	onChange(e) { this.changed(e); this.kaydetDefer(e) }
	getFSHandle(e) { let createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) }
	setName(value) { return this.name = value } setFH(value) { return this.fh = value }
	changed() { this.changedFlag = true; return this } notChanged() { this.changedFlag = false; return this }
}
