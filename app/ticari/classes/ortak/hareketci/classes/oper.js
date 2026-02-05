class OperBaseHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 105 } static get sadeceTotalmi() { return true }
	static get uygunmu() { return !this.araSeviyemi && app.violetmi }
	static get araSeviyemi() { return super.araSeviyemi || this == OperBaseHareketci }
	static get kategoriKod() { return 'URETIM' } static get aciklama() { return 'Üretim' }
	static get maliTabloIcinUygunmu() { return true } static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static get miktarBilgileri() {
		return {
			emirmiktar: 'oem.emirmiktar', uretbrutmiktar: 'oem.uretbrutmiktar',
			uretfiremiktar: 'oem.uretfiremiktar', iskartamiktar: 'oem.iskartamiktar',
			uretnetmiktar: 'oem.uretnetmiktar', uretnetmiktar2: 'oem.uretnetmiktar2',
			kalanmiktar: 'oem.kalanmiktar', islenebilirmiktar: 'oem.islenebilirmiktar'
		}
	}

	static getAltTipAdiVeOncelikClause({ hv }) {
		return {}
	}
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		//result.set('stokkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
		//	sent.fromIliski(`stkmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec.secimTopluEkle({
			fisNo: new SecimNumber({ etiket: 'Emir No' })
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh, hv }) => {
			wh.basiSonu(sec.fisNo, hv.fisno)
		})
		sec.addKA('urun', DMQStok, ({ hv }) => hv.stokkod, 'stk.aciklama')
		sec.addKA('oper', DMQOperasyon, ({ hv }) => hv.opno, 'op.aciklama')
		sec.addKA('hat', DMQHat, ({ hv }) => hv.hatkod, 'uhat.aciklama')
		sec.addKA('must', DMQCari, ({ hv }) => hv.mustkod, 'ecar.aciklama')
	}
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
		if (!from.aliasIcinTable('emr'))
			sent.fromAdd('isemri emr')
		if (!from.aliasIcinTable('ecar'))
			sent.leftJoin('emr', 'carmst ecar', 'emr.mustkod = ecar.must')
		if (!from.aliasIcinTable('edet'))
			sent.fromIliski('emirdetay edet', 'emr.kaysayac = edet.fissayac')
		if (!from.aliasIcinTable('oem'))
			sent.fromIliski('operemri oem', 'edet.oemsayac = oem.kaysayac')
		if (!from.aliasIcinTable('op'))
			sent.fromIliski('operasyon op', 'oem.opno = op.opno')
		if (!from.aliasIcinTable('uhat'))
			sent.fromIliski('ismerkezi uhat', 'oem.ismrkkod = uhat.kod')
		if (!from.aliasIcinTable('frm'))
			sent.fromIliski('urtfrm frm', 'edet.formulsayac = frm.kaysayac')
		if (!from.aliasIcinTable('stk'))
			sent.fromIliski('stkmst stk', 'frm.formul = stk.kod')
	}
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		let {miktarBilgileri} = this
		extend(hv, {
			shTipi: `'S'`, tarih: 'emr.tarih',
			fisno: 'emr.fisno', fisnox: 'emr.fisnox',
			opno: 'oem.opno', opadi: 'op.aciklama',
			hatkod: 'oem.ismrkkod', hatadi: 'uhat.aciklama',
			stokkod: 'stk.kod', stokadi: 'stk.aciklama'
		})
		// ?? - ıskarta nedenleri için toplam miktarlar (ıskarta nedeni)
	}
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_oper(e)
    }
    uniDuzenle_oper({ uygunluk, liste }) {
		$.extend(liste, {
			operDurum: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => { })
				.hvDuzenleIslemi(({ hv }) => {
					extend(hv, { kayittipi: `'OperDurum'`, isladi: `'Oper. Durum'` })
				})
			],
			operGer: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => { })
				.hvDuzenleIslemi(({ hv }) => {
					extend(hv, { kayittipi: `'OperGer'`, isladi: `'Oper. Gerçekleme'` })
				})
			]
		})
        return this
    }
}

class OperDurumHareketci extends OperBaseHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return super.oncelik + 1 } static get kisaKod() { return 'OD' }
	static get kod() { return 'OPERDURUM' } static get aciklama() { return 'Oper. Durum' }

	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['operDurum', 'Oper. Durum']))
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
	}
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		let {miktarBilgileri} = this
		for (let [k, v] of entries(miktarBilgileri))
			 hv[k] = v.asSumDeger()
	}
}

class OperGerHareketci extends OperBaseHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return super.oncelik + 2 } static get kisaKod() { return 'OG' }
	static get kod() { return 'OPEGER' } static get aciklama() { return 'Oper. Gerçekleme' }

	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['operGer', 'Oper. Gerçekleme']))
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
		if (!from.aliasIcinTable('gdet'))
			sent.fromIliski('opergerdetay gdet', 'oem.kaysayac = gdet.fissayac')
		if (!from.aliasIcinTable('per'))
			sent.fromIliski('personel per', 'gdet.perkod = per.kod')
		if (!from.aliasIcinTable('tez'))
			sent.fromIliski('tekilmakina tez', 'gdet.tezgahkod = tez.kod')
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		extend(hv, {
			emirmiktar: 'oem.emirmiktar', miktar: 'SUM(gdet.miktar)', miktar2: 'SUM(gdet.miktar2)',
			firemiktar: 'SUM(gdet.firemiktar)', iskartamiktar: 'SUM(gdet.iskartamiktar)'
		})
	}
}
