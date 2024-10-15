class DRapor_ESETest extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'ESE' }
	static get kod() { return 'TEST' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_ESETest_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result.addKAPrefix('hasta')
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', maxWidth: 600, filterType: 'checkedlist' })))
			.addToplam(new TabloYapiItem().setKA('TUMSAYI', 'Tüm Sayı').addColDef(new GridKolon({ belirtec: 'tumsayi', text: 'Tüm Sayı', genislikCh: 15, filterType: 'numberinput' }).tipDecimal(1)))
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e); const {raporTanim, secimler} = this, {attrSet} = raporTanim, {maxRow} = e;
		return [
			{ tarih: dateToString(now()), hastakod: '001', hastaadi: 'ÖZER', tumsayi: 10 },
			{ tarih: dateToString(now().dun()), hastakod: '001', hastaadi: 'ÖZER', tumsayi: 20 },
			{ tarih: dateToString(now()), hastakod: '002', hastaadi: 'ALİ', tumsayi: 3 },
			{ tarih: dateToString(now().dun()), hastakod: '002', hastaadi: 'ALİ', tumsayi: 5 },
			{ tarih: dateToString(now().addDays(-2)), hastakod: '002', hastaadi: 'ALİ', tumsayi: 2 }
		]
	}
}

class DRapor_ESETest_CPT extends DRapor_ESETest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainClass() { return DRapor_ESETest_CPT_Main }
	static get kod() { return 'TESTCPT' } static get aciklama() { return 'Test Sonuçları (CPT)' }
}
class DRapor_ESETest_CPT_Main extends DRapor_ESETest_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest_CPT }
}

class DRapor_ESETest_Anket extends DRapor_ESETest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainClass() { return DRapor_ESETest_Anket_Main }
	static get kod() { return 'TESTANKET' } static get aciklama() { return 'Test Sonuçları (Anket)' }
	/* {maxSecenekSayisi} = MQSablonAnketYanit */
}
class DRapor_ESETest_Anket_Main extends DRapor_ESETest_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest_Anket }
}

/* DRapor_ESETest_CPT.goster() */
