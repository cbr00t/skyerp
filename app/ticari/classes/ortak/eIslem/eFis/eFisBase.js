class EFisBase extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get eFis() { return this._eFis } set eFis(value) { this._eFis = value }
	get eConf() { const {eFis} = this; (eFis == this ? this : eFis)?._eConf ?? null }
	get xml() { return this.eFis?._xml } get dict() { return this._dict } /* get xroot() { return this.xml } */

	constructor(e) {
		e = e || {}; super(e);
		let {xml} = e; if (xml) { xml = xml.documentElement || xml }
		$.extend(this, { _eFis: e.eFis, _eConf: e.eConf, _xml: xml, _dict: e.dict || {} })
	}
	setValues(e) { }
	getXMLValue(e, _getter) {
		e = e || {}; const key = typeof e == 'object' ? e.key : e, {dict} = this;
		let result = dict[key]; if (result !== undefined) { return result }
		const getter = typeof e == 'object' ? e.getter : _getter, {xml} = this;
		result = xml ? getFuncValue.call(this, getter, { xml: xml }) : undefined; if (result === undefined) { return result }
		if (result != null && result.textContent) { result = result.textContent }
		dict[key] = result; return result
	}
}
