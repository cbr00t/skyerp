class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'CARIHAR' } static get aciklama() { return 'Cari Hareketci' }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CariHareketci }
	static get raporClass() { return DRapor_Hareketci_Cari }
	tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e); let {result} = e; this.tabloYapiDuzenle_cari(e) }
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {hvDegeri} = e, kodClause = hvDegeri('must');
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause });
		/*for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} carikod`, 'car.birunvan cariunvan'); wh.icerikKisitDuzenle_cari({ ...e, saha: kodClause }); break }
		}*/
	}
}
