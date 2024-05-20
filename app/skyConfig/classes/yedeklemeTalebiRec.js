class YedeklemeTalebiRec extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get zamanSayi() { return 4 }
	get onaylimi() { return !this.durum }
	get yenimi() { return this.durum == 'yeni' }
	get silindimi() { return this.durum == 'silindi' }
	
	constructor(e) {
		e = e || {};
		super(e);
		const {zamanSayi} = this.class;
		$.extend(this, { durum: e.durum, server: e.server, db: e.db });
		for (const key of this.class.getZamanlarKeys())
			this[key] = asDate(e[key]) || null
		if (this.durum == null)
			this.yeni()
	}
	static *getZamanlarKeys() {
		for (let i = 1; i <= this.zamanSayi; i++)
			yield `zaman${i}`
	}
	asObject(e) {
		const result = {};
		for (const key of ['durum', 'server', 'db']) {
			const value = this[key];
			if (value != null)
				result[key] = value
		}
		for (const key of this.class.getZamanlarKeys()) {
			let value = this[key];
			if (value)
				value = timeToString(asDate(value), true);
			if (value != null)
				result[key] = value
		}
		return result
	}

	reset(e) {
		this.durum = 'yeni';
		this.server = this.db = null;
		for (const key of this.class.getZamanlarKeys())
			this[key] = null
	}
	onayli() {
		this.durum = '';
		return this
	}
	yeni() {
		this.durum = 'yeni';
		return this
	}
	silindi() {
		this.durum = 'silindi';
		return this
	}
}
