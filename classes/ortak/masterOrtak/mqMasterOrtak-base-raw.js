class MQMasterOrtakBase extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return super.tanimUISinif ?? ModelTanimPart }
	static get secimSinif() { return super.secimSinif } static get ozelSecimSinif() { return undefined }
	static get secimSinif() { let {ozelSecimSinif} = this; return ozelSecimSinif === undefined ? super.secimSinif ?? undefined : ozelSecimSinif }
	static get gonderildiDesteklenirmi() { return false } static get raporKullanilirmi() { return false }
	static get kolonFiltreKullanilirmi() { return true } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi } static get degistirilebilirmi() { return super.degistirilebilirmi }
	static get silinebilirmi() { return super.silinebilirmi } static get ignoreBelirtecSet() { return {} }
	
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static standartGorunumListesiDuzenle(e) {
		let {liste} = e, orjBaslikListesi = e.orjBaslikListesi ?? this.orjBaslikListesi
		let kodKullanilirmi = e.kodKullanilirmi ?? this.kodKullanilirmi, kodSaha = e.kodSaha ?? this.kodSaha
		let ignoreBelirtecSet = { ...(e.ignoreBelirtecSet ?? this.ignoreBelirtecSet ?? {}) }
		if (kodSaha && !(config.dev || kodKullanilirmi))
			ignoreBelirtecSet[kodSaha] = true
		let colDefs = orjBaslikListesi.map(colDef => colDef.belirtec).filter(belirtec => !ignoreBelirtecSet[belirtec])
		liste.push(...colDefs)
	}
	static orjBaslikListesi_argsDuzenle({ args, sender }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		$.extend(args, {
			showFilterRow: false, groupsExpandedByDefault: true
			// groupIndentWidth: 30
		})
	}
	static listeEkrani_init(e) {
		super.listeEkrani_init(e)
		let {gridPart = e.sender} = e, {args} = gridPart
		if (args)
			$.extend(gridPart, args)
	}
	static islemTuslariDuzenle_listeEkrani_ilk(e) { return super.islemTuslariDuzenle_listeEkrani_ilk(e) }
	static islemTuslariDuzenle_listeEkrani(e) { return super.islemTuslariDuzenle_listeEkrani(e) }
	static async uiGirisOncesiIslemler(e) { }
	async uiGirisOncesiIslemler(e) { await super.uiGirisOncesiIslemler(e); return await this.class.uiGirisOncesiIslemler(e) }
}
