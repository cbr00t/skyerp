class MQStokDepartman extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Departman' }
	static get table() { return 'maldepartman' }
	static get tableAlias() { return 'dep' }
	static get kodListeTipi() { return 'DEP' }
}
