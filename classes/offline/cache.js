class LocalCache extends MQLocalTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultName() { return 'local-cache' }

	get recording() { return this._recording }
	set recording(value) { this._recording = value }
	constructor(e) {
		super(...arguments); if (typeof e != 'object') { e = {} }
		let {recording = false} = e;
		$.extend(this, { recording })
	}
	get(e, _ifAbsent, _ifAbsentPut, _ifPresent) {
		let {data} = this; if (data == null) { return undefined }
		if (e?.key == null) { e = { key: e, ifAbsent: _ifAbsent, ifAbsentPut: _ifAbsentPut, ifPresent: _ifPresent } }
		let {key, ifAbsent, ifAbsentPut, ifPresent} = e;
		let newKey = this.fixKey(key);
		if (newKey != key) { e.key = newKey }
		return super.get(e)
	}
	set(e, _value) {
		let {data} = this; if (data == null) { return this }
		if (e?.key == null) { e = { key: e, value: _value } }
		let {key, value = e.ifAbsentPut} = e;
		if (value === undefined || ($.isArray(value) && !value.length)) { return this }
		let newKey = this.fixKey(key);
		if (newKey != key) { e.key = newKey }
		return super.set(e, _value)
	}
	delete(e) {
		let {data} = this; if (data == null) { return false }
		if (e?.key == null) { e = { key: e } }
		let {key} = e, newKey = this.fixKey(key)
		if (newKey != key) { e.key = newKey }
		return super.delete(e)
	}
	deleteAll(...keys) {
		for (let key of keys) { this.delete(key) }
		return this
	}
	onExec(e) {
		if (!this.recording) { return false }
		return true
	}
	record() { this.recording = true; return this } stop() { this.recording = false; return this }
	fixKey(key) {
		if (typeof key == 'object') {
			try { key = toJSONStr(key) }
			catch (ex) { debugger; throw ex }
		}
		if (key) {
			key = key.replaceAll('\\r', '').replaceAll('\\n', ' ').replaceAll('\\t', ' ')
					   .replaceAll('\r', '').replaceAll('\n', ' ').replaceAll('\t', ' ').trim()
			if (this.isFragmanted) { key = /*async*/ hash(key) }
		}
		return key
	}
}
class QueryCache extends LocalCache {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultName() { return 'query-cache' }
	async onExec({ execTip, queryYapi, result }) {
		if (await super.onExec(...arguments) === false) { return false }
		// if (!(execTip == 'dt' || execTip == 'sp')) { return }
		await this.set(queryYapi, result)
		this.kaydetDefer()
		return true
	}
	fixKey(key) {
		if (typeof key == 'object') { key = toJSONStr(key.getQueryYapi?.() ?? key) }
		return super.fixKey(key)
	}
}
class ReqCache extends LocalCache {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultName() { return 'req-cache' }
	async onExec({ result }) {
		if (await super.onExec(...arguments) === false)
			return false 
		let key = arguments[0]
		await this.set(key, result)
		this.kaydetDefer()
		return true
	}
	fixKey(key) {
		if (typeof key == 'object') {
			let {url, data} = key;
			if (url) {
				try {
					url = new URL(url)
					let {pathname: path, search} = url
					let _qs = readQSDict(search)
					for (let key of ['appID', 'sql', '_', '#nbb']) { delete _qs[key] }
					search = $.param(_qs)
					url = key.url = path + search
				}
				catch (ex) { console.error(ex) }
			}
			key = toJSONStr({ url, data })
		}
		return super.fixKey(key)
	}
}
