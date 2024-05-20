class MQYukGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'YukGrup' }
	static get table() { return 'yukgrup' }
	static get tableAlias() { return 'ygrp' }
	static get kodListeTipi() { return 'YUKGRUP' }
}