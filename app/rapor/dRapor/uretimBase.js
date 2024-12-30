class DRapor_Uretim extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'URETIM' } static get uygunmu() { return app.params.ticariGenel.kullanim.uretim }
}
class DRapor_Uretim_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e) }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('tezgah', 'per', 'stok', 'op')
			.addGrup(new TabloYapiItem().setKA('HAT', 'Hat').secimKullanilir().setMFSinif(DMQHat).addColDef(new GridKolon({ belirtec: 'hat', text: 'Hat', minWidth: 150, maxWidth: 350, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TEZGAH', 'Tezgah').secimKullanilir().setMFSinif(DMQTezgah).addColDef(new GridKolon({ belirtec: 'tezgah', text: 'Tezgah', minWidth: 230, maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('PER', 'Personel').secimKullanilir().setMFSinif(DMQPersonel).addColDef(new GridKolon({ belirtec: 'per', text: 'Personel', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STOK', 'Ürün').secimKullanilir().setMFSinif(DMQStok).addColDef(new GridKolon({ belirtec: 'stok', text: 'Ürün', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('EMIR', 'Emir No').secimKullanilir().addColDef(new GridKolon({ belirtec: 'fisnox', text: 'Emir', maxWidth: 380, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('OPER', 'Operasyon').secimKullanilir().setMFSinif(DMQOperasyon).addColDef(new GridKolon({ belirtec: 'op', text: 'Operasyon', minWidth: 210, maxWidth: 300, filterType: 'checkedlist' })))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, {where: wh} = sent;
		$.extend(e, { sent }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) {
		let {stm, attrSet, alias} = e; for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent }); this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent });
			if (attrSet.STOK) { this.loadServerData_queryDuzenle_formulBagla({ ...e, sent }) }
			for (const key in attrSet) {
				switch (key) {
					case 'HAT': sent.fromIliski('ismerkezi hat', 'tez.ismrkkod = hat.kod'); sahalar.add('hat.kod hatkod', 'hat.aciklama hatadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'hat', saha: 'hat.kod' }); break
					case 'TEZGAH': sahalar.add('tez.kod tezgahkod', 'tez.aciklama tezgahadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'tezgah', saha: 'tez.kod' }); break
					case 'PER': sent.fromIliski('personel per', 'ger.perkod = per.kod'); sahalar.add('per.kod perkod', 'per.aciklama peradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'personel', saha: 'per.kod' }); break
					case 'STOK': sent.fromIliski('stkmst stk', 'frm.formul = stk.kod'); sahalar.add('stk.kod stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'stk.kod' }); break
					case 'EMIR': sahalar.add('emr.fisnox'); break
					case 'OPER': sent.fromIliski('operasyon op', 'oem.opno = op.opno'); sahalar.add('op.opno opkod', 'op.aciklama opadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'operasyon', saha: 'op.opno' }); break
				}
			}
		}
	}
	loadServerData_queryDuzenle_uretimOrtakBagla(e) { return this.loadServerData_queryDuzenle_emirEkle(e).loadServerData_queryDuzenle_emirDetayVeOEMBagla(e) }
	loadServerData_queryDuzenle_emirEkle(e) { let {stm} = e, sent = e.sent ?? stm.sent; sent.fromAdd('isemri emr'); return this }
	loadServerData_queryDuzenle_emirDetayVeOEMBagla(e) { let {stm} = e, sent = e.sent ?? stm.sent; sent.fromIliski('emirdetay edet', 'edet.fissayac = emr.kaysayac').fromIliski('operemri oem', 'oem.emirdetaysayac = edet.kaysayac'); return this }
	loadServerData_queryDuzenle_gerDetayBagla(e) { let {stm} = e, sent = e.sent ?? stm.sent; sent.fromIliski('opergerdetay ger', 'ger.fissayac = oem.kaysayac'); return this }
	loadServerData_queryDuzenle_formulBagla(e) { let {stm} = e, sent = e.sent ?? stm.sent; sent.fromIliski('urtfrm frm', 'frm.kaysayac = edet.formulsayac'); return this }
	loadServerData_queryDuzenle_duraksamaBagla(e) { let {stm} = e, sent = e.sent ?? stm.sent; sent.fromIliski('makduraksama mdur', 'mdur.opergersayac = ger.kaysayac'); return this }
}
