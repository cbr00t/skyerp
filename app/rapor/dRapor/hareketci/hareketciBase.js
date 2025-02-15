class DRapor_Hareketci extends DRapor_Fis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'HAR' } static get kategoriAdi() { return 'Hareketci' }
}
class DRapor_Hareketci_Main extends DRapor_Fis_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	loadServerData_queryDuzenle(e) { e.alias = e.alias ?? 'hrk'; super.loadServerData_queryDuzenle(e) }
}
