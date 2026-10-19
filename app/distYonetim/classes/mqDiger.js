class MQCariTip extends MQKA {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Tip' } static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
}
