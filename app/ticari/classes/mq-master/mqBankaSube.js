class MQBankaSube extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Banka Şube' }
	static get table() { return 'bansube' }
	static get tableAlias() { return 'bsub' }
	static get kodListeTipi() { return 'BANSUBE' }
	static get kodSaha() {return 'subekod' }
	static get adiSaha() {return 'subeadi' }
}