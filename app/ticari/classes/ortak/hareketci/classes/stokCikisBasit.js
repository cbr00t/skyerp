class StokCikisBasitHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 1 }
	static get kod() { return 'stokCikisBasit' } static get aciklama() { return 'Stok Çıkış' }
	static get uygunmu() { return true } static get kisaKod() { return 'SC' }
	static get donemselIslemlerIcinUygunmu() { return false } static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static get stokCikisBasitmi() { return true }
	static getAltTipAdiVeOncelikClause({ hv }) { return { } }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('stokkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`stkmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments); kaListe.push(...[
			new CKodVeAdi(['stokCikis', 'Stok Çıkış'])
		])
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments); let kodClause = hvDegeri('shkod') || 'har.stokkod';
		if (!from.aliasIcinTable('stk')) { sent.fromIliski('stkmst stk', `${kodClause} = stk.kod`) }
		if (!from.aliasIcinTable('grp')) { sent.stok2GrupBagla() }
		if (!from.aliasIcinTable('sigrp')) { sent.stok2IstGrupBagla() }
		if (!from.aliasIcinTable('isl')) { sent.fis2StokIslemBagla() }
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) { }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_stokCikis(e)
    }
    /** (Ticari Stok/Hizmet) için UNION */
    uniDuzenle_stokCikis({ uygunluk, liste }) {
		$.extend(liste, {
			stokCikis: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
					sent.fisHareket('stfis', 'ststok');
					wh.fisSilindiEkle().add(`fis.gctipi = 'C'`, `fis.ozeltip = ''`, `fis.ozelisaret <> 'X'`);
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						oncelik: '1', ba: `'A'`, kayittipi: `'SC'`,
						islkod: 'fis.islkod', islemadi: `'Stok Çıkış'`, shTipi: `'S'`,
						shkod: 'har.stokkod', shadi: 'stk.aciklama', grupkod: 'stk.grupkod', istgrupkod: 'stk.sistgrupkod',
						bedel: 'har.fmalhammadde + har.fmalmuh'
					})
				})
			]
		});
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, { mst: DMQStok, grup: DMQStokGrup, istGrup: DMQStokIstGrup, isl: DMQStokIslem })
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments);
		let grpClause = hv.grupkod || 'stk.grupkod'
		let iGrpClause = hv.istgrupkod || 'stk.istgrupkod';
		let islClause = hv.islkod || 'fis.islkod';
		mstClause ||= hv.shkod || 'har.stokkod';
		if (sec) {
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'stk.aciklama');
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama');
			wh.basiSonu(sec.istGrupKod, iGrpClause).ozellik(sec.istGrupAdi, 'sigrp.aciklama');
			wh.basiSonu(sec.islKod, islClause).ozellik(sec.islAdi, 'isl.aciklama')
		}
	}
}

