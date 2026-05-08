class DRapor_Donemsel extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Donemsel_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get secimSinif() { return DonemselSecimler }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		/*if (config.dev) {
			let {tekSecim: donem} = sec.donem, {tarihAralik: tarih} = sec;
			donem.tarihAralik(); tarih.basi = today().addDays(-10)
		}*/
	}
	super_secimlerDuzenle(e) { super.secimlerDuzenle(e) }
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
			// .addGrup(new TabloYapiItem().setKA('SAAT', 'Saat').addColDef(new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 20, filterType: 'checkedlist' }).tipTime()))
	}
	super_tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e) }
	super_loadServerDataInternal(e) { super.loadServerDataInternal(e) }
	superSuper_loadServerDataInternal(e) { super.super_loadServerDataInternal(e) }
	loadServerData(e = {}) {
		let { secimler: sec, secimler: { tarihBS: donemBS } } = this
		extend(e, { donemBS }) /* e.donemBS = sec.tarihBSVeyaCariDonem; */
		return super.loadServerData(e)
	}
	donemBagla({ donemBS, alias = 'fis', tarihSaha, tarihClause, sent }) {
		let { hareketmi, envantermi } = this.class
		let { where: wh } = sent
		let aliasVeNokta = alias ? `${alias}.` : ''
		tarihSaha ??= 'tarih'
		if (tarihSaha.includes('.'))
			alias = aliasVeNokta = ''
		tarihClause = tarihClause ?? (tarihSaha ? aliasVeNokta + tarihSaha : null)
		if (donemBS && tarihClause.sqlDoluDegermi()) {
			if (hareketmi || envantermi) {
				let { sonu } = donemBS
				wh.basiSonu({ sonu }, tarihClause)
			}
			else
				wh.basiSonu(donemBS, tarihClause)
		}
		return this
	}
	loadServerData_queryDuzenle_tarih({ attrSet, stm, sent, alias = 'fis', tarihSaha, tarihClause }) {
		let { sqlNull } = Hareketci_UniBilgi.ortakArgs
		let sentOrUni = sent ?? stm?.sent
		let aliasVeNokta = alias ? `${alias}.` : ''
		tarihSaha ??= 'tarih'
		if (tarihSaha.includes('.'))
			alias = aliasVeNokta = ''
		tarihClause = tarihClause ?? (tarihSaha ? aliasVeNokta + tarihSaha : null)
		let tarihClauseVarmi = tarihClause.sqlDoluDegermi()
		if (!tarihClauseVarmi) {
			let { from } = sent
			let { alias } = ( from.aliasIcinTable('fis') ?? from.aliasIcinTable('bel') ) ?? {}
			tarihClause = [alias, 'tarih'].filter(Boolean).join('.')
			tarihClauseVarmi = true
		}
		for (let { sahalar } of sentOrUni) {
			for (let key in attrSet) {
				switch (key) {
					case 'YILAY': {
						if (tarihClauseVarmi)
							sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + dbo.ayadi(${tarihClause})) yilay`)
						else
							sahalar.add(`${sqlNull} yilay`)
						break
					}
					case 'YIL': {
						sahalar.add(`${tarihClauseVarmi ? `DATEPART(YEAR, ${tarihClause})` : sqlNull} yil`)
						break
					}
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
						if (tarihClauseVarmi)
							sahalar.add(`${_} ceyrekkod`, `${clause} ceyrekadi`)
						else
							sahalar.add(`${sqlNull} ceyrekkod`, `${sqlNull} ceyrekadi`)
						break
					}
					case 'YILHAFTA': {
						if (tarihClauseVarmi)
							sahalar.add(`(CAST(DATEPART(YEAR, ${tarihClause}) AS CHAR(4)) + ' - ' + CAST(DATEPART(WEEK, ${tarihClause}) AS VARCHAR(2))) yilhafta`)
						else
							sahalar.add(`${sqlNull} yilhafta`)
						break
					}
					case 'AYADI': {
						sahalar.add(`${tarihClauseVarmi ? `dbo.ayadi(${tarihClause})` : sqlNull} ayadi`)
						break
					}
					case 'HAFTA': {
						sahalar.add(`${tarihClauseVarmi ? `DATEPART(WEEK, ${tarihClause})` : sqlNull} haftano`)
						break
					}
					case 'TARIH': {
					    // `CONVERT(VARCHAR(10), ${tarihClause}, 104) tarihstr`)
						sahalar.add(`${tarihClauseVarmi ? tarihClause : sqlNull} tarih`)
						break
					}
					case 'SAAT': {
						sahalar.add(`${tarihClauseVarmi ? `CONVERT(VARCHAR(10), ${tarihClause}, 108)` : sqlNull} saat`)
						break
					}
				}
			}
		}
		return this
	}
}
