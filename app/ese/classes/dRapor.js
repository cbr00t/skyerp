class DRapor_ESETest extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'ESE' }
	static get kod() { return 'TEST' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_ESETest_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest }
	static get table() { return null } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result.addKAPrefix('doktor', 'hasta', 'ilbolge', 'il')
			.addGrup(new TabloYapiItem().setKA('DOKTOR', 'Doktor').setMFSinif(MQDoktor).kodsuz().setOrderBy('doktoradi').addColDef(new GridKolon({ belirtec: 'doktor', text: 'Doktor', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').setMFSinif(MQHasta).kodsuz().setOrderBy('hastaadi').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('ILBOLGE', 'İl Bölgesi').setMFSinif(MQIlBolge).addColDef(new GridKolon({ belirtec: 'ilbolge', text: 'İl Bölgesi', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('IL', 'İl').setMFSinif(MQCariIl).addColDef(new GridKolon({ belirtec: 'il', text: 'İl', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CINSIYET', 'Cinsiyet').addColDef(new GridKolon({ belirtec: 'cinsiyet', text: 'Cinsiyet', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AKTIFYAS', 'Aktif Yaş').addColDef(new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 25, filterType: 'checkedlist' }).tipNumerik()))
			.addGrup(new TabloYapiItem().setKA('YASGRUP', 'Yaş Grubu').noOrderBy().addColDef(new GridKolon({ belirtec: 'yasgrupadi', text: 'Yaş Grubu', genislikCh: 25, filterType: 'checkedlist' }).tipNumerik()))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e, alias ='fis'; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: `${alias}.tarihsaat` }); wh.add(`${alias}.btamamlandi <> 0`);
		if (attrSet.DOKTOR) { sent.leftJoin({ alias, from: 'esemuayene mua', on: 'fis.muayeneid = mua.id' }).leftJoin({ alias, from: 'esedoktor dok', on: 'mua.doktorid = dok.id' }) }
		if (attrSet.HASTA || attrSet.IL || attrSet.ILBOLGE || attrSet.CINSIYET) { sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` }) }
		if (attrSet.IL || attrSet.ILBOLGE) {
			sent.leftJoin({ alias: 'has', from: 'eseyerlesim yer', on: 'has.yerlesimkod = yer.kod' }).leftJoin({ alias: 'yer', from: 'caril il', on: 'yer.ilkod = il.kod' }) }
		for (const key in attrSet) {
			switch (key) {
				case 'HASTA': sahalar.add('fis.hastaid hastakod', 'has.aciklama hastaadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esehasta', saha: `${alias}.hastaid` }); break
				case 'DOKTOR': sahalar.add('mua.doktorid doktorkod', 'dok.aciklama doktoradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esedoktor', saha: `mua.doktorid` }); break
				case 'ILBOLGE': sent.leftJoin({ alias: 'il', from: 'eseilbolge ibol', on: 'il.ilbolgekod = ibol.kod' }); sahalar.add('il.ilbolgekod', 'ibol.aciklama ilbolgeadi'); break;
				case 'IL': sahalar.add('il.kod ilkod', 'il.aciklama iladi'); break;
				case 'CINSIYET': sahalar.add(`${Cinsiyet.getClause(`${alias}.cinsiyet`)} cinsiyet`); break;
				case 'AKTIFYAS': case 'YASGRUP': sahalar.add(`${alias}.aktifyas`); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarihsaat' }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
	loadServerData_queryDuzenle_son(e) { const {stm, attrSet} = e, {orderBy} = stm; super.loadServerData_queryDuzenle_son(e) }
	async loadServerData_recsDuzenle(e) {
		await super.loadServerData_recsDuzenle(e); const {attrSet} = this.raporTanim, {recs} = e;
		if (attrSet.YASGRUP) {
			let {_yasGrupRecs: yasGrupRecs} = this; if (!yasGrupRecs) {
				let sent = new MQSent({ from: 'eseyasgrup', sahalar: ['id', 'aciklama', 'yasbasi basi', 'yassonu sonu'] });
				yasGrupRecs = this._yasGrupRecs = await app.sqlExecSelect(sent)
			}
			for (const rec of recs) {
				const {aktifyas: aktifYas} = rec, yasGrupRec = yasGrupRecs.find(_rec => (!_rec.basi || aktifYas >= _rec.basi) && (!_rec.sonu || aktifYas <= _rec.sonu));
				if (yasGrupRec) { $.extend(rec, { yasgrupid: yasGrupRec.id, yasgrupadi: yasGrupRec.aciklama }) }
			}
		}
	}
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
		const {sent} = e, alias = 'fis', {table, detayVeyaGrupTable} = this.class; sent.fromAdd(`${table} fis`);
		if (detayVeyaGrupTable) { sent.leftJoin({ alias, from: `${detayVeyaGrupTable} har`, iliski: `har.fisid = fis.id` }) }
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
			.addToplam(new TabloYapiItem().setKA('ORTDOGRUSECIMSUREMS', 'Ort. Doğru Seçim Süre (ms)').addColDef(new GridKolon({ belirtec: 'dogrusecimsurems', text: 'Doğru Sayı', genislikCh: 15, filterType: 'numberinput' }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('YANLISSAYI', 'Yanlış Sayı').addColDef(new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
			.addToplam(new TabloYapiItem().setKA('ORTYANLISSECIMSUREMS', 'Ort. Yanlış Seçim Süre (ms)').addColDef(new GridKolon({ belirtec: 'yanlissecimsurems', text: 'Yanlış Sayı', genislikCh: 15, filterType: 'numberinput' }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('SECILMEYENDOGRUSAYI', 'Seçilmeyen Doğru Sayı').addColDef(new GridKolon({ belirtec: 'secilmeyendogrusayi', text: 'Seçilmeyen Doğru', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
	}
	ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {belirtec, result} = e; switch (belirtec) {
			case 'dogrusayi': case 'dogrusecimsurems': result.push('limegreen'); break
			case 'yanlissayi': case 'yanlissecimsurems': result.push('firebrick'); break
		}
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh, sahalar} = sent;
		for (const key in attrSet) {
			switch (key) {
				case 'TUMSAYI': sahalar.add('AVG(fis.tumsayi) tumsayi'); break /*case 'GRUPNO': sahalar.add('fis.grupno'); break; case 'GRUPSAYI': sahalar.add('SUM(fis.grupsayi) grupsayi'); break*/
				case 'DOGRUSAYI': sahalar.add('AVG(fis.dogrusayi) dogrusayi'); break; case 'YANLISSAYI': sahalar.add('AVG(fis.yanlissayi) yanlissayi'); break
				case 'SECILMEYENDOGRUSAYI': sahalar.add('AVG(fis.secilmeyendogrusayi) secilmeyendogrusayi'); break
				case 'ORTDOGRUSECIMSUREMS': sahalar.add('AVG(fis.dogrusecimsurems) dogrusecimsurems'); break
				case 'ORTYANLISSECIMSUREMS': sahalar.add('AVG(fis.yanlissecimsurems) yanlissecimsurems'); break
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
		result
			.addToplam(new TabloYapiItem().setKA('YANITSIZSAYI', 'Yanıtsız Sayı').addColDef(new GridKolon({ belirtec: 'yanitsizsayi', text: 'Yanıtsız Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
			.addToplam(new TabloYapiItem().setKA('TOPLAMPUAN', 'Toplam Puan').addColDef(new GridKolon({ belirtec: 'toplampuan', text: 'Toplam Puan', genislikCh: 10, filterType: 'numberinput' }).tipDecimal(1)));
		for (let i = 1; i <= maxSecenekSayisi; i++) {
			result
				.addToplam(new TabloYapiItem().setKA(`YANIT${i}SAYI`, `Yanit-${i} Sayı`).addColDef(new GridKolon({ belirtec: `yanit${i}sayi`, text: `Yanıt-${i} Sayı`, genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))
				.addToplam(new TabloYapiItem().setKA(`YANIT${i}PUAN`, `Yanit-${i} Puan`).addColDef(new GridKolon({ belirtec: `yanit${i}puan`, text: `Yanıt-${i} Puan`, genislikCh: 10, filterType: 'numberinput' }).tipDecimal(1)))
		}
	}
	ekCSSDuzenle(e) { super.ekCSSDuzenle(e); const {belirtec, result} = e; switch (belirtec) { case 'yanlissayi': case 'yanitsizsayi': result.push('red'); break } }
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); const {stm, attrSet} = e, alias = 'fis'; let {sent} = stm, {where: wh, sahalar} = sent;
		if (attrSet.SORU) { sent.leftJoin({ alias, from: 'eseanketsablondetay sdet', on: 'har.esedetayid = sdet.id' }) }
		if (Object.keys(attrSet).find(key => key.startsWith('YANIT'))) {
			sent.leftJoin({ alias, from: 'eseanketsablon sab', on: 'fis.esesablonid = sab.id' }).leftJoin({ alias, from: 'eseanketyanit ynt', on: 'sab.yanitid = ynt.id' }) }
		for (const key in attrSet) {
			switch (key) {
				case 'TOPLAMPUAN': sahalar.add('SUM(fis.toplampuan) toplampuan'); break; case 'YANITSIZSAYI': sahalar.add('SUM(fis.yanitsizsayi) yanitsizsayi'); break
				case 'SORU': sahalar.add('sdet.soru'); break
				default:
					const PrefixYanit = 'YANIT', LiteralSayi = 'SAYI', LiteralPuan = 'PUAN'; if (key.startsWith(PrefixYanit)) {
						let i = asInteger(key.replace(LiteralSayi, '').replace(LiteralPuan, '').slice(PrefixYanit.length));
						if (i && key.endsWith(LiteralSayi)) { sahalar.add(`SUM(fis.yanit${i}sayi) yanit${i}sayi`) }
						else if (i && key.endsWith(LiteralPuan)) { sahalar.add(`SUM(fis.yanit${i}puan) yanit${i}puan`) }
						else { sahalar.add(`ynt.secenek${i}`) }
					}
					break
			}
		}
	}
}

/* DRapor_ESETest_CPT.goster() */
