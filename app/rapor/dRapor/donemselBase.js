class DRapor_Donemsel extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Donemsel_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e;
		result
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 20, filterType: 'checkedlist' }).tipDate()))
	}
	secimlerDuzenle(e) {
		const {secimler} = e, {tabloYapi} = this, {grupVeToplam} = tabloYapi;
		secimler.grupEkle('donemVeTarih', 'Dönem Ve Tarih');
		secimler.secimTopluEkle({
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
		const {raporTanim, secimler} = this, {attrSet} = raporTanim, {maxRow} = e;
		let donemBS = new CBasiSonu({ basi: today().yilBasi(), sonu: today().yilSonu() });
		/*const sabit = [...Object.keys(grup)], toplam = []; for (const key in icerik) { (tabloYapi.toplam[key] ? toplam : sabit).push(key) }*/
		if (secimler) {
			const {donem, tarihAralik} = secimler; let {basiSonu, tarihAralikmi} = donem.tekSecim;
			if (tarihAralikmi) { const {basi, sonu} = tarihAralik; basiSonu = new CBasiSonu({ basi, sonu }) } if (basiSonu) { donemBS = basiSonu }
		}
		return await super.loadServerDataInternal({ ...e, donemBS })
	}
	super_loadServerDataInternal(e) { super.loadServerDataInternal(e) } superSuper_loadServerDataInternal(e) { super.super_loadServerDataInternal(e) }
	loadServerData_queryDuzenle_tarih(e) {
		const {attrSet, stm} = e, alias = e.alias ?? 'fis', tarihSaha = e.tarihSaha ?? 'tarih', tarihClause = alias ? `${alias}.${tarihSaha}` : tarihSaha;
		for (const sent of stm.getSentListe()) {
			for (const key in attrSet) {
				switch (key) {
					case 'YILAY': sent.sahalar.add(`(CAST(DATEPART(year, ${tarihClause}) AS CHAR(4)) + ' - ' + dbo.ayadi(${tarihClause})) yilay`); break
					case 'YILHAFTA': sent.sahalar.add(`(CAST(DATEPART(year, ${tarihClause}) AS CHAR(4)) + ' - ' + CAST(DATEPART(week, ${tarihClause}) AS VARCHAR(2))) yilhafta`); break
					case 'AYADI': sent.sahalar.add(`dbo.ayadi(${tarihClause}) ayadi`); break
					case 'HAFTA': sent.sahalar.add(`DATEPART(week, ${tarihClause}) haftano`); break
					case 'TARIH': sent.sahalar.add(`${tarihClause} tarih`); break
				}
			}
		}
		return this
	} 
	donemBagla(e) { const {donemBS, tarihSaha, sent} = e; if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
}
