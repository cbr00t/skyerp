class MQStokMensei extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'StokMensei' }
	static get table() { return 'stkmensei' }
	static get tableAlias() { return 'men' }
	static get kodListeTipi() { return 'STOKMENSEI' }
}