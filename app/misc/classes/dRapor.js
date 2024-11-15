class DRapor_Misc extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'MISC' }
	static get kod() { return 'MISC' } static get aciklama() { return '' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_Misc_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest }
	static get table() { return null } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e) /*; const {result} = e; result.addKAPrefix('doktor', 'hasta', 'ilbolge', 'il', 'yasgrup');
		result
			.addGrup(new TabloYapiItem().setKA('DOKTOR', 'Doktor').setMFSinif(MQDoktor).kodsuz().setOrderBy('doktoradi').addColDef(new GridKolon({ belirtec: 'doktor', text: 'Doktor', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').setMFSinif(MQHasta).kodsuz().setOrderBy('hastaadi').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', filterType: 'checkedlist' })))*/
	}
}
