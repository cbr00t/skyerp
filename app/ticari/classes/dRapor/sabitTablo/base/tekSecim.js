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
			new CKodAdiVeEkBilgi(['', 'Yok', 'yokmu', { ozelmi: true }]),
			new CKodAdiVeEkBilgi(['AS', 'Alt Seviye Toplamı', 'altSeviyeToplamimi', { ozelmi: true, formulmu: true }]),
			new CKodAdiVeEkBilgi(['FR', 'Satırlar Toplamı', 'satirlarToplamimi', { ozelmi: true, formulmu: true }]),
			new CKodAdiVeEkBilgi(['SH', 'Ticari', 'ticarimi', { querymi: true }]),
			new CKodAdiVeEkBilgi(['HZ', 'Hizmet Hareketleri', 'hizmetmi', { querymi: true }]),
			(config.dev ? new CKodAdiVeEkBilgi(['FX', 'Formül', 'formulmu'], { ozelmi: true, formulmu: true }) : null)
		].filter(x => !!x))
	}
}
class SBTabloVeriTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); let {kaListe} = e;
		let topSahaEkle = e.topSahaEkle = ({ sent, clause, sahaAlias }) =>
			sent.sahalar.add(`SUM(${clause}) ${sahaAlias}`);
		kaListe.push(...[
			new CKodAdiVeEkBilgi([' ', '', 'yokmu', {
				gosterimUygunluk: ({ hesapTipi, shStokHizmet }) => !hesapTipi.ticarimi
			}])
		]);
		this.kaListeDuzenle_ticari(e)
	}
	kaListeDuzenle_ticari({ kaListe, topSahaEkle }) {
		let gosterimUygunluk = ({ hesapTipi, shStokHizmet }) => hesapTipi.ticarimi;
		kaListe.push(...[
			new CKodAdiVeEkBilgi(['SBRT', 'Satır Brüt', 'satirBrutmu', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel' })
			}]),
			new CKodAdiVeEkBilgi(['SNET', 'Satır Net', 'satirNetmi', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.bedel' })
			}]),
			new CKodAdiVeEkBilgi(['SISK', 'Satır İskonto', 'satirIskmi', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel - har.bedel' })
			}]),
			new CKodAdiVeEkBilgi(['DISK', 'Dip İskonto', 'dipIskmi', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.dipiskonto' })
			}]),
			new CKodAdiVeEkBilgi(['TISK', 'Top. İskonto', 'topIskmi', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel - har.bedel + har.dipiskonto' })
			}]),
			new CKodAdiVeEkBilgi(['CIR', 'Ciro', 'ciromu', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.harciro' })
			}]),
			new CKodAdiVeEkBilgi(['MAL', 'Maliyet', 'maliyetmi', {
				gosterimUygunluk, sentUygunluk: ({ stokmu, hizmetmi }) => stokmu,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.fmalhammadde + har.fmalmuh' })
			}]),
			new CKodAdiVeEkBilgi(['KCR', 'KDVli Ciro', 'kdvliCiromu', {
				gosterimUygunluk,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.harciro + har.topkdv' })
			}]) /*,
			new CKodAdiVeEkBilgi(['KML', 'KDVli Maliyet', 'kdvliMaliyetmi', {
				gosterimUygunluk, sentUygunluk: ({ stokmu, hizmetmi }) => stokmu,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.fmalhammadde + har.fmalmuh + har.topkdv' })
			}])*/
		])
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
	static get defaultChar() { return 'X' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi([' ', 'Yurt İçi', 'yurticimi']),
			new CKodVeAdi(['IH', 'İhracat', 'ihracatmi']),
			new CKodVeAdi(['X', 'Birlikte', 'birliktemi'])
		)
	}
}
