class ExtFis_CSOrtak extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return [this.sinifAdi_prefix, this.sinifAdi_postfix].filter(x => !!x).join(' ') }
	static get sinifAdi_prefix() { return ( this.borcmu ? 'Borç' : this.alacakmi ? 'Alacak': '' ) }
	static get sinifAdi_postfix() { return ( this.cekmi ? 'Çek' : this.senetmi ? 'Senet' : '' ) }
	static get tipKod() { return null }
	static get numTipKod() { return null }
	static get tekSecimSinif() { }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { belgeNo: new PInstNum('belgeno') })
	}
}
class ExtFis_AlacakCS extends ExtFis_CSOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get alacakmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { belgeYil: new PInstNum('belgeyil') })
	}
}
class ExtFis_AlacakCek extends ExtFis_AlacakCS {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'AC' }
	static get numTipKod() { return 'CALAC' }
	static get tekSecimSinif() { return CSFisTipi_AlacakCek }
	static get cekmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { bankaKod: new PInstStr('bankakod') })
	}
}
class ExtFis_AlacakSenet extends ExtFis_AlacakCS {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'AS' }
	static get numTipKod() { return 'SNAL' }
	static get tekSecimSinif() { return CSFisTipi_AlacakSenet }
	static get senetmi() { return true }
}
class ExtFis_BorcCS extends ExtFis_CSOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get borcmu() { return true }
}
class ExtFis_BorcCek extends ExtFis_BorcCS {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'BC' }
	static get numTipKod() { return 'BC3S' }
	static get tekSecimSinif() { return CSFisTipi_BorcCek }
	static get cekmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { banHesapKod: new PInstStr('banhesapkod') })
	}
}
class ExtFis_BorcSenet extends ExtFis_BorcCS {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'BS' }
	static get numTipKod() { return 'BS3S' }
	static get tekSecimSinif() { return CSFisTipi_BorcSenet }
	static get senetmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { belgeYil: new PInstNum('belgeyil') })
	}
}
