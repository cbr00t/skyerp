class DRapor_Hareketci_AlimSatisSipOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_AlimSatisSipOrtak }
}
class DRapor_Hareketci_AlimSatisSipOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_AlimSatisSipOrtak }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		let {tip2BrmListe} = MQStokGenelParam
		let {isAdmin, rol} = config.session ?? {}
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT')
		let {toplam} = result, brmListe = keys(tip2BrmListe)
		this.tabloYapiDuzenle_cari(e)
		this.tabloYapiDuzenle_sh(e)
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR', etiket: 'Miktar' })
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR2', etiket: 'Miktar2' })
		if (maliyetGorurmu)
			this.tabloYapiDuzenle_gc({ ...e, tip: 'MALIYET', etiket: 'Maliyet', belirtec: 'tummaliyet' })
		{
			let {ISARETLIBEDEL: item} = toplam
			if (item)
				item.ka.aciklama = item.colDefs[0].text = 'Bedel'
		}
		//{ let {TUMMALIYET: item} = toplam; if (item) { item.ka.aciklama = item.colDefs[0].text = 'Tüm Maliyet' } }
		deleteKeys(toplam, 'BORCBEDEL', 'ALACAKBEDEL', 'BORCBAKIYE', 'ALACAKBAKIYE', 'TUMMALIYET')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, PrefixMiktar = 'MIKTAR', gcClause = hvDegeri('gc'), tarihClause = hvDegeri('tarih');
		/* if (Object.keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true } */
		this.loadServerData_queryDuzenle_sh({ ...e, kodClause: hvDegeri('shkod') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR', clause: hvDegeri('miktar'), gcClause, tarihClause })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR2', clause: hvDegeri('miktar2'), gcClause, tarihClause })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MALIYET', clause: hvDegeri('fmaliyet'), gcClause, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add('stk.brmorani'); break
			}
		}
	}
}
class DRapor_Hareketci_SipSatislar extends DRapor_Hareketci_AlimSatisSipOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satış Siparişler' }
	static get vioAdim() { return 'ST-IR' }
	static get hareketciSinif() { return SatisSipHareketci } 
}
class DRapor_Hareketci_SipSatislar_Main extends DRapor_Hareketci_AlimSatisSipOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_SipSatislar }
}
class DRapor_Hareketci_SipAlimlar extends DRapor_Hareketci_AlimSatisSipOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get vioAdim() { return 'ST-IR' }
	static get hareketciSinif() { return AlimSipHareketci } 
}
class DRapor_Hareketci_SipAlimlar_Main extends DRapor_Hareketci_AlimSatisSipOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_SipAlimlar }
}
