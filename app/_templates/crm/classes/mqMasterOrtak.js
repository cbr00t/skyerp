class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get raporKullanilirmi() { return false } static get ignoreBelirtecSet() { return {} }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) } static get tanimUISinif() { return ModelTanimPart } static get kolonFiltreKullanilirmi() { return false }
	static standartGorunumListesiDuzenle(e) {
		const {liste} = e, orjBaslikListesi = e.orjBaslikListesi ?? this.orjBaslikListesi, kodKullanilirmi = e.kodKullanilirmi ?? this.kodKullanilirmi, kodSaha = e.kodSaha ?? this.kodSaha;
		const ignoreBelirtecSet = { ...(e.ignoreBelirtecSet ?? this.ignoreBelirtecSet ?? {}) };
		if (kodSaha && !(config.dev || kodKullanilirmi)) { ignoreBelirtecSet[kodSaha] = true }
		liste.push(...orjBaslikListesi.map(colDef => colDef.belirtec).filter(belirtec => !ignoreBelirtecSet[belirtec]))
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e;
		$.extend(args, { showFilterRow: false, groupsExpandedByDefault: true, rowsHeight: 40, groupIndentWidth: 30 })
	}
	static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, {args} = gridPart; if (args) { $.extend(gridPart, args) } }
}
class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQGuidOrtak extends MQGuid {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return asSet([this.kodSaha]) }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQGuidVeAdiOrtak extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQSayacliOrtak extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQDetayliOrtak extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQDetayliMasterOrtak extends MQDetayliMaster {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQDetayliGUIDOrtak extends MQDetayliGUID {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQDetayliVeAdiOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
class MQDetayliGUIDVeAdiOrtak extends MQDetayliGUIDVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } static get ignoreBelirtecSet() { return {} }
	static get noAutoFocus() { return MQMasterOrtak.noAutoFocus } static get gridIslemTuslariKullanilirmi() { return MQMasterOrtak.gridIslemTuslariKullanilirmi } static get kolonFiltreKullanilirmi() { return MQMasterOrtak.kolonFiltreKullanilirmi }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { const {orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha} = this; MQMasterOrtak.standartGorunumListesiDuzenle({ ...e, orjBaslikListesi, ignoreBelirtecSet, kodKullanilirmi, kodSaha }) }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
}
