class SablonluSatisSiparisOrtakFisTemplate extends CObject {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { let {pTanim} = e; $.extend(pTanim, { sablonSayac: new PInstNum('sablonsayac'), onayTipi: new PInst('onaytipi') }) }
}

class SablonluSatisSiparisFis extends SatisSiparisFis {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); SablonluSatisSiparisOrtakFisTemplate.pTanimDuzenle(e) }
}

class SablonluKonsinyeSiparisOrtakFis extends MQCogul {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { SablonluSatisSiparisOrtakFisTemplate.pTanimDuzenle(e) }
}
class SablonluKonsinyeAlimSiparisFis extends AlimSiparisFis {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); SablonluKonsinyeSiparisOrtakFis.pTanimDuzenle(e) }
}
class SablonluKonsinyeTransferFis extends TransferSiparisFis {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); SablonluKonsinyeSiparisOrtakFis.pTanimDuzenle(e) }
}
