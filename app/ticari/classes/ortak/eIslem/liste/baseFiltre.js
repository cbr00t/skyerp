class EIslemFiltre extends Secimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; e.eConf ?? MQEConf.instance; super(e) }
	getQueryStm(e) { return null }
	queryStmDuzenle(e) { }
	listeOlustur(e) { super.listeOlustur(e); this.secimlerOlustur_ilk(e); this.secimlerOlustur_son(e) }
	secimlerOlustur_ilk(e) { }
	secimlerOlustur_son(e) { }
	tbWhereClauseDuzenle(e) { }
}
