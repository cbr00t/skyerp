class DRapor_Fis extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Fis_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e); this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e) }
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, alias = e.alias ?? 'fis';
		$.extend(e, { alias, sent }); this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) {
		let {alias} = e; this.loadServerData_queryDuzenle_ozelIsaret({ ...e, kodClause: `${alias}.ozelisaret` });
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: `${alias}.bizsubekod` }).loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'tarih' })
	}
}
