class SBTabloSeviye extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '1' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['1', '<span class=royalblue>X..</span>', 'seviye1mi']),
			new CKodVeAdi(['2', '<span class=green>&nbsp;.X.</span>', 'seviye2mi']),
			new CKodVeAdi(['3', '&nbsp;&nbsp;..X', 'seviye3mu'])
		)
	}
}
class SBTabloHesapTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(...[
			new CKodVeAdi(['', 'Yok', 'yokmu']),
			new CKodVeAdi(['AS', 'Detaylar Toplamı', 'detaylarToplamimi']),
			new CKodVeAdi(['FR', 'Satırlar Toplamı', 'satirlarToplamimi']),
			new CKodVeAdi(['SH', 'Ticari', 'ticarimi']),
			new CKodVeAdi(['HZ', 'Hizmet Hareketleri', 'hizmetmi']),
			(config.dev ? new CKodVeAdi(['FX', 'Formül', 'formulmu']) : null)
		].filter(x => !!x))
	}
}
class SBTabloVeriTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodAdiVeEkBilgi([' ', '', 'yokmu']),
			new CKodAdiVeEkBilgi([
				'CIR', 'Ciro', 'ciromu',
				{
					gosterimUygunluk: ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi,
					sentDuzenle: ({ aliasVeNokta, sent, sahaAlias }) => sent.sahalar.add(`SUM(${aliasVeNokta}ciro) ${sahaAlias}`)
				}
			]),
			new CKodAdiVeEkBilgi([
				'MAL', 'Maliyet', 'maliyetmi',
				{
					gosterimUygunluk: ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi,
					sentUygunluk: ({ stokmu, hizmetmi }) => !!stokmu,
					sentDuzenle: ({ aliasVeNokta, sent, sahaAlias }) => sent.sahalar.add(`SUM(${aliasVeNokta}tummaliyet) ${sahaAlias}`)
				}
			]),
			new CKodAdiVeEkBilgi([
				'KCR', 'KDVli Ciro', 'kdvliCiromu',
				{
					gosterimUygunluk: ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi,
					sentDuzenle: ({ aliasVeNokta, sent, sahaAlias }) => sent.sahalar.add(`SUM(${aliasVeNokta}ciro + ${aliasVeNokta}topkdv) ${sahaAlias}`)
				}
			]),
			new CKodAdiVeEkBilgi([
				'KML', 'KDVli Maliyet', 'kdvliMaliyetmi',
				{
					gosterimUygunluk: ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi,
					sentUygunluk: ({ stokmu, hizmetmi }) => !!stokmu,
					sentDuzenle: ({ aliasVeNokta, sent, sahaAlias }) => sent.sahalar.add(`SUM(${aliasVeNokta}tummaliyet + ${aliasVeNokta}topkdv) ${sahaAlias}`)
				}
			])
		)
	}
}
class SBTabloStokHizmet extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['S', '<span class=forestgreen>Sadece Stok</span>', 'stokmu']),
			new CKodVeAdi(['H', '<span class=orangered>Sadece Hizmet</span>', 'hizmetmi']),
			new CKodVeAdi([' ', '<span class=royalblue>Birlikte</span>', 'birliktemi'])
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
