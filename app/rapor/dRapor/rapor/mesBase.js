class DRapor_MES extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'MES' }
	static get uygunmu() { return app.params.operGenel.kullanim.mesVeriToplama && !!app.sqlTables?.operemri }
}
class DRapor_MES_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e) }
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, {where: wh} = sent;
		$.extend(e, { sent }); this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
}
