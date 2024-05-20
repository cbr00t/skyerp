class MQCariIl extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' }
	static get tableAlias() { return 'il' }
	static get kodListeTipi() { return 'IL' }
}
