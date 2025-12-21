class BankaOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		result.set('banhesapkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.sahalar.add(`bhes.aciklama ${mstAdiAlias}`))
	}
	uniOrtakSonIslem({ sender, hv, sent }) {
		super.uniOrtakSonIslem(...arguments); let {from, where: wh} = sent;
		if (!from.aliasIcinTable('bhes')) { sent.x2BankaHesapBagla({ kodClause: hv.banhesapkod }) }
		/* if (from.aliasIcinTable('ban')) { wh.add(`ban.calismadurumu <> ''`) } */
		if (!this.sonIslem_whereBaglanmazFlag)
			wh.add(`bhes.calismadurumu <> ''`)
	}
	static varsayilanHVDuzenle_ortak({ hv }) {
		super.varsayilanHVDuzenle_ortak(...arguments);
		$.extend(hv, { finanalizkullanilmaz: 'bhes.finanalizkullanilmaz' })
	}
	static varsayilanHVDuzenle({ hv }) {
		super.varsayilanHVDuzenle(...arguments)
		$.extend(hv, { dvkod: 'bhes.dvtipi' })
	}
	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, { sube: DMQSube, subeGrup: DMQSubeGrup, mst: DMQBankaHesap, grup: DMQBankaHesapGrup, banka: DMQBanka })
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: detSec, sent, sent: { from, where: wh }, hv, mstClause }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		sent.bankaHesap2BankaBagla().bankaHesap2GrupBagla()
		mstClause ||= 'bhes.kod'
		wh.basiSonu(detSec.mstKod, mstClause).ozellik(detSec.mstAdi, 'bhes.aciklama')
		wh.basiSonu(detSec.grupKod, 'bhes.grupkod').ozellik(detSec.grupAdi, 'bhgrp.aciklama')
		wh.basiSonu(detSec.bankaKod, 'bhes.bankakod').ozellik(detSec.bankaAdi, 'ban.aciklama')
	}
}
