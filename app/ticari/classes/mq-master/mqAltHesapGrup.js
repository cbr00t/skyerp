class MQAltHesapGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Alt Hesap Grup' }
	static get table() { return 'ahgrup' }
	static get tableAlias() { return 'ahgrp' }
	static get kodListeTipi() { return 'AHGRP' }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e)
		// const {pTanim} = e
	}
}
