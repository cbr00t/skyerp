class HEFis extends BankaOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'hefis' }
	static get detaySinif() { return HEDetay }
	static get gridKontrolcuSinif() { return HEGridci }
	static get numTipKod() { return 'HSGHE' }
	static extYapilarDuzenle(e) {
		e.liste.push(ExtFis_BankaHesap);
		super.extYapilarDuzenle(e)
	}
}
class HEDetay extends BankaOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'hehar' }
	static extYapilarDuzenle(e) {
		e.liste.push(Ext_DvKur, Ext_BedelVeDvBedel);
		super.extYapilarDuzenle(e)
	}
	static super_extYapilarDuzenle(e) { super.extYapilarDuzenle(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { dekontNox: new PInstStr('dekontnox') })
	}
	static orjBaslikListesiDuzenle_son(e) {
		super.orjBaslikListesiDuzenle_son(e);
		e.liste.push(new GridKolon({ belirtec: 'dekontnox', text: 'Dekont No', genislikCh: 12 }))
	}
}
class HEGridci extends BankaOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_son(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'dvBedel', text: 'Dv Bedel', genislikCh: 13 }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13 }).tipDecimal_bedel()
		);
		super.tabloKolonlariDuzenle_son(e);
		tabloKolonlari.push(new GridKolon({ belirtec: 'dekontNox', text: 'Dekont No', genislikCh: 12 }))
	}
	super_tabloKolonlariDuzenle_son(e) { super.tabloKolonlariDuzenle_son(e) }
}

class HEGelenGidenOrtakFis extends HEFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return HEGelenGidenOrtakDetay }
	static get gridKontrolcuSinif() { return HEGelenGidenOrtakGridci }
}
class HEGelenGidenOrtakDetay extends HEDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		e.liste.push(Ext_CariVeAltHesap, Ext_BelgeTarihVeNo, Ext_TakipNo);
		super.extYapilarDuzenle(e)
	}
	static super_extYapilarDuzenle(e) { super.super_extYapilarDuzenle(e) }
}
class HEGelenGidenOrtakGridci extends HEGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			...MQCari.getGridKolonlar({ belirtec: 'cari', gridKolonGrupcu: 'getGridKolonGrup_yoreli' }),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap' }),
			...MQTakipNo.getGridKolonlar({ belirtec: 'takip' })
		);
		super.tabloKolonlariDuzenle_ilk(e);
	}
	super_tabloKolonlariDuzenle_son(e) { super.super_tabloKolonlariDuzenle_son(e) }
}

class HEGonderilenFis extends HEGelenGidenOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Gönderilen Havale/EFT' }
	static get detaySinif() { return HEGonderilenDetay }
	static get gridKontrolcuSinif() { return HEGonderilenGridci }
	static get kodListeTipi() { return 'HEGONFIS' }
	static get fisTipiPrefix() { return 'S' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { heTipi: new PInstTekSecim(HavaleEFTTipi) })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		super.rootFormBuilderDuzenle_ara(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'heTipi', etiket: 'Havale/EFT', source: e => HavaleEFTTipi.kaListe }).dropDown().noMF()
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this, {fisTipiPrefix} = this, {stm} = e;
		const fisTipiListe = HavaleEFTTipi.kodListe.map(x => fisTipiPrefix + x);
		for (const sent of stm.getSentListe()) {
			sent.where.inDizi(fisTipiListe, `${aliasVeNokta}fistipi`);
			sent.sahalar.add(`${aliasVeNokta}fistipi`)
		}
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e, {fisTipiPrefix} = this.class, heTipi = this.heTipi.char;
		hv.fistipi = fisTipiPrefix + heTipi
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, {fisTipiPrefix} = this.class, {fisTipi} = rec;
		if (fisTipi)
			this.heTipi.char = fisTipi.slice(1)
	}
}
class HEGonderilenDetay extends HEGelenGidenOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { heTipi: new PInstTekSecim('hisl', HavaleEFTTipi) })
	}
}
class HEGonderilenGridci extends HEGelenGidenOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class HEGelenFis extends HEGelenGidenOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Gelen Havale/EFT' }
	static get detaySinif() { return HEGelenDetay }
	static get gridKontrolcuSinif() { return HEGelenGridci }
	static get kodListeTipi() { return 'HEGELFIS' }
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e;
		hv.fistipi = 'GL'
	}
}
class HEGelenDetay extends HEGelenGidenOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { heTipi: new PInstTekSecim('hisl', GelenHavaleEFTTipi) })
	}
}
class HEGelenGridci extends HEGelenGidenOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ara(e) {
		super.tabloKolonlariDuzenle_ara(e);
		e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'heTipi', text: 'Havale/EFT', genislikCh: 10 })
				.tipTekSecim({ kaListe: GelenHavaleEFTTipi.kaListe })
				.kodsuz()
		)
	}
}

class HEKendimizeFis extends HEFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Kendimize Havale/EFT' }
	static get detaySinif() { return HEKendimizeDetay }
	static get gridKontrolcuSinif() { return HEKendimizeGridci }
	static get kodListeTipi() { return 'HEKENFIS' }
	static get fisTipiPrefix() { return 'B' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { heTipi: new PInstTekSecim(HavaleEFTTipi) })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		super.rootFormBuilderDuzenle_ara(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'heTipi', etiket: 'Havale/EFT', source: e => HavaleEFTTipi.kaListe }).dropDown().noMF()
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this, {fisTipiPrefix} = this, {stm} = e;
		const fisTipiListe = HavaleEFTTipi.kodListe.map(x => fisTipiPrefix + x);
		for (const sent of stm.getSentListe()) {
			sent.where.inDizi(fisTipiListe, `${aliasVeNokta}fistipi`);
			sent.sahalar.add(`${aliasVeNokta}fistipi`)
		}
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e, {fisTipiPrefix} = this.class, heTipi = this.heTipi.char;
		hv.fistipi = fisTipiPrefix + heTipi
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, {fisTipiPrefix} = this.class, {fisTipi} = rec;
		if (fisTipi)
			this.heTipi.char = fisTipi.slice(1)
	}
}
class HEKendimizeDetay extends HEDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		e.liste.push(Ext_RefBankaHesap);
		super.extYapilarDuzenle(e)
	}
}
class HEKendimizeGridci extends HEGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(...MQBankaHesap.getGridKolonlar({ belirtec: 'refBanHesap', adiEtiket: 'Ref Banka Hesap' }));
		super.tabloKolonlariDuzenle_ilk(e)
	}
}

class BankaTopluIslemFis extends HEGelenGidenOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Banka Toplu İşlem' }
	static get detaySinif() { return BankaTopluIslemDetay }
	static get gridKontrolcuSinif() { return BankaTopluIslemGridci }
	static get kodListeTipi() { return 'BANTOPISL' }
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e;
		hv.fistipi = 'TP'
	}
}
class BankaTopluIslemDetay extends HEGelenGidenOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, {
			heTipi: new PInstTekSecim('hisl', GelenGidenHavaleEFTTipi),
			dvBorcBedel: new PInstNum(), dvAlacakBedel: new PInstNum(),
			borcBedel: new PInstNum(), alacakBedel: new PInstNum()
		})
	}
	static extYapilarDuzenle(e) {
		e.liste.push(Ext_CariVeAltHesap, Ext_BelgeTarihVeNo, Ext_TakipNo, Ext_DvKur);
		super.super_extYapilarDuzenle(e)
	}
	static orjBaslikListesiDuzenle_son(e) {
		const {aliasVeNokta} = this;
		e.liste.push(
			new GridKolon({ belirtec: 'borcBedel', text: 'Borç Bedel', genislikCh: 15, sql: `(case when ${aliasVeNokta}hba = 'B' then ${aliasVeNokta}bedel else 0 end)` }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'alacakBedel', text: 'Alacak Bedel', genislikCh: 15, sql: `(case when ${aliasVeNokta}hba = 'A' then ${aliasVeNokta}bedel else 0 end)` }).tipDecimal_bedel()
		);
		super.orjBaslikListesiDuzenle_son(e)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, {borcBedel, dvBorcBedel} = this;
		$.extend(hv, {
			hba: borcBedel && borcBedel > 0 ? 'B' : 'A',
			bedel: borcBedel && borcBedel > 0 ? borcBedel : this.alacakBedel,
			dvbedel: dvBorcBedel && dvBorcBedel > 0 ? dvBorcBedel : this.dvAlacakBedel
		})
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, {hba, bedel, dvbedel} = rec;
		const borcmu = (hba == 'B');
		$.extend(this, {
			dvBorcBedel: borcmu ? dvbedel : 0, dvAlacakBedel: borcmu ? 0 : dvbedel,
			borcBedel: borcmu ? bedel : 0, alacakBedel: borcmu ? 0 : bedel
		})
	}
}
class BankaTopluIslemGridci extends HEGelenGidenOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_son(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'heTipi', text: 'Havale/EFT', genislikCh: 20,
				cellValueChanged: e => this.heTipiDegisti(e),
				cellClassName: (...args) => this.grid_cellClassName(...args), cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipTekSecim({ tekSecimSinif: GelenGidenHavaleEFTTipi }).kodsuz(),
			new GridKolon({
				belirtec: 'dvBorcBedel', text: 'Dv. Borç Bedel', genislikCh: 13,
				cellClassName: (...args) => this.grid_cellClassName(...args), cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipDecimal_dvBedel(),
			new GridKolon({
				belirtec: 'dvAlacakBedel', text: 'Dv. Alacak Bedel', genislikCh: 13,
				cellClassName: (...args) => this.grid_cellClassName(...args), cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipDecimal_dvBedel(),
			new GridKolon({
				belirtec: 'borcBedel', text: 'Borç Bedel', genislikCh: 13,
				cellClassName: (...args) => this.grid_cellClassName(...args), cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipDecimal_bedel(),
			new GridKolon({
				belirtec: 'alacakBedel', text: 'Alacak Bedel', genislikCh: 13,
				cellClassName: (...args) => this.grid_cellClassName(...args), cellBeginEdit: (...args) => this.grid_cellBeginEdit(...args)
			}).tipDecimal_bedel()
		);
		super.super_tabloKolonlariDuzenle_son(e);
		tabloKolonlari.push(new GridKolon({ belirtec: 'dekontNox', text: 'Dekont No', genislikCh: 12 }))
	}
	heTipiDegisti(e) {
		const {gridWidget, args, value, oldValue} = e, det = e.gridRec;
		const ba = ((value.char === undefined ? value : value.char) || '')[0];
		const oldBA = ((oldValue.char === undefined ? oldValue : oldValue.char) || '')[0];
		if (ba != oldBA) {
			const borcmu = ba == 'B';
			if (borcmu) {
				$.extend(det, {
					dvBorcBedel: det.dvAlacakBedel, dvAlacakBedel: 0,
					borcBedel: det.alacakBedel, alacakBedel: 0
				})
			}
			else {
				$.extend(det, {
					dvAlacakBedel: det.dvBorcBedel, dvBorcBedel: 0,
					alacakBedel: det.borcBedel, borcBedel: 0
				})
			}
			gridWidget.render()
		}
	}
	grid_cellClassName(colDef, rowIndex, belirtec, value, det) {
		const result = [belirtec];
		if ((belirtec == 'dvBorcBedel' || belirtec == 'borcBedel') && det?.heTipi?.ba != 'B')
			result.push('grid-readOnly')
		if ((belirtec == 'dvAlacakBedel' || belirtec == 'alacakBedel') && det?.heTipi?.ba != 'A')
			result.push('grid-readOnly')
		return result.join(' ')
	}
	grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		const det = colDef.gridPart.gridWidget.getrowdata(rowIndex);
		if ((belirtec == 'dvBorcBedel' || belirtec == 'borcBedel') && det?.heTipi?.ba != 'B')
			return false
		if ((belirtec == 'dvAlacakBedel' || belirtec == 'alacakBedel') && det?.heTipi?.ba != 'A')
			return false
		return true
	}
}
