class DRapor_AraSeviye extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return this.name }
}
class DRapor_AraSeviye_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tazeleYapilirmi() { return true }
	secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e, {grupVeToplam} = this.tabloYapi;
		const islemYap = (keys, callSelector, args) => {
			for (const key of keys) {
				const item = key ? grupVeToplam[key] : null; if (item == null) { continue }
				const proc = item[callSelector]; if (proc) { proc.call(item, args) }
			}
		}; islemYap(Object.keys(grupVeToplam), 'secimlerDuzenle', e);
		secimler.whereBlockEkle(_e => {
			islemYap(Object.keys(grupVeToplam) || {}, 'tbWhereClauseDuzenle', { ...e, ..._e })
			/*islemYap(Object.keys(this.raporTanim?.attrSet || {}), 'tbWhereClauseDuzenle', { ...e, ..._e })*/
		})
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e); const {raporTanim, secimler} = this, {attrSet} = raporTanim, {maxRow} = e, {donemBS} = e;
		const _e = { ...e, stm: new MQStm(), attrSet, donemBS }; this.loadServerData_queryDuzenle(_e); this.loadServerData_queryDuzenle_son(_e);
		const query = _e.stm, recs = query ? await app.sqlExecSelect({ query, maxRow }) : null; return recs
	}
	super_loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
	tabloYapiDuzenle_son(e) {
		super.tabloYapiDuzenle_son(e); const {result} = e;
		result.addToplam(new TabloYapiItem().setKA('KAYITSAYISI', 'Kayıt Sayısı').addColDef(new GridKolon({ belirtec: 'kayitsayisi', text: 'Kayıt Sayısı', genislikCh: 10, filterType: 'numberinput', aggregates: ['sum'] }).tipNumerik()))
	}
	loadServerData_queryDuzenle(e) {
		let alias = e.alias = e.alias ?? 'fis'; const {secimler} = this, {stm, attrSet} = e;
		for (const key in attrSet) for (const sent of stm.getSentListe()) { sent.sahalar.add(`COUNT(*) kayitsayisi`) }
		if (secimler) {
			for (const [key, secim] of Object.entries(secimler.liste)) {
				if (secim.isHidden || secim.isDisabled) { continue } const kod = secim.userData?.kod; if (!kod) { continue }
				const uygunmu = typeof secim.value == 'object' ? !$.isEmptyObject(secim.value) : !!secim.value;
				if (uygunmu) { attrSet[kod] = true }
			}
		}
	}
	loadServerData_queryDuzenle_son(e) {
		const {stm, attrSet} = e, {orderBy} = stm, {tabloYapi, secimler} = this, {grup} = tabloYapi;
		const wh = secimler?.getTBWhereClause(e); if (wh?.liste?.length) { for (const sent of stm.getSentListe()) { sent.where.birlestir(wh) } }
		for (const kod in attrSet) { let item = grup[kod], {orderBySaha} = item || {}; if (orderBySaha) { orderBy.add(orderBySaha) } }
	}
	loadServerData_recsDuzenle(e) { return super.loadServerData_recsDuzenle(e) }
	async loadServerData_recsDuzenleSon(e) {
		return await super.loadServerData_recsDuzenleSon(e) /* const {attrSet} = this.raporTanim, {toplam} = this.tabloYapi, avgBelirtec2ColDef = {};
		for (const key in attrSet) {
			if (!toplam[key]) { continue } let avgColDefs = toplam[key]?.colDefs?.filter(colDef => colDef?.aggregates?.includes('avg')); if (!avgColDefs?.length) { continue }
			for (const colDef of avgColDefs) { avgBelirtec2ColDef[colDef.belirtec] = colDef }
		}
		let {recs} = e; if (!$.isEmptyObject(avgBelirtec2ColDef)) {
			for (const rec of recs) {
				let {kayitsayisi: count} = rec; if (!count) { continue }
				for (const key in avgBelirtec2ColDef) {
					let value = rec[key]; if (!(value && typeof value == 'number')) { continue }
					let fra = avgBelirtec2ColDef[key]?.tip?.fra ?? 0;
					rec[key] = value = roundToFra(value / count, fra)
				}
			}
		}
		return recs*/
	}
	donemBagla(e) { const {donemBS, tarihSaha, sent} = e; if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
}
