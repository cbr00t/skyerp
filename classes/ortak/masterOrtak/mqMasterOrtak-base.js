class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get raporKullanilirmi() { return false }
	static get ignoreBelirtecSet() { return {} } static get gonderildiDesteklenirmi() { return false }
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
