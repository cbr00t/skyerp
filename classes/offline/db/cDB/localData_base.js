class CDBLocalData_Base extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultVersion() { return 1 }
	get fsRootDirPaths() { return [app.rootName, app.appName] } get fsRootDir() { return '/' + this.fsRootDirPaths.filter(x => !!x).join('/') } get fsFileName() { return this.name || 'main' }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { fh: e.fh ?? e.fileHandle, name: e.name, version: e.version ?? this.class.defaultVersion }) }
	async yukle(e) { let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(false) } catch (ex) { } } return fh }
	async kaydet(e) { let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(true) } catch (ex) { } } return fh }
	kaydetDefer(e) { clearTimeout(this._timer_kaydetDefer); this._timer_kaydetDefer = setTimeout(e => { try { this.kaydet(e) } finally { delete this._timer_kaydetDefer } }, 500) }
	async sil(e) {
		let {fh} = this; if (!fh) { try { fh = this.fh = await this.getFSHandle(false) } catch (ex) { } } if (!fh) { return false }
		try { await (fh.type == 'file' ? fh.remove() : fh.remove({ recursive: true })); this.close(e); return true }
		catch (ex) { return false }
	}
	close(e) { fh = this.fh = null; return this }
	getFSHandle(e) { const createFlag = typeof e == 'boolean' ? e : e?.create ?? e.createFlag; return getFSDirHandle(this.fsRootDir, createFlag) }
	setName(value) { return this.name = value } setFH(value) { return this.fh = value }
}
