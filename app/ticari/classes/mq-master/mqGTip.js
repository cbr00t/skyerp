class MQGTip extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'GTIP' }
	static get table() { return 'stkgtip' }
	static get tableAlias() { return 'gtip' }
	static get kodListeTipi() { return 'GTIP' }
}
