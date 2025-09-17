class QueryCache extends MQLocalTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultName() { return 'query-cache' }
	get recording() { return this._recording } set recording(value) { this._recording = value }
	constructor(e) {
		super(...arguments); if (typeof e != 'object') { e = {} }
		let {recording = false} = e;
		$.extend(this, { recording })
	}
	async get(e, _ifAbsent, _ifAbsentPut, _ifPresent) {
		let {data} = this; if (data == null) { return undefined }
		if (e?.key == null) { e = { key: e, ifAbsent: _ifAbsent, ifAbsentPut: _ifAbsentPut, ifPresent: _ifPresent } }
		let {key, ifAbsent, ifAbsentPut, ifPresent} = e;
		let newKey = await this.fixKey(key);
		if (newKey != key) { e.key = newKey }
		return await super.get(e)
	}
	async set(e, _value) {
		let {data} = this; if (data == null) { return this }
		if (e?.key == null) { e = { key: e, value: _value } }
		let {key, value = e.ifAbsentPut} = e;
		if (value === undefined || ($.isArray(value) && !value.length)) { return this }
		let newKey = await this.fixKey(key);
		if (newKey != key) { e.key = newKey }
		return await super.set(e, _value)
	}
	async delete(e) {
		let {data} = this; if (data == null) { return false }
		if (e?.key == null) { e = { key: e } }
		let newKey = await this.fixKey(key);
		if (newKey != key) { e.key = newKey }
		return await super.delete(e)
	}
	deleteAll(...keys) {
		for (let key of keys) { this.delete(key) }
		return this
	}
	async onQueryExec({ execTip, queryYapi, result }) {
		if (!this.recording) { return }
		// if (!(execTip == 'dt' || execTip == 'sp')) { return }
		await this.set(queryYapi, result)
		this.kaydetDefer()
	}
	record() { this.recording = true; return this } stop() { this.recording = false; return this }
	async fixKey(key) {
		if (typeof key == 'object') { key = toJSONStr(key.getQueryYapi?.() ?? key) }
		if (key) {
			key = await hash(
				key.replaceAll('\\r', '').replaceAll('\\n', ' ').replaceAll('\\t', ' ')
				   .replaceAll('\r', '').replaceAll('\n', ' ').replaceAll('\t', ' ').trim()
			)
		}
		return key
	}
}
