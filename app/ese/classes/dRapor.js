class DRapor_ESETest extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'ESE' }
	static get kod() { return 'TEST' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return DRapor_ESETest_Main }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_ESETest_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_ESETest }
	static get table() { return 'esetest' } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	onInit(e) {
		super.onInit(e); let {yatayTip2Bilgi} = DRapor_AraSeviye_Main;
		$.extend(yatayTip2Bilgi, {
			YG: { kod: 'YASGRUP', belirtec: 'yasgrup', text: 'Yaş Grubu' },
			YS: { kod: 'AKTIFYAS', belirtec: 'aktifyas', text: 'Aktif Yaş' },
			CN: { kod: 'CINSIYET', belirtec: 'cinsiyet', text: 'Cinsiyet' },
			DT: { kod: 'DOKTOR', belirtec: 'doktor', text: 'Doktor' },
			HS: { kod: 'HASTA', belirtec: 'hasta', text: 'Hasta' }
		})
		$.extend(DRapor_AraSeviye_Main, { yatayTip2Bilgi })
	}
	ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {belirtec, result} = e; switch (belirtec) {
			case 'dogrusayi': case 'dogrusecimsurems': result.push('limegreen'); break
			case 'yanlissayi': case 'yanlissecimsurems': case 'secilmeyendogrusayi': result.push('firebrick'); break
		}
	}
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {maxSecenekSayisi} = MQSablonAnketYanit;
		result.addKAPrefix('doktor', 'hasta', 'ilbolge', 'il', 'yasgrup');
		if (config.dev) {
			result.addGrup(new TabloYapiItem().setKA('TESTID', 'Test ID').setMFSinif(MQTest).kodsuz().setOrderBy('testid')
			   .addColDef(new GridKolon({ belirtec: 'testid', text: 'Test ID', filterType: 'input' })))
		}
		result
			.addGrupBasit('DOKTOR', 'Doktor', 'doktor', MQDoktor, null, ({ item }) => item.kodsuz(), 'doktoradi')
			.addGrupBasit('HASTA', 'Hasta', 'hasta', MQHasta, null, ({ item }) => item.kodsuz(), 'hastaadi')
			.addGrupBasit('ILBOLGE', 'İl Bölgesi', 'ilbolge', MQIlBolge)
			.addGrupBasit('IL', 'İl', 'il', MQCariIl)
			.addGrupBasit('CINSIYET', 'Cinsiyet', 'cinsiyet')
			.addGrupBasit('AKTIFYAS', 'Aktif Yaş', 'aktifyas', null, null, ({ colDef }) => colDef.tipNumerik())
			.addGrupBasit('YASGRUP', 'Yaş Grubu', 'yasgrup', MQYasGrup, null, ({ item }) => item.kodsuz(), 'yasgrupadi')
			.addGrupBasit('DEHBVARMI', 'DEHB?', 'dehbvarmi', null, null, ({ colDef }) => colDef.tipBool(), false)
		result
			.addToplamBasit('DEHBVARSAYI', 'DEHB Var Sayı', 'dehbvarsayi')
			.addToplamBasit('DEHBYOKSAYI', 'DEHB Yok Sayı', 'dehbyoksayi')
			.addToplamBasit('DOGRUSAYI', 'Doğru Sayı', 'dogrusayi', null, ({ colDef, item }) => { colDef.tipDecimal(1); item.hidden() })
			.addToplamBasit('ORTDOGRUSAYI', 'Ort. Doğru Sayı', 'ortdogrusayi', null, ({ colDef, item }) => {
				colDef.tipDecimal(1).dipAvg();
				item.setFormul(['DOGRUSAYI'], ({ rec }) => roundToFra1(rec.dogrusayi / rec.kayitsayisi))
			 })
			.addToplamBasit('YANLISSAYI', 'Yanlış Sayı', 'yanlissayi', null, ({ colDef, item }) => { colDef.tipDecimal(1); item.hidden() })
			.addToplamBasit('ORTYANLISSAYI', 'Ort. Doğru Sayı', 'ortyanlissayi', null, ({ colDef, item }) => {
				colDef.tipNumerik().dipAvg();
				item.setFormul(['YANLISSAYI'], ({ rec }) => roundToFra1(rec.yanlissayi / rec.kayitsayisi))
			})
			.addToplamBasit('SECILMEYENDOGRUSAYI', 'Seçilmeyen Doğru Sayı', 'secilmeyendogrusayi', null, ({ colDef, item }) => { colDef.tipDecimal(1); item.hidden() })
			.addToplamBasit('ORTSECILMEYENDOGRUSAYI', 'Ort. Seçilmeyen Doğru Sayı', 'ortsecilmeyendogrusayi', null, ({ colDef, item }) => {
				colDef.tipNumerik().dipAvg();
				item.setFormul(['SECILMEYENDOGRUSAYI'], ({ rec }) => roundToFra1(rec.secilmeyendogrusayi / rec.kayitsayisi))
			})
			.addToplamBasit('DOGRUSECIMSUREMS', 'Doğru Seçim Süre (ms)', 'dogrusecimsurems', null, ({ colDef, item }) => { colDef.tipDecimal(1); item.hidden() })
			.addToplamBasit('ORTDOGRUSECIMSUREMS', 'Ort. Doğru Seçim Süre (ms)', 'ortdogrusecimsurems', null, ({ colDef, item }) => {
				colDef.tipDecimal().dipAvg();
				item.setFormul(['DOGRUSECIMSUREMS'], ({ rec }) => roundToFra1(rec.dogrusecimsurems / rec.kayitsayisi))
			})
			.addToplamBasit('YANLISSECIMSUREMS', 'Yanlış Seçim Süre (ms)', 'yanlissecimsurems', null, ({ colDef, item }) => { colDef.tipDecimal(1); item.hidden() })
			.addToplamBasit('ORTYANLISSECIMSUREMS', 'Ort. Yanlış Seçim Süre (ms)', 'ortyanlissecimsurems', null, ({ colDef, item }) => {
				colDef.tipDecimal().dipAvg();
				item.setFormul(['YANLISSECIMSUREMS'], ({ rec }) => roundToFra1(rec.dogrusecimsurems / rec.kayitsayisi))
			})
		for (let prefix of ['HI', 'DE']) {
			let prefixLower = prefix.toLowerCase();
			result
				.addToplamBasit(`${prefix}SKOR`, null, `${prefixLower}skor`, null, ({ item }) => item.hidden())
				.addToplamBasit(`${prefix}BELIRTISAYI`, null, `${prefixLower}belirtisayi`, null, ({ item }) => item.hidden())
				.addToplamBasit(prefix, null, prefixLower, null, ({ item }) => item.hidden())
				.addToplamBasit(`ORT$${prefix}SKOR`, `Ort. ${prefix} Skor`, `ort${prefixLower}skor`, null, ({ colDef, item }) => {
					colDef.tipDecimal(1).dipAvg();
					item.setFormul([`${prefix}SKOR`], ({ rec }) => roundToFra1(rec[`${prefixLower}skor`] / rec.kayitsayisi))
				})
				.addToplamBasit(`ORT$${prefix}BELIRTISAYI`, `Ort. ${prefix} Belirti`, `ort${prefixLower}belirtisayi`, null, ({ colDef, item }) => {
					colDef.tipDecimal(1).dipAvg();
					item.setFormul([`${prefix}BELIRTISAYI`], ({ rec }) => roundToFra1(rec[`${prefixLower}belirtisayi`] / rec.kayitsayisi))
				})
		}
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e, alias = 'fis'; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: `${alias}.tarihsaat` });
		wh.add(`(${alias}.bcptyapildi <> 0 OR ${alias}.bankethiyapildi <> 0 OR ${alias}.banketdeyapildi <> 0)`);
		if (attrSet.DOKTOR) { sent.leftJoin({ alias, from: 'esemuayene mua', on: 'fis.muayeneid = mua.id' }).leftJoin({ alias, from: 'esedoktor dok', on: 'mua.doktorid = dok.id' }) }
		if (attrSet.HASTA || attrSet.IL || attrSet.ILBOLGE || attrSet.CINSIYET) { sent.leftJoin({ alias, from: 'esehasta has', on: `${alias}.hastaid = has.id` }) }
		if (attrSet.IL || attrSet.ILBOLGE) {
			sent.leftJoin({ alias: 'has', from: 'eseyerlesim yer', on: 'has.yerlesimkod = yer.kod' }).leftJoin({ alias: 'yer', from: 'caril il', on: 'yer.ilkod = il.kod' }) }
		if (attrSet.YASGRUP) {
			sent.leftJoin({ alias, from: 'eseyasgrup ygrp', on: [`(ygrp.yasbasi = 0 or ${alias}.aktifyas >= ygrp.yasbasi)`, `(ygrp.yassonu = 0 or ${alias}.aktifyas <= ygrp.yassonu)`] }) }
		if (attrSet.SORU) { sent.leftJoin({ alias, from: 'eseanketsablondetay sdet', on: 'har.esedetayid = sdet.id' }) }
		/*if (Object.keys(attrSet).find(key => key.startsWith('YANIT'))) {
			sent.leftJoin({ alias, from: 'eseanketsablon sab', on: 'fis.esesablonid = sab.id' }).leftJoin({ alias, from: 'eseanketyanit ynt', on: 'sab.yanitid = ynt.id' }) }*/
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
				// case 'DEHBVARMI': sahalar.add(`(case when fis.bdehbvarmi = 0 then '${MQSQLOrtak.resimClause_x()}'else '${MQSQLOrtak.resimClause_ok({ ekCSS: `filter: hue-rotate(130deg)` })}' end) dehbvarmi`); break
				case 'DEHBVARMI': sahalar.add(`(case when fis.bdehbvarmi = 0 then '<b class="forestgreen fs-150">-</b>' else '<b class="firebrick fs-120">Var</b>' end) dehbvarmi`); break
				case 'DEHBVARSAYI': sahalar.add(`SUM(case when fis.bdehbvarmi = 0 then 0 else 1 end) dehbvarsayi`); break
				case 'DEHBYOKSAYI': sahalar.add(`SUM(case when fis.bdehbvarmi = 0 then 1 else 0 end) dehbyoksayi`); break
				case 'DOGRUSAYI': sahalar.add('SUM(fis.dogrusayi) dogrusayi'); break; case 'YANLISSAYI': sahalar.add('SUM(fis.yanlissayi) yanlissayi'); break
				case 'SECILMEYENDOGRUSAYI': sahalar.add('SUM(fis.secilmeyendogrusayi) secilmeyendogrusayi'); break
				case 'ORTDOGRUSECIMSUREMS': sahalar.add('SUM(fis.dogrusecimsurems) dogrusecimsurems'); break
				case 'ORTYANLISSECIMSUREMS': sahalar.add('SUM(fis.yanlissecimsurems) yanlissecimsurems'); break
				case 'YANITSIZSAYI': sahalar.add('SUM(fis.yanitsizsayi) yanitsizsayi'); break
				case 'HISKOR': sahalar.add('SUM(fis.hiskor) hiskor'); break; case 'DESKOR': sahalar.add('SUM(fis.deskor) deskor'); break
				default: {
					for (const prefix of ['HI', 'DE']) {
						if (key.slice(0, 2) != prefix) { continue } const prefixLower = prefix.toLowerCase();
						sahalar.add(`SUM(fis.${prefixLower}skor)`, `SUM(fis.${prefixLower}belirtisayi) ${prefixLower}belirtisayi`)
					}
					break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarihsaat' }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
	fisVeHareketBagla(e) {
		const {sent} = e, alias = 'fis', {table, detayVeyaGrupTable} = this.class; sent.fromAdd(`${table} fis`);
		if (detayVeyaGrupTable) { sent.leftJoin({ alias, from: `${detayVeyaGrupTable} har`, iliski: `har.fisid = fis.id` }) }
		return this
	}
}
/* DRapor_ESETest.goster() */
