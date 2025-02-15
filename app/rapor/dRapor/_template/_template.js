class DRapor_Hareketci_X extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
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
		let alias = 'har'; $.extend(e, { sent, alias }); sent.fromAdd(`x ${alias}`);
		if (attrSet.X) { sent.fromIliski('msttable mst', `${alias}.xkod = mst.kod`) }
		this.donemBagla({ ...e, tarihSaha: 'tarih' }); for (const key in attrSet) {
			switch (key) {
				case 'X': sahalar.add(`${alias}.xkod`, 'mst.aciklama xadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'x', saha: `${alias}.xkod` }); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'tarih' })
	}
}
