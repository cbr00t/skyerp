class BankaOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 2 }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('banhesapkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.sahalar.add(`bhes.aciklama ${mstAdiAlias}`))
	}
	uniOrtakSonIslem({ sender, hv, sent }) {
		super.uniOrtakSonIslem(...arguments); let {from, where: wh} = sent;
		if (!from.aliasIcinTable('bhes')) { sent.x2BankaHesapBagla({ kodClause: hv.banhesapkod }) }
		/* if (from.aliasIcinTable('ban')) { wh.add(`ban.calismadurumu <> ''`) } */
		wh.add(`bhes.calismadurumu <> ''`)
	}
	static varsayilanHVDuzenle_ortak({ hv }) {
		super.varsayilanHVDuzenle_ortak(...arguments);
		$.extend(hv, { finanalizkullanilmaz: 'bhes.finanalizkullanilmaz' })
	}
	static varsayilanHVDuzenle({ hv }) {
		super.varsayilanHVDuzenle(...arguments);
		$.extend(hv, { dvkod: 'bhes.dvtipi' })
	}
}
