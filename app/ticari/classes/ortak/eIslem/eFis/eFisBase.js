class EFisBase extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() {
		return [
			...super.deepCopyAlinmayacaklar,
			'_xml', '_dict'
		]
	}
	get eFis() { return this._eFis }
	set eFis(v) { this._eFis = v }
	get eConf() {
		let { _eConf: res } = this
		if (res == null)
			res = this._eConf = this.eFis?.eConf ?? MQEConf.instance
		return res
	}
	set eConf(v) { this._eConf = v }
	get xml() {
		let { _xml: res } = this
		if (res == null)
			res = this._xml = this.eFis?.xml
		return res
	}
	set xml(v) { this._xml = v }
	get dict() { return this._dict }    // xml cache
	set dict(v) { this._dict = v }

	constructor(e = {}) {
		super(e)
		let { eFis: _eFis, eConf: _eConf, xml: _xml = e._xml, dict: _dict = e._dict = {} } = e
		_xml = _xml?.documentElement ?? _xml
		extend(this, { _eFis, _eConf, _xml, _dict })
	}
	setValues(e) { }
	getXMLValue(e = {}, _getter) {
		let isObj = isObject(e)
		let k = isObj ? e.key : e
		let { dict, xml } = this
		let res = dict[k]
		if (res !== undefined) 
			return res
		
		let getter = isObj ? e.getter : _getter
		res = xml 
			? getFuncValue.call(this, getter, { xml })
			: undefined
		if (res === undefined)
			return res

		res = res?.textContent ?? res
		dict[k] = res
		
		return res
	}
	shallowCopy(e) {
		let res = super.shallowCopy(e)
		let { _xml } = this
		extend(res, { _xml })
		return res
	}
	deepCopy(e) {
		let res = super.deepCopy(e)
		let { _xml } = this
		_xml = _xml?.cloneNode?.(true) ?? _xml
		extend(res, { _xml })
		return res
	}
}
