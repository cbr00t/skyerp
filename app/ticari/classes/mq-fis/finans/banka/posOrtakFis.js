class PosOrtakFis extends BankaOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'posfis' }
	static get detaySinif() { return PosOrtakDetay }
	static get gridKontrolcuSinif() { return PosOrtakGridci }
	static get fisTipi() { return null }
	static get almSat() { return null }
	static get posHesapSinif() { return this.gridKontrolcuSinif.posHesapSinif }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { normalIade: new PInstTekSecim('iade', NormalIade) })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e)
		this.rootFormBuilderDuzenle_taksitlendir(e)
	}
	static rootFormBuilderDuzenle_taksitlendir(e) {
		e = e || {};
		const bedelSaha = e.bedelSaha || 'bedel';
		const {gridIslemTuslari} = e.builders;
		gridIslemTuslari.addButton('taksitlendir', null, 'TAKSİT', e => {
			const {rootPart} = e.builder, {gridWidget} = rootPart;
			$.extend(e, { gridPart: rootPart, gridWidget, belirtec: bedelSaha });
			rootPart.kontrolcu.taksitlendirIstendi(e)
		})
	}
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e, {fisTipi, almSat} = this;
		if (fisTipi != null)
			hv.fistipi = fisTipi
		if (almSat != null)
			hv.almsat = almSat
	}
}
class PosOrtakDetay extends BankaOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'posilkhar' }
	static extYapilarDuzenle(e) {
		const {liste} = e;
		liste.push(Ext_CariVeAltHesap);
		if (app.params.ticariGenel.kullanim.takipNo)
			liste.push(Ext_TakipNo)
		liste.push(Ext_NDVade, Ext_Vade, Ext_DvKur, Ext_BedelVeDvBedel);
		super.extYapilarDuzenle(e)
	}
}
class PosOrtakGridci extends BankaOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get posHesapSinif() { return MQPosHesap }
	tabloKolonlariDuzenle_ilk(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			...this.class.posHesapSinif.getGridKolonlar({ belirtec: 'posKosul', gridKolonGrupcu: 'getGridKolonGrup_bankaHesapli' }),
			...MQCari.getGridKolonlar({ belirtec: 'cari' }),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap' }),
			...MQTakipNo.getGridKolonlar({ belirtec: 'takip' }),
			new GridKolon({ belirtec: 'ndVade', text: 'Nakde Dönüşüm Vade', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 13 }).tipDate()
		);
		super.tabloKolonlariDuzenle_ilk(e);
	}
	tabloKolonlariDuzenle_son(e) {
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'dvBedel', text: 'Dv Bedel', genislikCh: 13 }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13 }).tipDecimal_bedel()
		);
		super.tabloKolonlariDuzenle_son(e)
	}
	gridContextMenuIstendi(e) {
		e = e || {};
		const evt = e.event, target = $(evt?.currentTarget), gridWidget = target?.jqxGrid('getInstance');
		const cell = gridWidget.getselectedcell() || {}; const rowIndex = cell.rowindex, belirtec = cell.datafield;
		const bedelSaha = e.bedelSaha || 'bedel';
		if (belirtec == bedelSaha || belirtec == 'dvBedel') {
			$.extend(e, { gridPart: e.gridPart ?? e.sender, gridWidget, rowIndex, belirtec });
			this.class.taksitlendirIstendi(e);
			return false
		}
		return super.gridContextMenuIstendi(e)
	}
	static async taksitlendirIstendi(e) {
		e = e || {};
		const bedelSaha = e.bedelSaha || 'bedel';
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart;
		const gridWidget = e.gridWidget ?? gridPart?.gridWidget;
		const cell = e.cell ?? gridWidget.getselectedcell();
		const rowIndex = e.rowIndex ?? e.rowindex ?? e.row ?? cell?.rowindex;
		let belirtec = e.belirtec ?? e.dataField ?? e.datafield ?? cell?.datafield ?? bedelSaha;
		if (belirtec == 'bedel' && bedelSaha != belirtec)
			belirtec = bedelSaha
		let det = e.detay ?? e.rec ?? e.gridRec ?? gridWidget.getrowdata(rowIndex);
		if (!det)
			return
		const bedel = (det[belirtec] || 0).valueOf();
		const inst = new this.posHesapSinif({ kod: det.posKosulKod });
		await inst.yukle();
		const {promise} = inst.taksitlendiriciUIGoster({ bedelSaha, taksitci: new Taksitci({ bedel: bedel, taksitSayisi: 1, ilkTaksit: 0 }) }) || {};
		const result = await promise, taksitler = result?.taksitler;
		if ($.isEmptyObject(taksitler))
			return

		gridWidget.beginupdate();
		let offset = 0;
		const changedGridRecs = e.changedGridRecs = [];
		for (const rec of taksitler) {
			const {vade, taksit} = rec; const ndVade = rec.nakdeDonusumVade;
			const _det = offset ? ($.isPlainObject(det) ? new gridPart.fis.detaySinif(det) : det.deepCopy()) : det;
			$.extend(_det, { vade, ndVade });
			_det[belirtec] = taksit;
			if (_det != det) {
				for (const key of ['uid', 'uniqueid', 'okunanHarSayac', 'eskiSeq', 'seq'])
					_det[key] = undefined
				gridWidget.addrow(null, _det, rowIndex + offset)
			}
			changedGridRecs.push(_det);
			offset++
		}
		gridWidget.endupdate(false)
	}
	async taksitlendirIstendi(e) {
		e = e || {}; const bedelSaha = e.bedelSaha = e.bedelSaha || 'bedel';
		await PosOrtakGridci.taksitlendirIstendi(e)
	}
}

class PosKrediKartiOrtakFis extends PosOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return PosKrediKartiOrtakDetay }
	static get gridKontrolcuSinif() { return PosKrediKartiOrtakGridci }
	static get almSat() { return null }
	static get fisTipi() { return 'AL' }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.push(ExtFis_Plasiyer)
	}
}
class PosKrediKartiOrtakDetay extends PosOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class PosKrediKartiOrtakGridci extends PosOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get posHesapSinif() { return MQKrediKarti }
}

class PosTahsilFis extends PosKrediKartiOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return PosTahsilDetay }
	static get gridKontrolcuSinif() { return PosTahsilGridci }
	static get sinifAdi() { return 'POS Tahsil' }
	static get kodListeTipi() { return 'POSTAH' }
	static get numTipKod() { return 'PSALM' }
	static get almSat() { return 'T' }
}
class PosTahsilDetay extends PosKrediKartiOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		const {liste} = e;
		liste.push(Ext_PosHesap);
		super.extYapilarDuzenle(e)
	}
}
class PosTahsilGridci extends PosKrediKartiOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class KrediKartiIleOdemeFis extends PosKrediKartiOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return KrediKartiIleOdemeDetay }
	static get gridKontrolcuSinif() { return KrediKartiIleOdemeGridci }
	static get sinifAdi() { return 'Kredi Kartı ile Cari Ödeme' }
	static get kodListeTipi() { return 'KKIODE' }
	static get numTipKod() { return 'PSODE' }
	static get almSat() { return 'A' }
}
class KrediKartiIleOdemeDetay extends PosKrediKartiOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		const {liste} = e;
		liste.push(Ext_KrediKartiHesap);
		super.extYapilarDuzenle(e)
	}
}
class KrediKartiIleOdemeGridci extends PosKrediKartiOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
