class RowluYapi extends CProxyHandler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get rec() { return this._rec } set rec(value) { this._rec = value }
	
	constructor(e) {
		e = e || {}; super(e);
		const rec = this._rec = e.rec || e || {}; return new Proxy(rec, this)
	}
	set(target, prop, value, $this) { (Reflect.has(target, prop) ? target : this)[prop] = value; return true }
}
