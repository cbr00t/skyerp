class MQBanka extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Banka' }
	static get table() { return 'banmst' }
	static get tableAlias() { return 'ban' }
	static get kodListeTipi() { return 'BANKA' }
}