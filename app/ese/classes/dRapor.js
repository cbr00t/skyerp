class DRapor_ESETest extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'ESE' }
	static get kod() { return 'TEST' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_ESETest_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest }
	static get table() { return null } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result.addKAPrefix('doktor', 'hasta', 'ilbolge', 'il', 'yasgrup');
		if (config.dev) { result.addGrup(new TabloYapiItem().setKA('TESTID', 'Test ID').setMFSinif(MQTest).kodsuz().setOrderBy('testid').addColDef(new GridKolon({ belirtec: 'testid', text: 'Test ID', filterType: 'input' }))) }
		result
			.addGrup(new TabloYapiItem().setKA('DOKTOR', 'Doktor').setMFSinif(MQDoktor).kodsuz().setOrderBy('doktoradi').addColDef(new GridKolon({ belirtec: 'doktor', text: 'Doktor', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').setMFSinif(MQHasta).kodsuz().setOrderBy('hastaadi').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('ILBOLGE', 'İl Bölgesi').setMFSinif(MQIlBolge).addColDef(new GridKolon({ belirtec: 'ilbolge', text: 'İl Bölgesi', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('IL', 'İl').setMFSinif(MQCariIl).addColDef(new GridKolon({ belirtec: 'il', text: 'İl', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CINSIYET', 'Cinsiyet').addColDef(new GridKolon({ belirtec: 'cinsiyet', text: 'Cinsiyet', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AKTIFYAS', 'Aktif Yaş').addColDef(new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 25, filterType: 'checkedlist' }).tipNumerik()))
			.addGrup(new TabloYapiItem().setKA('YASGRUP', 'Yaş Grubu').kodsuz().setMFSinif(MQYasGrup).addColDef(new GridKolon({ belirtec: 'yasgrup', text: 'Yaş Grubu', genislikCh: 25, filterType: 'checkedlist' })))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e, alias ='fis'; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: `${alias}.tarihsaat` }); wh.add(`${alias}.btamamlandi <> 0`);
		if (attrSet.DOKTOR) { sent.leftJoin({ alias, from: 'esemuayene mua', on: 'fis.muayeneid = mua.id' }).leftJoin({ alias, from: 'esedoktor dok', on: 'mua.doktorid = dok.id' }) }
		if (attrSet.HASTA || attrSet.IL || attrSet.ILBOLGE || attrSet.CINSIYET) { sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` }) }
		if (attrSet.IL || attrSet.ILBOLGE) {
			sent.leftJoin({ alias: 'has', from: 'eseyerlesim yer', on: 'has.yerlesimkod = yer.kod' }).leftJoin({ alias: 'yer', from: 'caril il', on: 'yer.ilkod = il.kod' }) }
		if (attrSet.YASGRUP) {
			sent.leftJoin({ alias, from: 'eseyasgrup ygrp', on: [`(ygrp.yasbasi = 0 or ${alias}.aktifyas >= ygrp.yasbasi)`, `(ygrp.yassonu = 0 or ${alias}.aktifyas <= ygrp.yassonu)`] }) }
		for (const key in attrSet) {
			switch (key) {
				case 'TESTID': sahalar.add('fis.id testid'); break
				case 'HASTA': sahalar.add('fis.hastaid hastakod', 'has.aciklama hastaadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esehasta', saha: `${alias}.hastaid` }); break
				case 'DOKTOR': sahalar.add('mua.doktorid doktorkod', 'dok.aciklama doktoradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esedoktor', saha: `mua.doktorid` }); break
				case 'ILBOLGE': sent.leftJoin({ alias: 'il', from: 'eseilbolge ibol', on: 'il.ilbolgekod = ibol.kod' }); sahalar.add('il.ilbolgekod', 'ibol.aciklama ilbolgeadi'); break
				case 'IL': sahalar.add('il.kod ilkod', 'il.aciklama iladi'); break
				case 'CINSIYET': sahalar.add(`${Cinsiyet.getClause(`${alias}.cinsiyet`)} cinsiyet`); break
				case 'AKTIFYAS': sahalar.add(`${alias}.aktifyas`); break
				case 'YASGRUP': sahalar.add('ygrp.id yasgrupkod', 'ygrp.aciklama yasgrupadi'); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarihsaat' }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
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
			.addToplam(
				new TabloYapiItem().setKA('TUMSAYI', 'Tüm Sayı').hidden()
					.addColDef(new GridKolon({ belirtec: 'tumsayi', text: 'Tüm Sayı', genislikCh: 10, filterType: 'numberinput',
						/*aggregates: ['avg'] aggregates: [{ 'xyz': ((total, value, belirtec, gridRec, _) => roundToFra(value * 100 / grandTotal, 0)) }]*/
					}).tipDecimal(1)))
			.addToplam(
				new TabloYapiItem().setKA('ORTTUMSAYI', 'Ort. Tüm Sayı')
					.setFormul(['TUMSAYI'], ({ rec }) => roundToFra1(rec.tumsayi / rec.kayitsayisi))
					.addColDef(new GridKolon({ belirtec: 'orttumsayi', text: 'Ort. Tüm Sayı', genislikCh: 10, filterType: 'numberinput',
						/*aggregates: ['avg'] aggregates: [{ 'xyz': ((total, value, belirtec, gridRec, _) => roundToFra(value * 100 / grandTotal, 0)) }]*/
					}).tipDecimal(1)))
			/*.addToplam(new TabloYapiItem().setKA('XSAYI', 'X Sayı')
				.addColDef(new GridKolon({ belirtec: 'xsayi', text: 'X Sayı', genislikCh: 10, filterType: 'numberinput' }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('ORTSAYI', 'Ort. Sayı')
				.setFormul(['XSAYI', 'KAYITSAYISI'], ({ rec }) => roundToFra1(rec.xsayi / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortsayi', text: 'Ort. Sayı', genislikCh: 10, filterType: 'numberinput' }).tipDecimal(1)))*/
			/*.addGrup(new TabloYapiItem().setKA('GRUPNO', 'Grup No').addColDef(new GridKolon({ belirtec: 'grupno', text: 'Grup No', genislikCh: 10, filterType: 'checkedlist' }).tipNumerik()))
			  .addToplam(new TabloYapiItem().setKA('GRUPSAYI', 'Grup Sayı').addColDef(new GridKolon({ belirtec: 'grupsayi', text: 'Grup Sayı', genislikCh: 10, filterType: 'numberinput' }).tipNumerik()))*/
			.addToplam(new TabloYapiItem().setKA('DOGRUSAYI', 'Doğru Sayı').hidden()
				.addColDef(new GridKolon({ belirtec: 'dogrusayi', text: 'Doğru Sayı', genislikCh: 10, filterType: 'numberinput' /*, aggregates: ['avg']*/ }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('ORTDOGRUSAYI', 'Ort. Doğru Sayı')
				.setFormul(['DOGRUSAYI'], ({ rec }) => roundToFra1(rec.dogrusayi / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortdogrusayi', text: 'Ort. Doğru Sayı', genislikCh: 10, filterType: 'numberinput' /*, aggregates: ['avg']*/ }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('YANLISSAYI', 'Yanlış Sayı').hidden()
			   .addColDef(new GridKolon({ belirtec: 'yanlissayi', text: 'Yanlış Sayı', genislikCh: 10, filterType: 'numberinput' /*, aggregates: ['avg'] */ }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('ORTYANLISSAYI', 'Ort. Yanlış Sayı')
				.setFormul(['YANLISSAYI'], ({ rec }) => roundToFra1(rec.yanlissayi / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortyanlissayi', text: 'Ort. Yanlış Sayı', genislikCh: 10, filterType: 'numberinput' /*, aggregates: ['avg']*/ }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('SECILMEYENDOGRUSAYI', 'Seçilmeyen Doğru').hidden()
				.addColDef(new GridKolon({ belirtec: 'secilmeyendogrusayi', text: 'Seçilmeyen Doğru', genislikCh: 10, filterType: 'numberinput', /* aggregates: ['avg'] */ }).tipDecimal(1)))
			.addToplam(new TabloYapiItem().setKA('ORTSECILMEYENDOGRUSAYI', 'Ort. Seçilmeyen Doğru')
				.setFormul(['SECILMEYENDOGRUSAYI'], ({ rec }) => roundToFra1(rec.secilmeyendogrusayi / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortsecilmeyendogrusayi', text: 'Ort. Seçilmeyen Doğru', genislikCh: 15, filterType: 'numberinput', /* aggregates: ['avg']] */ }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('DOGRUSECIMSUREMS', 'Doğru Seçim Süre (ms)').hidden()
				.addColDef(new GridKolon({ belirtec: 'dogrusecimsurems', text: 'Doğru Seçim (ms)', genislikCh: 15, filterType: 'numberinput', /* aggregates: ['avg']] */ }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('ORTDOGRUSECIMSUREMS', 'Ort. Doğru Seçim Süre (ms)')
				.setFormul(['DOGRUSECIMSUREMS'], ({ rec }) => roundToFra1(rec.dogrusecimsurems / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortdogrusecimsurems', text: 'Ort. Doğru Seçim (ms)', genislikCh: 15, filterType: 'numberinput', /* aggregates: ['avg']] */ }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('YANLISSECIMSUREMS', 'Yanlış Seçim Süre (ms)').hidden()
				.addColDef(new GridKolon({ belirtec: 'yanlissecimsurems', text: 'Yanlış Seçim (ms)', genislikCh: 15, filterType: 'numberinput', /* aggregates: ['avg']] */ }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('ORTYANLISSECIMSUREMS', 'Ort. Yanlış Seçim Süre (ms)')
				.setFormul(['YANLISSECIMSUREMS'], ({ rec }) => roundToFra1(rec.yanlissecimsurems / rec.kayitsayisi))
				.addColDef(new GridKolon({ belirtec: 'ortyanlissecimsurems', text: 'Ort. Doğru Seçim (ms)', genislikCh: 15, filterType: 'numberinput', /* aggregates: ['avg']] */ }).tipDecimal()))
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
				case 'TUMSAYI': sahalar.add('SUM(fis.tumsayi) tumsayi'); break
				case 'XSAYI': sahalar.add('SUM(fis.tumsayi) xsayi'); break
				case 'DOGRUSAYI': sahalar.add('SUM(fis.dogrusayi) dogrusayi'); break; case 'YANLISSAYI': sahalar.add('SUM(fis.yanlissayi) yanlissayi'); break
				case 'SECILMEYENDOGRUSAYI': sahalar.add('SUM(fis.secilmeyendogrusayi) secilmeyendogrusayi'); break
				case 'ORTDOGRUSECIMSUREMS': sahalar.add('SUM(fis.dogrusecimsurems) dogrusecimsurems'); break
				case 'ORTYANLISSECIMSUREMS': sahalar.add('SUM(fis.yanlissecimsurems) yanlissecimsurems'); break
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
			.addToplam(new TabloYapiItem().setKA('YANITSIZSAYI', 'Yanıtsız Sayı').addColDef(new GridKolon({ belirtec: 'yanitsizsayi', text: 'Yanıtsız Sayı', genislikCh: 10, filterType: 'numberinput', aggregates: ['avg'] }).tipNumerik()))
			.addToplam(new TabloYapiItem().setKA('TOPLAMPUAN', 'Toplam Puan').addColDef(new GridKolon({ belirtec: 'toplampuan', text: 'Toplam Puan', genislikCh: 10, filterType: 'numberinput', aggregates: ['avg'] }).tipDecimal(1)));
		for (let i = 1; i <= maxSecenekSayisi; i++) {
			result
				.addToplam(new TabloYapiItem().setKA(`YANIT${i}SAYI`, `Yanit-${i} Sayı`).addColDef(new GridKolon({ belirtec: `yanit${i}sayi`, text: `Yanıt-${i} Sayı`, genislikCh: 10, filterType: 'numberinput', aggregates: ['avg'] }).tipNumerik()))
				.addToplam(new TabloYapiItem().setKA(`YANIT${i}PUAN`, `Yanit-${i} Puan`).addColDef(new GridKolon({ belirtec: `yanit${i}puan`, text: `Yanıt-${i} Puan`, genislikCh: 10, filterType: 'numberinput', aggregates: ['avg'] }).tipDecimal(1)))
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
