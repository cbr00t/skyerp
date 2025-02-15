class DRapor_PDKS extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'PDKS' } static get uygunmu() { return /*app.params.aktarim.kullanim.pdks &&*/ !!app.sqlTables?.pdksveri }
}
class DRapor_PDKS_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, {where: wh} = sent;
		$.extend(e, { sent }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
}
