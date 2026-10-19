class MQBanka extends MQKA {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'BANKA' }
	static get sinifAdi() { return 'Banka' } static get table() { return 'banmst' } static get tableAlias() { return 'ban' }
}