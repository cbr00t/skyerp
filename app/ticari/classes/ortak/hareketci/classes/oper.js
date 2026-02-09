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
			uretfiremiktar: 'oem.uretfiremiktar', iskartamiktar: 'oem.uretiskartamiktar',
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
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from, where: wh } }) {
		super.uniOrtakSonIslem(...arguments)
		sent
			.fromAdd('isemri emr')
			.leftJoin('emr', 'carmst ecar', 'emr.mustkod = ecar.must')
			.innerJoin('emr', 'emirdetay edet', 'emr.kaysayac = edet.fissayac')
			.leftJoin('edet', 'emirkomple komp', 'edet.kompsayac = komp.kaysayac')
			.leftJoin('komp', 'urtfrm kfrm', 'komp.formulsayac = kfrm.kaysayac')
			.leftJoin('kfrm', 'stkmst kstk', 'kfrm.formul = kstk.kod')
			.fromIliski('operemri oem', 'edet.kaysayac = oem.emirdetaysayac')
			.fromIliski('operasyon op', 'oem.opno = op.opno')
			.fromIliski('ismerkezi uhat', 'oem.ismrkkod = uhat.kod')
			.fromIliski('urtfrm frm', 'edet.formulsayac = frm.kaysayac')
			.fromIliski('stkmst stk', 'frm.formul = stk.kod')
			.fromIliski('isyeri sub', 'emr.bizsubekod = sub.kod')
		wh.add(`emr.silindi = ''`)
	}
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		let {miktarBilgileri} = this
		extend(hv, {
			bizsubekod: 'emr.bizsubekod',
			shTipi: `'S'`, tarih: 'emr.tarih',
			fisno: 'emr.no', fisnox: 'emr.fisnox',
			opno: 'oem.opno', hatkod: 'oem.ismrkkod',
			stokkod: 'frm.formul', sipmustkod: 'emr.mustkod',
			kstokkod: 'kfrm.formul', seviyebelirtim: 'edet.seviyebelirtim',
			fistip: 'emr.fistipi', emirdurum: 'emr.durumu',
			operdurum: `(case when oem.bittarih IS NULL then 'Devam Eden' else 'KAPANMIŞ' end)`,
			detaciklama: 'edet.detaciklama'
			/* -- üst seviyede =>
			aciklama: ({ hv }) => {
                let withCoalesce = clause => (clause?.sqlDoluDegermi ?? false) ? `COALESCE(${clause}, '')` : sqlEmpty
                let {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }*/
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
			],
			iskarta: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => { })
				.hvDuzenleIslemi(({ hv }) => {
					extend(hv, { kayittipi: `'Iskarta'`, isladi: `'Iskarta'` })
				})
			],
			duraksama: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => { })
				.hvDuzenleIslemi(({ hv }) => {
					extend(hv, { kayittipi: `'Dur'`, isladi: `'Duraksama'` })
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
		extend(hv, {
			hazsuresn: 'SUM(oem.hazirliksuresn)',
			topsuresn: 'SUM(oem.topsuresn)'
		})
	}
}

class OperGerHareketciOrtak extends OperBaseHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	uniOrtakSonIslem({ hvDegeri, sent }) {
		super.uniOrtakSonIslem(...arguments)
		sent
			.fromIliski('opergerdetay gdet', 'oem.kaysayac = gdet.fissayac')
			.fromIliski('personel per', 'gdet.perkod = per.kod')
			.fromIliski('tekilmakina tez', 'gdet.tezgahkod = tez.kod')
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		;['perkod', 'tezgahkod'].forEach(k =>
			hv[k] = `gdet.${k}`)
	}
}

class OperGerHareketci extends OperGerHareketciOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return super.oncelik + 2 } static get kisaKod() { return 'OG' }
	static get kod() { return 'OPEGER' } static get aciklama() { return 'Oper. Gerçekleme' }

	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['operGer', 'Oper. Gerçekleme']))
    }
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		extend(hv, {
			emirmiktar: 'oem.emirmiktar', brutmiktar: 'SUM(gdet.miktar)',
			netmiktar2: 'SUM(gdet.miktar2)'
		})
		;['firemiktar', 'iskartamiktar', 'netmiktar', 'brutislemsuresn', 'topduraksamasuresn', 'netislemsuresn'].forEach(k =>
			hv[k] = `SUM(gdet.${k})`)
	}
}

class IskartaHareketci extends OperGerHareketciOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return super.oncelik + 3 } static get kisaKod() { return 'IS' }
	static get kod() { return 'ISKARTA' } static get aciklama() { return 'Iskarta' }

	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['iskarta', 'Iskarta']))
    }
	uniOrtakSonIslem({ hvDegeri, stm, sent, sent: { from, sahalar } }) {
		super.uniOrtakSonIslem(...arguments)
		sahalar.add('gdet._')    // gdet alias silinmesin diye geçici saha
	}
	stmIcinSonIslemler({ rapor, attrSet, hrkDefHV: defHV, stm }) {
		super.stmIcinSonIslemler(...arguments)
		let {operGenel: { iskartaMaxSayi: iskMaxSayi = 8 } = {}} = app.params
		for (let asilSent of stm) {    // tek sent gelecek
			let uni = new MQUnionAll()
			for (let i = 1; i <= iskMaxSayi; i++) {
				let sent = asilSent.deepCopy(), {where: wh, sahalar} = sent
				sahalar.liste = sahalar.liste                                                     // gdet alias silinmesin diye geçici saha silinir
					.filter(({ alias }) => alias != '_')
				let nedenKodClause = `gdet.iskartaneden${i}kod`
				sent.fromIliski('opiskartanedeni ned', `${nedenKodClause} = ned.kod`)
				wh.add(`${nedenKodClause} <> ''`)
				sahalar.add(
					`${nedenKodClause} nedenkod`, 'ned.aciklama nedenadi',
					`SUM(gdet.iskartamiktar${i}) iskartamiktar`
				)
				uni.add(sent)
			}
			stm.sent = uni
		}
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		// extend(hv, { nedenkod: sqlNull, iskartamiktar: sqlNull })
	}
}

class DuraksamaHareketci extends OperGerHareketciOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return super.oncelik + 4 } static get kisaKod() { return 'DR' }
	static get kod() { return 'DURAKSAMA' } static get aciklama() { return 'Duraksama' }

	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['duraksama', 'Duraksama']))
    }
	uniOrtakSonIslem({ hvDegeri, stm, sent, sent: { from, sahalar } }) {
		super.uniOrtakSonIslem(...arguments)
		sent
			.fromIliski('makduraksama mdur', 'gdet.kaysayac = mdur.opergersayac')
			.fromIliski('makdurneden dned', 'mdur.durnedenkod = dned.kod')
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		extend(hv, {
			nedenkod: 'mdur.durnedenkod', nedenadi: 'dned.aciklama',
			dursuresn: 'SUM(mdur.dursuresn)', durbasts: 'mdur.duraksamabasts', dursonts: 'mdur.duraksamasonts',
			duraciklama: 'mdur.aciklama', durtipi: 'dned.duraksamatipi'
		})
	}
}
