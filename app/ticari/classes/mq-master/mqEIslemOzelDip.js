class MQEIslemOzelDip extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'e-İşlem Özel Dip' }
	static get table() { return 'eislemozeldip' }
	static get tableAlias() { return 'odip' }
	static get kodListeTipi() { return 'EISLOZELDIP' }
}