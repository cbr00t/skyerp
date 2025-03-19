class SablonluSiparisListeOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' }
	get fisSinif() { return this._fisSinif } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisListeOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null } get listemi() { return true }
	get fisIcinDetaySinif(){ let {fisSinif} = this; return fisSinif?.detaySinifFor?.('') ?? fisSinif?.detaySinif } get fisTable(){ return this.fisSinif?.table }
	get fisIcinDetayTable(){ let {fisSinif, fisIcinDetaySinif} = this; return fisIcinDetaySinif?.getDetayTable?.({ fisSinif }) ?? fisIcinDetaySinif?.table }
	get asilFis() {
		let {fisSinif, fisSayac: sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, klFirmaKod, teslimOrtakdir, baslikTeslimTarihi} = this;
		let detaylar = this.getYazmaIcinDetaylar();
		let fis = new fisSinif({ sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, klFirmaKod, teslimOrtakdir, baslikTeslimTarihi, detaylar });
		if (fis.onayTipi == null) { fis.onayTipi = 'BK' }
		return fis
	}
}
class SablonluSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return SablonluSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeGridci }
}
class SablonluKonsinyeSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return SablonluKonsinyeSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeSiparisListeGridci }
}

class SablonluSiparisListeOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'hizlisablondetay' }
	static get fisSayacSaha() { return 'grupsayac' } get listemi() { return true }
}
class SablonluSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class SablonluSiparisListeOrtakGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
