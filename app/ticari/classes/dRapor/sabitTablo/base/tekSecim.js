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
		super.kaListeDuzenle(...arguments); let ekListe = [
			/*new CKodAdiVeEkBilgi(['', 'Yok', 'yokmu', { ozelmi: true }]),*/
			new CKodAdiVeEkBilgi(['AS', 'Alt Seviye Toplamı', 'altSeviyeToplamimi', { formulmu: true }]),
			new CKodAdiVeEkBilgi(['FR', 'Satırlar Toplamı', 'satirlarToplamimi', { formulmu: true }]),
			new CKodAdiVeEkBilgi(['SH', 'Ticari', 'ticarimi', { querymi: true }])
		];
		let harSiniflar = [KasaHareketci, HizmetHareketci, BankaMevduatHareketci];
		for (let harSinif of harSiniflar) {
			let {kisaKod, kod, aciklama} = harSinif;
			let question = `${kod}mi`; aciklama += ` Hareketleri`;
			ekListe.push(new CKodAdiVeEkBilgi([kisaKod, aciklama, question, { harSinif }]))
		}
		if (config.dev) { ekListe.push(new CKodAdiVeEkBilgi(['FX', 'Formül', 'formulmu'], { formulmu: true })) }
		
		for (let {ekBilgi} of ekListe) {
			if (!ekBilgi) { continue }
			if (ekBilgi.formulmu) { ekBilgi.ozelmi = true }
			else if (ekBilgi.harSinif) { ekBilgi.hareketcimi = ekBilgi.querymi = true }
			else if (ekBilgi.hareketcimi) { ekBilgi.querymi = true }
		}
		if (ekListe.length) { kaListe.push(...ekListe) }
	}
}
class SBTabloVeriTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	get donemBasimi() { return this.ekBilgi?.donemBasimi ?? false } get donemSonumu() { return this.ekBilgi?.donemSonumu ?? false }
	get donemTipi() { return this.donemBasimi ? 'B' : this.donemSonumu ? 'S' : null }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); let {kaListe} = e;
		let topSahaEkle = e.topSahaEkle = ({ sent, clause, sahaAlias, det: { tersIslemmi, shIade }, hv }) => {
			if (isFunction(clause)) { clause = clause(hv) }
			let tersmi = tersIslemmi != shIade.iademi, {sahalar} = sent;
			sahalar.add(`(SUM(${clause})${tersmi ? ' * -1' : ''}) ${sahaAlias}`)
		};
		this.kaListeDuzenle_ticari(e).kaListeDuzenle_hareketci(e)
	}
	kaListeDuzenle_ticari({ kaListe, topSahaEkle }) {
		let gosterimUygunluk = ({ hesapTipi }) => hesapTipi.ticarimi, sentUygunluk = null;
		kaListe.push(...[
			new CKodAdiVeEkBilgi(['SBRT', 'Satır Brüt', 'satirBrutmu', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel' })
			}]),
			new CKodAdiVeEkBilgi(['SNET', 'Satır Net', 'satirNetmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.bedel' })
			}]),
			new CKodAdiVeEkBilgi(['SISK', 'Satır İskonto', 'satirIskmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel - har.bedel' })
			}]),
			new CKodAdiVeEkBilgi(['DISK', 'Dip İskonto', 'dipIskmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.dipiskonto' })
			}]),
			new CKodAdiVeEkBilgi(['TISK', 'Top. İskonto', 'topIskmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.brutbedel - har.bedel + har.dipiskonto' })
			}]),
			new CKodAdiVeEkBilgi(['CIR', 'Ciro', 'ciromu', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.harciro' })
			}]),
			new CKodAdiVeEkBilgi(['MAL', 'Maliyet', 'maliyetmi', {
				gosterimUygunluk, sentUygunluk: ({ stokmu, hareketcimi }) => stokmu,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.fmalhammadde + har.fmalmuh' })
			}]),
			new CKodAdiVeEkBilgi(['KCR', 'KDVli Ciro', 'kdvliCiromu', {
				gosterimUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.harciro + har.topkdv' })
			}]) /*,
			new CKodAdiVeEkBilgi(['KML', 'KDVli Maliyet', 'kdvliMaliyetmi', {
				gosterimUygunluk, sentUygunluk: ({ stokmu, hareketcimi }) => stokmu,
				sentDuzenle: e => topSahaEkle({ ...e, clause: 'har.fmalhammadde + har.fmalmuh + har.topkdv' })
			}])*/
		]);
		return this
	}
	kaListeDuzenle_hareketci({ kaListe, topSahaEkle }) {
		let {sqlZero} = Hareketci_UniBilgi.ortakArgs;
		let sentUygunluk = null, gosterimUygunluk = ({ hesapTipi }) => hesapTipi.ekBilgi?.hareketcimi;
		let getBABedelClause = (ba, baClause, bedelClause) => {
			bedelClause ??= sqlZero;
			if (!(ba && baClause)) { return bedelClause }
			return `(case when ${baClause} = '${ba}' then ${bedelClause} else 0 end)`
		};
		let getBABakiyeClause = (ba, baClause, bedelClause) => {
			bedelClause ??= sqlZero;
			if (!(ba && baClause)) { return bedelClause }
			return `(case when ${baClause} = '${ba}' then ${bedelClause} else 0 - ${bedelClause} end)`
		};
		kaListe.push(...[
			new CKodAdiVeEkBilgi(['DBBB', 'Dönem Başı Borç Bakiye', 'donemBasiBorcBakiyemi', {
				gosterimUygunluk, sentUygunluk, donemBasimi: true,
				sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('B', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['DBAB', 'Döenm Başı Alacak Bakiye', 'donemBasiAlacakBakiyemi', {
				gosterimUygunluk, sentUygunluk, donemBasimi: true,
				sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('A', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['BRBD', 'Cari Borç', 'borcBedelmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABedelClause('B', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['ALBD', 'Cari Alacak', 'alacakBedelmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABedelClause('A', hv.ba, hv.bedel) })
			}]),
			/*new CKodAdiVeEkBilgi(['ISBD', 'Bedel', 'bedelmi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABedelClause(null, hv.ba, hv.bedel) })
			}]),*/
			new CKodAdiVeEkBilgi(['BRBK', 'Cari Borç Bakiye', 'borcBakiyemi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('B', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['ALBK', 'Cari Alacak Bakiye', 'alacakBakiyemi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('A', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['DSBB', 'Dönem Sonu Borç Bakiye', 'donemSonuBorcBakiyemi', {
				gosterimUygunluk, sentUygunluk, donemSonumu: true,
				sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('B', hv.ba, hv.bedel) })
			}]),
			new CKodAdiVeEkBilgi(['DSAB', 'Döenm Sonu Alacak Bakiye', 'donemSonuAlacakBakiyemi', {
				gosterimUygunluk, sentUygunluk, donemSonumu: true,
				sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause('A', hv.ba, hv.bedel) })
			}])
			/*new CKodAdiVeEkBilgi(['ISBK', 'Bakiye', 'bakiyemi', {
				gosterimUygunluk, sentUygunluk, sentDuzenle: e => topSahaEkle({ ...e, clause: hv => getBABakiyeClause(null, hv.ba, hv.bakiye) })
			}]),*/
		]);
		return this
	}
}
class SBTabloStokHizmet extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['S', '<span class=forestgreen>Sadece Stok</span>', 'stokmu']),
			new CKodVeAdi(['H', '<span class=orangered>Sadece Hizmet</span>', 'hareketcimi']),
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
