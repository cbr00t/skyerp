class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return this.classKey } static get tanimUISinif() { return ModelTanimPart }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e;
		$.extend(args, {
			rowsHeight: 36, showGroupsHeader: true, showFilterRow: true, autoShowColumnsMenuButton: true,
			showStatusBar: true, showaggregates: true, showgroupaggregates: true
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		liste.push(...this.orjBaslikListesi.map(colDef => colDef.belirtec))
	}
	static gridVeriYuklendi(e) { super.gridVeriYuklendi(e) }
	static async loadServerData(e) {
		e = e || {}; const {localData} = app.params, dataKey = e.dataKey ?? this.dataKey; let recs = localData.getData(dataKey);
		if (recs === undefined) { recs = await this.loadServerDataDogrudan(e); if (recs !== undefined) { localData.setData(dataKey, recs); localData.kaydetDefer() } }
		return recs
	}
	static loadServerDataDogrudan(e) { return null }
}
class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return this.classKey } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e, {kodSaha, adiSaha} = this;
		liste.push(...this.orjBaslikListesi.map(colDef => colDef.belirtec).filter(x => !(x == kodSaha || x == adiSaha)))
	}
	static gridVeriYuklendi(e) { MQMasterOrtak.gridVeriYuklendi(e) }
	static async loadServerData(e) {
		e = e || {}; const {localData} = app.params, dataKey = e.dataKey ?? this.dataKey; let recs = localData.getData(dataKey);
		if (recs === undefined) { recs = await this.loadServerDataDogrudan(e); if (recs !== undefined) { localData.setData(dataKey, recs); localData.kaydetDefer() } }
		return recs
	}
	static loadServerDataDogrudan(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataDogrudan(e) }
	static loadServerDataFromMustBilgi(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataFromMustBilgi(e) }
}
class MQDetayliOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return this.classKey } static get tanimUISinif() { return MQMasterOrtak.tanimUISinif }
	static get tanimlanabilirmi() { return MQMasterOrtak.tanimlanabilirmi } static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	constructor(e) { e = e || {}; super(e); this.detaylar = e.detaylar || [] }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e, {kodSaha, adiSaha} = this;
		liste.push(...this.orjBaslikListesi.map(colDef => colDef.belirtec).filter(x => !(x == kodSaha || x == adiSaha)))
	}
	static gridVeriYuklendi(e) { MQMasterOrtak.gridVeriYuklendi(e) }
	static async loadServerData(e) {
		e = e || {}; const {localData} = app.params, dataKey = e.dataKey ?? this.dataKey; let recs = localData.getData(dataKey);
		if (recs === undefined) { recs = await this.loadServerDataDogrudan(e); if (recs !== undefined) { localData.setData(dataKey, recs); localData.kaydetDefer() } }
		return recs
	}
	static loadServerDataDogrudan(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataDogrudan(e) }
	static loadServerDataFromMustBilgi(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataFromMustBilgi(e) }
	setValues(e) { super.setValues(e); const {rec} = e, {detaylar} = rec; if (detaylar != null) { this.detaylar = detaylar } }
	addDetay(...liste) {
		const {detaylar} = this;
		if (liste) { for (const item of liste) { if (item == null) continue; if ($.isArray(item)) detaylar.push(...item); else detaylar.push(item) } }
		return this
	}
	addDetaylar(liste) { return this.addDetay(liste) }
	detaylarReset() { this.detaylar = []; return this }
	shallowCopy(e) {
		const inst = super.shallowCopy(e); let {detaylar} = inst;
		if (detaylar) { detaylar = inst.detaylar = detaylar.map(det => det ? (det.shallowCopy ? det.shallowCopy(e) : $.extend(true, {}, det)) : det) }
		return inst
	}
	deepCopy(e) {
		const inst = super.deepCopy(e); let {detaylar} = inst;
		if (detaylar) { detaylar = inst.detaylar = detaylar.map(det => det ? (det.deepCopy ? det.deepCopy(e) : $.extend(true, {}, det)) : det) }
		return inst
	}
}
