class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQGuidOrtak extends MQGuid {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return asSet([this.kodSaha]) } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQGuidVeAdiOrtak extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus }
	static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQSayacliOrtak extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQDetayliOrtak extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQDetayliMasterOrtak extends MQDetayliMaster {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQDetayliGUIDOrtak extends MQDetayliGUID {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi } static get noAutoFocus() { return MQMasterOrtak.noAutoFocus }
	static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQDetayliVeAdiOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQDetayliGUIDVeAdiOrtak extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get secimSinif() { let {ozelSecimSinif} = MQMasterOrtak; return ozelSecimSinif === undefined ? super.secimSinif : ozelSecimSinif }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return MQMasterOrtak.gonderildiDesteklenirmi }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi }
	static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get degistirilebilirmi() { return MQMasterOrtak.degistirilebilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi }
	static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
}
class MQApiOrtak extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return null } static get secimSinif() { return null }
	static get silinebilirmi() { return false } static get gonderildiDesteklenirmi() { return false }
	static get offlineSahaListe() { return [...super.offlineSahaListe, ...this.orjBaslikListesi.filter(x => !x.sql).map(x => x.belirtec)] }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return MQMasterOrtak.islemTuslariDuzenle_listeEkrani(e) }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await MQMasterOrtak.uiGirisOncesiIslemler(e) }
	static loadServerData(e) {
		e = e ?? {}; const offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode;
		return offlineMode ? super.loadServerDataDogrudan(e) : this.loadServerDataDogrudan(e)
	}
}
