class MQCariAnaBolge extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Ana Bölge' }
	static get table() { return 'caranabolge' }
	static get tableAlias() { return 'cab' }
	static get kodListeTipi() { return 'CARABOL' }
}

