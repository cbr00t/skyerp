class DRapor_Hareketci_X extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return false }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'HAR_X' } static get aciklama() { return 'X' }
}
class DRapor_Hareketci_X_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Hareketci_X }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('x')
			.addGrup(new TabloYapiItem().setKA('X', 'X').secimKullanilir().setMFSinif(null).addColDef(
				new GridKolon({ belirtec: 'x', text: 'X', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))	
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, {sent} = stm, {sahalar, where: wh} = sent;
		if (attrSet.X) { sent.fromIliski('msttable mst', 'fis.xkod = mst.kod') }
		for (const key in attrSet) {
			switch (key) {
				case 'X': sahalar.add('fis.xkod', 'mst.aciklama xadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'x', saha: 'fis.xkod' }); break
			}
		}
	}
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); e.sent.fromAdd('x fis') }
}
