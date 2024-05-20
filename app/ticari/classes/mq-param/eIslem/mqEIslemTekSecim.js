class EIslKural_SHAdi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get sadeceAdi1mi() { return this.char == ' ' } get sadeceAdi2mi() { return this.char == '2' } get birliktemi() { return this.char == 'B' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Sadece Adı']),
			new CKodVeAdi(['2', '2. Adı']),
			new CKodVeAdi(['B', 'Adı ve 2. adı'])
		)
	}
}
class EIslKural_Fason extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get hepsimi() { return this.char == ' ' } get sadeceStokmu() { return this.char == 'S' } get sadeceHizmetmi() { return this.char == 'H' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Stok ve Hizmet Kod/Adı']),
			new CKodVeAdi(['S', 'Sadece Stok Kod/Adı']),
			new CKodVeAdi(['H', 'Sadece Hizmet Kod/Adı'])
		)
	}
}
class EIslKural_Doviz extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get sadeceTLmi() { return this.char == ' ' } get dipteDovizVeTLmi() { return this.char == 'D' } get satirdaDovizVeDipteTLmi() { return this.char == 'X' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi([' ', 'Sadece TL']),
			new CKodVeAdi(['D', 'Satırda Döviz Fiyat ve Bedel (Dipte Döviz ve TL)']),
			new CKodVeAdi(['X', 'Satırda Döviz Fiyat, TL Fiyat ve TL Bedel (Dipte Sadece TL)'])
		)
	}
}
class EIslKural_AciklamaKapsam extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get hepsimi() { return this.char == ' ' } get sadeceNotlarmi() { return this.char == 'E' } get sadeceAciklamami() { return this.char == 'S' } get yokmu() { return this.char == 'X' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Satırdaki Notlar ve Açıklama Satırları']),
			new CKodVeAdi(['E', 'Sadece Satırdaki Notlar']),
			new CKodVeAdi(['S', 'Sadece Açıklama Satırları']),
			new CKodVeAdi(['X', 'Açıklama alınmaz'])
		)
	}
}
class EIslKural_Aciklama extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get hepsiSatirAltindami() { return this.char == ' ' } get hepsiDiptemi() { return this.char == 'D' }
	get satirIciUrunAdindami() { return this.char == 'Y' } get hemDipteHemSatirAltindami() { return this.char == 'H' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Hepsi Detayın Altında']),
			new CKodVeAdi(['D', 'Hepsi Dipte']),
			new CKodVeAdi(['Y', 'Satır İçi Olanlar Ürün Adında, Açıklama Satırları Detay Altında']),
			new CKodVeAdi(['H', 'Hepsi Hem Dipte, Hem Satır Altında'])
		)
	}
}
class EIslKural_Miktar extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '1' } get sadece1mi() { return this.char == '1' } get birliktemi() { return this.char == '12' } get fiyataEsasmi() { return this.char == 'F' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['1', 'Sadece 1. Miktar']),
			new CKodVeAdi(['12', '1. ve 2. Miktar']),
			new CKodVeAdi(['F', 'Fiyata Esas Miktar'])
		)
	}
}
class EIslKural_Fiyat extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get brutmu() { return this.char == ' ' } get netmi() { return this.char == 'NT' } get hepsimi() { return this.char == 'HP' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Sadece Brüt Fiyat']),
			new CKodVeAdi(['NT', 'Sadece Net Fiyat']),
			new CKodVeAdi(['HP', 'Birlikte'])
		)
	}
}
class EIslKural_Koli extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'C' } get sadeceKolimi() { return this.char == 'C' } get koliVeAdetmi() { return this.char == 'CA' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['C', 'Sadece Koli ve Koli Cinsi']),
			new CKodVeAdi(['CA', 'Koli, Koli Cinsi ve Adet'])
		)
	}
}
class EIslKural_HMR extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get hepsimi() { return this.char == ' ' } get sadeceKodmu() { return this.char == 'K' } get sadeceAdimi() { return this.char == 'A' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Kod ve Adı']),
			new CKodVeAdi(['K', 'Sadece Kodu']),
			new CKodVeAdi(['A', 'Sadece Adı'])
		)
	}
}
class EIslKural_SipTarihVeNo extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' } get ustteYanYanami() { return this.char == ' ' } get ustteAltAltami() { return this.char == 'UA' } get sadeceNomu() { return this.char == 'SN' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Üstte Yan Yana']),
			new CKodVeAdi(['UA', 'Üstte Alt Alta']),
			new CKodVeAdi(['SN', 'Üstte Sadece No'])
		)
	}
}
class EIslKural_IrsTarihVeNo extends EIslKural_SipTarihVeNo {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get dipteYanYanami() { return this.char == 'DP' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(new CKodVeAdi(['DP', 'Dipte Yan Yana']))
	}
}
class EIslKural_IrsTarihFormat extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get uzunmu() { return this.char == ' ' }
	get kisami() { return this.char == 'Y' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', '08/10/2023 gibi']),
			new CKodVeAdi(['Y', '08/10/23 gibi']),
			new CKodVeAdi(['K', '08.Eki gibi'])
		)
	}
}
class EIslKural_IrsNoFormat extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get uzunmu() { return this.char == ' ' }
	get kisami() { return this.char == 'Y' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'SKY2023000000123 gibi']),
			new CKodVeAdi(['Y', 'SKY123 gibi'])
		)
	}
}
class EIslKural_IhrBrutNet extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	get yokmu() { return this.char == ' ' }
	get satirAltiAciklamami() { return this.char == 'A' }
	get ayriKolonmu() { return this.char == 'K' }
	get hepsimi() { return this.char == 'X' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi([' ', 'Gösterilmez']),
			new CKodVeAdi(['A', 'Satır Altında Açıklama']),
			new CKodVeAdi(['K', 'Ayrı Kolon']),
			new CKodVeAdi(['X', 'Hem Satır Altında, Hem de Kolon'])
		)
	}
}

class EIslKural_IhrSatirTekCift extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'C' }
	get ciftmi() { return this.char == 'C' }
	get tekmi() { return this.char == 'T' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['C', 'Çift Satırda']),
			new CKodVeAdi(['T', 'Tek Satırda'])
		)
	}
}


class EArsiv_BelgeTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	get kagitmi() { return this.char == '' }
	get elektronikmi() { return this.char == 'E' }
	
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['', 'Kağıt']),
			new CKodVeAdi(['T', 'Elektronik'])
		)
	}
}
