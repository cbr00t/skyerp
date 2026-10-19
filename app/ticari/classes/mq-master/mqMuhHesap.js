class MQMuhHesap extends MQKA {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'MuhHesap' }
	static get table() { return 'muhhesap' }
	static get tableAlias() { return 'mhes' }
	static get kodListeTipi() { return 'MUHHESAP' }
}
