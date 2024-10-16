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
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'fis'; const {secimler} = this, {attrSet} = e;
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
	donemBagla(e) { const {donemBS, tarihSaha, sent} = e; if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
}
