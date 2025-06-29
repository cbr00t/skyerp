class SBTabloHesapTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['', 'Yok', 'yokmu']),
			new CKodVeAdi(['AS', 'Alt Seviye Toplam', 'altSeviyemi']),
			new CKodVeAdi(['FR', 'Formül: Satırlar Toplamı', 'formulmu']),
			new CKodVeAdi(['SH', 'Stok/Hizmet/Demirbaş Sonucu', 'shdmi']),
			new CKodVeAdi(['ST', 'Stok Sonucu', 'stokmu']),
			new CKodVeAdi(['HZ', 'Hizmet Sonucu', 'hizmetmi']),
			new CKodVeAdi(['MH', 'Muh. Hesap', 'muhHesapmi'])
		)
	}
}
class SBTabloVeriTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'CIR' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['CIR', 'Ciro', 'ciromu']),
			new CKodVeAdi(['MAL', 'Maliyet', 'maliyetmi']),
			new CKodVeAdi(['KCR', 'KDVli Ciro', 'kdvliCiromu'])
		)
	}
}
class SBTabloAyrimTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['', 'Yurt İçi', 'yurticimi']),
			new CKodVeAdi(['IH', 'İhracat', 'ihracatmi']),
			new CKodVeAdi(['X', 'Birlikte', 'birliktemi'])
		)
	}
}
class SBTabloSeviye extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '1' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['1', 'X..', 'seviye1mi']),
			new CKodVeAdi(['2', '.X.', 'seviye2mi']),
			new CKodVeAdi(['3', '..X', 'seviye3mu'])
		)
	}
}
