class SablonluSatisSiparisOrtakFisTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { let {pTanim} = e; $.extend(pTanim, { sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInst('onaytipi') }) }
}
class SablonluSatisSiparisOrtayDetayTemplate extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { /*let {pTanim} = e; $.extend(pTanim, { stokText: new PInstStr() })*/ }
}

class SablonluSatisSiparisFis extends SatisSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return SablonluSatisSiparisDetay }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); SablonluSatisSiparisOrtakFisTemplate.pTanimDuzenle(e) }
	static detaySiniflarDuzenle(e) { /* super yok */ }
	onaysiz() { this.onayTipi = 'BK'; return this } onayli() { this.onayTipi = ''; return this }
}
class SablonluSatisSiparisDetay extends TSStokDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e; SablonluSatisSiparisOrtayDetayTemplate.pTanimDuzenle(e)
		/* !! TSDetay::hmrPropertyleriOlustur(e)  tarafından Tüm HMR için pTanim üst seviyede zaten oluşuyor !! */
		/* for (let {ioAttr, adiAttr, rowAttr} of HMRBilgi.hmrIter_ekOzellik()) { pTanim[ioAttr] = new PInstStr(rowAttr); pTanim[adiAttr] = new PInstStr() } */
	}
}

class SablonluKonsinyeSiparisFis extends SatisSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return SablonluKonsinyeSiparisDetay }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); SablonluSatisSiparisOrtakFisTemplate.pTanimDuzenle(e) }
	static detaySiniflarDuzenle(e) { /* super yok */ }
	onaysiz() { this.onayTipi = 'BK'; return this } onayli() { this.onayTipi = ''; return this }
}
class SablonluKonsinyeSiparisDetay extends TSStokDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e; SablonluSatisSiparisOrtayDetayTemplate.pTanimDuzenle(e)
		/* !! TSDetay::hmrPropertyleriOlustur(e)  tarafından Tüm HMR için pTanim üst seviyede zaten oluşuyor !! */
		/* for (let {ioAttr, adiAttr, rowAttr} of HMRBilgi.hmrIter_ekOzellik()) { pTanim[ioAttr] = new PInstStr(rowAttr); pTanim[adiAttr] = new PInstStr() } */
	}
}
