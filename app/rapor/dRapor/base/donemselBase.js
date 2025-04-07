class DRapor_Donemsel extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Donemsel_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get secimSinif() { return DonemselSecimler }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 20, filterType: 'checkedlist' }).tipDate()))
			.addGrup(new TabloYapiItem().setKA('SAAT', 'Saat').addColDef(new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 20, filterType: 'checkedlist' }).tipTime()))
	}
	loadServerData(e) {
		e = e ?? {}; let {secimler: sec} = this, {tarihBS: donemBS} = sec;
		$.extend(e, { donemBS }); /* e.donemBS = sec.tarihBSVeyaCariDonem; */
		return super.loadServerData(e)
	}
	super_loadServerDataInternal(e) { super.loadServerDataInternal(e) }
	superSuper_loadServerDataInternal(e) { super.super_loadServerDataInternal(e) }
	donemBagla({ donemBS, tarihSaha, sent }) { if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
	loadServerData_queryDuzenle_tarih(e) {
		let {attrSet, stm} = e, sentIter = (e.sent ?? stm).getSentListe(), alias = e.alias ?? 'fis', aliasVeNokta = alias ? `${alias}.` : '';
		let tarihSaha = e.tarihSaha ?? 'tarih', tarihClause = aliasVeNokta + tarihSaha;
		for (const {sahalar} of sentIter) {
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
