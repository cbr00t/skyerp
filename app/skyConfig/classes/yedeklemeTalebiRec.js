class YedeklemeTalebiRec extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get zamanSayi() { return 4 }
	get onaylimi() { return !this.durum }
	get yenimi() { return this.durum == 'yeni' }
	get silindimi() { return this.durum == 'silindi' }
	
	constructor(e = {}) {
		super(e)
		let {zamanSayi} = this.class
		; ['durum', 'server', 'db'].forEach(k =>
			this[k] = e[k])
		for (let key of this.class.getZamanlarKeys())
			this[key] = asDate(e[key]) || null
		if (this.durum == null)
			this.yeni()
	}
	reset(e) {
		this.durum = 'yeni'
		this.server = this.db = null
		let {getZamanlarKeys: _keys} = this.class
		deleteKeys(this, _keys)
	}
	onayli() { this.durum = ''; return this }
	yeni() { this.durum = 'yeni'; return this }
	silindi() { this.durum = 'silindi'; return this }
	asObject(e) {
		let result = fromEntries(
			['durum', 'server', 'db']
				.map(k => [k, this[k]])
				.filter(([k, v]) => v)
		)
		for (let key of this.class.getZamanlarKeys()) {
			let value = this[key]
			if (value)
				value = timeToString(asDate(value), true)
			if (value != null)
				result[key] = value
		}
		return result
	}
	static *getZamanlarKeys() {
		for (let i = 1; i <= this.zamanSayi; i++)
			yield `zaman${i}`
	}
}
