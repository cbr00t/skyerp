class MQStokAnaGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' }
	static get tableAlias() { return 'agrp' }
	static get kodListeTipi() { return 'AGRP' }
}
