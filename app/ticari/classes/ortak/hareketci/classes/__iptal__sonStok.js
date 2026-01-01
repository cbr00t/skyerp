class SonStokHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 50 } static get uygunmu() { return true }
	static get kod() { return 'sonStok' } static get aciklama() { return 'Son Stok' }
	static get kisaKod() { return 'SC' } static get maliTabloIcinUygunmu() { return true }
	static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static getAltTipAdiVeOncelikClause({ hv }) { return { } }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		result.set('shkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`stkmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['sonStok', 'Son Stok']))
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
		let kodClause = hvDegeri('shkod') || 'son.stokkod'
		if (!from.aliasIcinTable('stk')) { sent.fromIliski('stkmst stk', `${kodClause} = stk.kod`) }
		if (!from.aliasIcinTable('yer')) { sent.fromIliski('stkyer yer', `${hvDegeri('yerkod')} = yer.kod`) }
		if (!from.aliasIcinTable('sub')) { sent.fromIliski('isyeri sub', `${hvDegeri('bizsubekod')} = sub.kod`) }
		if (!from.aliasIcinTable('grp')) { sent.stok2GrupBagla() }
		if (!from.aliasIcinTable('sigrp')) { sent.stok2IstGrupBagla() }
		if (!from.aliasIcinTable('isl')) { sent.fis2StokIslemBagla() }
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		// super.varsayilanHVDuzenle(...arguments)
	}
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_sonStok(e)
    }
    /** (Son Stok) için UNION */
    uniDuzenle_sonStok({ uygunluk, liste }) {
		$.extend(liste, {
			sonStok: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
					sent.fromAdd('sonstok son')
					wh.add('son.opno IS NULL')
					//wh.fisSilindiEkle().add(`fis.gctipi = 'C'`, `fis.ozeltip = ''`, `fis.ozelisaret <> 'X'`);
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						oncelik: '1', ba: `'B'`, kayittipi: `'SN'`,
						isladi: `'Son Stok'`, shTipi: `'S'`,
						shkod: 'son.stokkod', shadi: 'stk.aciklama',
						yerkod: 'son.yerkod', yeradi: 'yer.aciklama',
						grupkod: 'stk.grupkod', istgrupkod: 'stk.sistgrupkod',
						bizsubekod: 'yer.bizsubekod', bizsubadi: 'sub.aciklama',
						miktar: 'son.sonmiktar', miktar2: 'son.sonmiktar2',
						brm: 'stk.brm', brm2: 'stk.brm2'
					})
				})
			]
		});
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, {
			sube: DMQSube, subeGrup: DMQSubeGrup, mst: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup,
			istGrup: DMQStokIstGrup, tip: DMQStokTip
		})
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		mstClause ||= hv.shkod || 'har.stokkod'
		let grpClause = hv.grupkod || 'stk.grupkod',  aGrpClause = hv.anaGrupkod || 'grp.anagrupkod'
		let iGrpClause = hv.istgrupkod || 'stk.istgrupkod', tipClause = hv.tipkod || 'stk.stoktipi'
		if (sec) {
			wh.basiSonu(sec.subeKod, 'fis.bizsubekod').ozellik(sec.subeAdi, 'sub.aciklama')
			wh.basiSonu(sec.subeGrupKod, 'sub.isygrupkod').ozellik(sec.subeGrupAdi, 'igrp.aciklama')
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'stk.aciklama')
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama')
			wh.basiSonu(sec.anaGrupKod, aGrpClause).ozellik(sec.anaGrupAdi, 'agrp.aciklama');
			wh.basiSonu(sec.istGrupKod, iGrpClause).ozellik(sec.istGrupAdi, 'sigrp.aciklama')
			wh.basiSonu(sec.tipKod, tipClause)
		}
	}
}

