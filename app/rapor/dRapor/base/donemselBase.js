class DRapor_Donemsel extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Donemsel_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 20, filterType: 'checkedlist' }).tipDate()))
			.addGrup(new TabloYapiItem().setKA('SAAT', 'Saat').addColDef(new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 20, filterType: 'checkedlist' }).tipTime()))
	}
	secimlerDuzenle(e) {
		const {secimler: sec} = e; sec.grupEkle('donemVeTarih', 'Dönem Ve Tarih');
		sec.secimTopluEkle({
			donem: new SecimTekSecim({ etiket: 'Dönem', tekSecimSinif: DonemTarihAralikVeHepsiSecim, grupKod: 'donemVeTarih' }).autoBind()
				.setOzetBilgiValueGetter(e => {
					const kod = e.value?.kod ?? e.value, result = [e.value?.aciklama ?? kod];
					if (kod == 'TR') { let value = secimler.tarihAralik.ozetBilgiValueDuzenlenmis; if (value) { result.push(value) } }
					return result
				}),
			tarihAralik: new SecimDate({ etiket: 'Tarih', grupKod: 'donemVeTarih' }).hidden()
		});
		super.secimlerDuzenle(e)
	}
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e); const {secimlerPart} = this, {secim2Info} = secimlerPart || {}; if (!secim2Info) { return }
		let part = secim2Info.donem.element.find('.ddList').data('part'); if (part) {
			part.degisince(e => {
				const {tarihAralikmi} = secim2Info.donem.secim.tekSecim;
				secim2Info.tarihAralik.element[tarihAralikmi ? 'removeClass' : 'addClass']('jqx-hidden')
			})
		}
	}
	async loadServerDataInternal(e) {
		const {raporTanim, secimler} = this, attrSet = e.attrSet ?? raporTanim.attrSet, {maxRow} = e;
		let donemBS = new CBasiSonu({ basi: today().yilBasi(), sonu: today().yilSonu() });
		const yil = app.params?.zorunlu?.cariYil; if (yil && yil != today().getYil()) {
			for (const key of ['basi', 'sonu']) { let value = donemBS[key]; if (!isInvalidDate(value)) { value.setYil(yil) } } }
		/*const sabit = [...Object.keys(grup)], toplam = []; for (const key in icerik) { (tabloYapi.toplam[key] ? toplam : sabit).push(key) }*/
		if (secimler) {
			const {donem, tarihAralik} = secimler; let {basiSonu, tarihAralikmi} = donem.tekSecim;
			if (tarihAralikmi) { const {basi, sonu} = tarihAralik; basiSonu = new CBasiSonu({ basi, sonu }) } if (basiSonu) { donemBS = basiSonu }
		}
		return await super.loadServerDataInternal({ ...e, donemBS })
	}
	super_loadServerDataInternal(e) { super.loadServerDataInternal(e) } superSuper_loadServerDataInternal(e) { super.super_loadServerDataInternal(e) }
	donemBagla({ donemBS, tarihSaha, sent }) { if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
	loadServerData_queryDuzenle_tarih(e) {
		let {attrSet, stm} = e, alias = e.alias ?? 'fis', aliasVeNokta = alias ? `${alias}.` : '';
		let tarihSaha = e.tarihSaha ?? 'tarih', tarihClause = aliasVeNokta + tarihSaha;
		for (const {sahalar} of stm.getSentListe()) {
			for (const key in attrSet) {
				switch (key) {
					case 'YILAY': sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + dbo.ayadi(${tarihClause})) yilay`); break
					case 'YILHAFTA': sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + CAST(DATEPART(WEEK, ${tarihClause}) AS VARCHAR(2))) yilhafta`); break
					case 'AYADI': sahalar.add(`dbo.ayadi(${tarihClause}) ayadi`); break
					case 'HAFTA': sahalar.add(`DATEPART(week, ${tarihClause}) haftano`); break
					case 'TARIH': sahalar.add(`CONVERT(VARCHAR(10), ${tarihClause}, 104) tarih`); break
					case 'SAAT': sahalar.add(`CONVERT(VARCHAR(10), ${tarihClause}, 108) saat`); break
				}
			}
		}
		return this
	} 
}
