class DRapor_ESETest extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'ESE' }
	static get kod() { return 'TEST' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_ESETest_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest }
	static get table() { return null } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result.addKAPrefix('doktor', 'hasta')
			.addGrup(new TabloYapiItem().setKA('DOKTOR', 'Doktor').setMFSinif(MQDoktor).kodsuz().setOrderBy('doktoradi').addColDef(new GridKolon({ belirtec: 'doktor', text: 'Doktor', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').setMFSinif(MQHasta).kodsuz().setOrderBy('hastaadi').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AKTIFYAS', 'Aktif Yaş').addColDef(new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 25, filterType: 'checkedlist' })))
		
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, sent); this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarihsaat' }); wh.add('fis.btamamlandi <> 0');
		if (attrSet.HASTA || attrSet.DOKTOR) { sent.fromIliski('esemuayene mua', 'fis.muayeneid = mua.id') }
		if (attrSet.HASTA) { sent.fromIliski('esehasta has', 'mua.hastaid = has.id') } if (attrSet.DOKTOR) { sent.fromIliski('esedoktor dok', 'mua.doktorid = dok.id') }
		for (const key in attrSet) {
			switch (key) {
				case 'HASTA': sahalar.add('mua.hastaid hastakod', 'has.aciklama hastaadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esehasta', saha: 'mua.hastaid' }); break
				case 'DOKTOR': sahalar.add('mua.doktorid doktorkod', 'dok.aciklama doktoradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esedoktor', saha: 'mua.doktorid' }); break
				case 'AKTIFYAS': sahalar.add('fis.aktifyas'); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarihsaat' }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
	loadServerData_queryDuzenle_son(e) { const {stm, attrSet} = e, {orderBy} = stm; super.loadServerData_queryDuzenle_son(e) }
	/*async loadServerDataInternal(e) {
		await super.superSuper_loadServerDataInternal(e); const {raporTanim, secimler} = this, {attrSet} = raporTanim, {maxRow} = e;
		return [
			{ tarih: dateToString(now()), hastakod: '001', hastaadi: 'ÖZER', tumsayi: 10 },
			{ tarih: dateToString(now().dun()), hastakod: '001', hastaadi: 'ÖZER', tumsayi: 20 },
			{ tarih: dateToString(now()), hastakod: '002', hastaadi: 'ALİ', tumsayi: 3 },
			{ tarih: dateToString(now().dun()), hastakod: '002', hastaadi: 'ALİ', tumsayi: 5 },
			{ tarih: dateToString(now().addDays(-2)), hastakod: '002', hastaadi: 'ALİ', tumsayi: 2 }
		]
	}*/
	fisVeHareketBagla(e) {
		const {sent} = e, {table, detayVeyaGrupTable} = this.class; sent.fromAdd(`${table} fis`);
		if (detayVeyaGrupTable) { sent.fromIliski(`${detayVeyaGrupTable} har`, `har.fisid = fis.id`) }
		return this
	}
}

class DRapor_ESETest_CPT extends DRapor_ESETest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainClass() { return DRapor_ESETest_CPT_Main }
	static get kod() { return 'TESTCPT' } static get aciklama() { return 'Test Sonuçları (CPT)' }
}
class DRapor_ESETest_CPT_Main extends DRapor_ESETest_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest_CPT }
	static get table() { return 'esecpttest' } static get detayVeyaGrupTable() { return 'esecpttestgrup' }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addToplam(new TabloYapiItem().setKA('TUMSAYI', 'Tüm Sayı').addColDef(new GridKolon({ belirtec: 'tumsayi', text: 'Tüm Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
			/*.addGrup(new TabloYapiItem().setKA('GRUPNO', 'Grup No').addColDef(new GridKolon({ belirtec: 'grupno', text: 'Grup No', genislikCh: 10, filterType: 'checkedlist' }).tipNumerik()))
			  .addToplam(new TabloYapiItem().setKA('GRUPSAYI', 'Grup Sayı').addColDef(new GridKolon({ belirtec: 'grupsayi', text: 'Grup Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))*/
			.addToplam(new TabloYapiItem().setKA('DOGRUSAYI', 'Doğru Sayı').addColDef(new GridKolon({ belirtec: 'dogrusayi', text: 'Doğru Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
			.addToplam(new TabloYapiItem().setKA('ORTDOGRUSECIMSURESN', 'Ort. Doğru Seçim Süre (sn)').addColDef(new GridKolon({ belirtec: 'ortdogrusecimsuresn', text: 'Doğru Sayı', genislikCh: 15, filterType: 'numberinput' }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('YANLISSAYI', 'Yanlış Sayı').addColDef(new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
			.addToplam(new TabloYapiItem().setKA('ORTYANLISSECIMSURESN', 'Ort. Yanlış Seçim Süre (sn)').addColDef(new GridKolon({ belirtec: 'ortyanlissecimsuresn', text: 'Yanlış Sayı', genislikCh: 15, filterType: 'numberinput' }).tipDecimal(1)))
	}
	ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {belirtec, result} = e; switch (belirtec) {
			case 'dogrusayi': case 'ortdogrusecimsuresn': result.push('limegreen'); break
			case 'yanlissayi': case 'ortyanlissecimsuresn': result.push('firebrick'); break
		}
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh, sahalar} = sent;
		for (const key in attrSet) {
			switch (key) {
				case 'TUMSAYI': sahalar.add('fis.tumsayi'); break /*case 'GRUPNO': sahalar.add('fis.grupno'); break; case 'GRUPSAYI': sahalar.add('SUM(fis.grupsayi) grupsayi'); break*/
				case 'DOGRUSAYI': sahalar.add('fis.dogrusayi'); break; case 'YANLISSAYI': sahalar.add('fis.yanlissayi'); break
				case 'ORTDOGRUSECIMSURESN': sahalar.add('(case when fis.dogrusayi = 0 then 0 else ROUND(SUM(fis.dogrusecimsuresn) / SUM(fis.dogrusayi), 1) end) ortdogrusecimsuresn'); break
				case 'ORTYANLISSECIMSURESN': sahalar.add('(case when fis.yanlissayi = 0 then 0 else ROUND(SUM(fis.yanlissecimsuresn) / SUM(fis.yanlissayi), 1) end) ortyanlissecimsuresn'); break
			}
		}
	}
}

class DRapor_ESETest_Anket extends DRapor_ESETest {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainClass() { return DRapor_ESETest_Anket_Main }
	static get kod() { return 'TESTANKET' } static get aciklama() { return 'Test Sonuçları (Anket)' }
}
class DRapor_ESETest_Anket_Main extends DRapor_ESETest_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest_Anket }
	static get table() { return 'eseankettest' } static get detayVeyaGrupTable() { return 'eseankettestdetay' }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {maxSecenekSayisi} = MQSablonAnketYanit;
		result.addGrup(new TabloYapiItem().setKA('SORU', 'Soru').addColDef(new GridKolon({ belirtec: 'soru', text: 'Soru', genislikCh: 50, filterType: 'checkedlist' })));
		for (let i = 1; i <= maxSecenekSayisi; i++) {
			result.addGrup(new TabloYapiItem().setKA(`YANIT${i}`, `Yanit-${i}`).addColDef(new GridKolon({ belirtec: `secenek${i}`, text: `Yanıt-${i}`, filterType: 'checkedlist' }))) }
		for (let i = 1; i <= maxSecenekSayisi; i++) {
			result.addToplam(new TabloYapiItem().setKA(`YANIT${i}SAYI`, `Yanit-${i}  Sayı`).addColDef(new GridKolon({ belirtec: `yanit${i}sayi`, text: `Yanıt-${i} Sayı`, genislikCh: 10, filterType: 'numberinput' }).tipNumerik())) }
		result
			.addToplam(new TabloYapiItem().setKA('TOPLAMPUAN', 'Toplam Puan').addColDef(new GridKolon({ belirtec: 'toplampuan', text: 'Toplam Puan', genislikCh: 10, filterType: 'numberinput' }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('YANITSIZSAYI', 'Yanıtsız Sayı').addColDef(new GridKolon({ belirtec: 'yanitsizsayi', text: 'Yanıtsız Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
	}
	ekCSSDuzenle(e) { super.ekCSSDuzenle(e); const {belirtec, result} = e; switch (belirtec) { case 'yanlissayi': case 'yanitsizsayi': result.push('red'); break } }
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh, sahalar} = sent;
		if (attrSet.SORU) { sent.fromIliski('eseanketsablondetay sdet', 'har.esedetayid = sdet.id') }
		if (Object.keys(attrSet).find(key => key.startsWith('YANIT'))) { sent.fromIliski('eseanketsablon sab', 'fis.esesablonid = sab.id').fromIliski('eseanketyanit ynt', 'sab.yanitid = ynt.id') }
		for (const key in attrSet) {
			switch (key) {
				case 'TOPLAMPUAN': sahalar.add('SUM(fis.toplampuan) toplampuan'); break; case 'YANITSIZSAYI': sahalar.add('SUM(fis.yanitsizsayi) yanitsizsayi'); break
				case 'SORU': sahalar.add('sdet.soru'); break
				default:
					const PrefixYanit = 'YANIT', LiteralSayi = 'SAYI'; if (key.startsWith(PrefixYanit)) {
						let i = asInteger(key.replace(LiteralSayi, '').slice(PrefixYanit.length));
						if (key.endsWith(LiteralSayi)) { sahalar.add(`SUM(case when har.secimindis = ${i} then 1 else 0 end) yanit${i}sayi`) } else { sahalar.add(`ynt.secenek${i}`) }
					}
					break
			}
		}
	}
}

/* DRapor_ESETest_CPT.goster() */
