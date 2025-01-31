class SablonluSatisSiparisFis extends SatisSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInst('onaytipi') }) }
	onaysiz() { this.onayTipi = 'BK'; return this } onayli() { this.onayTipi = ''; return this }
}
