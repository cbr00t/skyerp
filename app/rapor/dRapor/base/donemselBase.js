class DRapor_Donemsel extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Donemsel_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get secimSinif() { return DonemselSecimler }
	tabloYapiDuzenle({ result, tarihClause }) {
		super.tabloYapiDuzenle(...arguments)
		result
			.addKAPrefix('ceyrek')
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrupBasit_numerik('YIL', 'Yıl', 'yil')
			.addGrupBasit('CEYREK', 'Çeyrek Dönem', 'ceyrek', null, null, null, 'ceyrekadi')
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', genislikCh: 20, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 20, filterType: 'checkedlist' }).tipDate()))
			.addGrup(new TabloYapiItem().setKA('SAAT', 'Saat').addColDef(new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 20, filterType: 'checkedlist' }).tipTime()))
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		/*if (config.dev) {
			let {tekSecim: donem} = sec.donem, {tarihAralik: tarih} = sec;
			donem.tarihAralik(); tarih.basi = today().addDays(-10)
		}*/
	}
	loadServerData(e = {}) {
		let {secimler: sec, secimler: { tarihBS: donemBS }} = this
		$.extend(e, { donemBS }) /* e.donemBS = sec.tarihBSVeyaCariDonem; */
		return super.loadServerData(e)
	}
	super_loadServerDataInternal(e) { super.loadServerDataInternal(e) }
	superSuper_loadServerDataInternal(e) { super.super_loadServerDataInternal(e) }
	donemBagla({ donemBS, alias = 'fis', tarihSaha, tarihClause, sent }) {
		let {hareketmi, envantermi} = this.class, {where: wh} = sent
		let aliasVeNokta = alias ? `${alias}.` : ''
		tarihSaha = tarihSaha ?? 'tarih'
		if (tarihSaha.includes('.'))
			alias = aliasVeNokta = ''
		tarihClause = tarihClause ?? `${aliasVeNokta}${tarihSaha}`
		if (donemBS) {
			if (hareketmi || envantermi) {
				let {sonu} = donemBS
				wh.basiSonu({ sonu }, tarihClause)
			}
			else
				wh.basiSonu(donemBS, tarihClause)
		}
		return this
	}
	loadServerData_queryDuzenle_tarih({ attrSet, stm, sent, alias = 'fis', tarihSaha, tarihClause }) {
		let sentOrUni = sent ?? stm?.sent
		let aliasVeNokta = alias ? `${alias}.` : ''
		tarihSaha = tarihSaha ?? 'tarih'
		if (tarihSaha.includes('.'))
			alias = aliasVeNokta = ''
		tarihClause = tarihClause ?? `${aliasVeNokta}${tarihSaha}`
		for (let {sahalar} of sentOrUni) {
			for (let key in attrSet) {
				switch (key) {
					case 'YILAY': sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + dbo.ayadi(${tarihClause})) yilay`); break
					case 'YIL': sahalar.add(`DATEPART(YEAR, ${tarihClause}) yil`); break
					case 'CEYREK': {
						let _ = `DATEPART(MONTH, ${tarihClause})`
						let clause = (
							'(case' +
								` when ${_} <= 3 then 'Oca->Mar'` +
								` when ${_} <= 6 then 'Nis->Haz'` +
								` when ${_} <= 9 then 'Tem->Eyl'` +
								` when ${_} <= 12 then 'Eki->Ara'` +
								` else '??'` +
							' end )'
						)
						sahalar.add(`${_} ceyrekkod`, `${clause} ceyrekadi`)
					}
					break
					case 'YILHAFTA': sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + CAST(DATEPART(WEEK, ${tarihClause}) AS VARCHAR(2))) yilhafta`); break
					case 'AYADI': sahalar.add(`dbo.ayadi(${tarihClause}) ayadi`); break
					case 'HAFTA': sahalar.add(`DATEPART(WEEK, ${tarihClause}) haftano`); break
					case 'TARIH': sahalar.add(`${tarihClause} tarih`); break
					                      // `CONVERT(VARCHAR(10), ${tarihClause}, 104) tarihstr`)
					case 'SAAT': sahalar.add(`CONVERT(VARCHAR(10), ${tarihClause}, 108) saat`); break
				}
			}
		}
		return this
	}
}
