class PratikSatisHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 170 } static get sadeceTotalmi() { return true }
	static get uygunmu() { return app.params.aktarim?.kullanim?.pratikSatis }
	// static get kategoriKod() { return '' } static get kategoriAdi() { return '' }
	static get kisaKod() { return 'PR' } static get kod() { return 'PRASATIS' } static get aciklama() { return 'Pratik Satış' }
	static get maliTabloIcinUygunmu() { return false } static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }

	static getAltTipAdiVeOncelikClause({ hv }) {
		return {}
	}
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		result.set('stokkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`stkmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`)
				.add(`${mstAlias}.aciklama ${mstAdiAlias}`)
		)
	}
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['pratikSatis', 'Pratik Satış']))
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from, where: wh } }) {
		super.uniOrtakSonIslem(...arguments)
		sent.fromAdd('stkmst stk')
	}
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		extend(hv, {
			bizsubekod: 'emr.bizsubekod'
		})
	}
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_pratikSatis(e)
    }
    uniDuzenle_pratikSatis({ uygunluk, liste }) {
		$.extend(liste, {
			pratikSatis: [new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => { })
				.hvDuzenleIslemi(({ hv }) => {
					extend(hv, { kayittipi: `'PratikSatis'`, isladi: `'Pratik Satış'` })
				})
			]
		})
        return this
    }
}
