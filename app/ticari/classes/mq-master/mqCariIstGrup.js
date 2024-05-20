class MQCariIstGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Cari İst. Grup' }
	static get table() { return 'caristgrup' }
	static get tableAlias() { return 'ist' }
	static get kodListeTipi() { return 'CARISTGRP' }
}
