class MQEIslSHRef extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return MQEIslSHRefDetay }
	// static get listeUISinif() { return FisListePart }
	// static get tanimUISinif() { return FisGirisPart }
	static get tanimUISinif() { return ModelTanimPart }
	static get sinifAdi() { return 'e-İşlem SH Referansı' }
	static get kodListeTipi() { return 'EISLSHREF' }
	static get table() { return 'efref2shfis' }
	static get tableAlias() { return 'fis' }
	static get sayacSaha() { return 'kaysayac' }
	static get kodSaha() { return 'mustkod' }

	static get mustKod2Inst() {
		const {globals} = this;
		let result = globals.mustKod2Inst;
		if (result === undefined)
			result = globals.mustKod2Inst = {}
		return result
	}
	static set mustKod2Inst(value) { this.globals.mustKod2Inst = value }
	
	static get mustKod2Tip2Deger2Detay() {
		const {globals} = this;
		let result = globals.mustKod2Tip2Deger2Detay;
		if (result === undefined)
			result = globals.mustKod2Tip2Deger2Detay = {}
		return result
	}
	static set mustKod2Tip2Deger2Detay(value) { this.globals.mustKod2Tip2Deger2Detay = value }
	
	get tip2Deger2Detay() {
		let result = this._tip2Deger2Detay;
		if (result == null) {
			const {mustKod} = this;
			if (mustKod)
				result = _tip2Deger2Detay = this.class.mustKod2Tip2Deger2Detay[mustKod]
		}
		return result
	}

	constructor(e) {
		e = e || {};
		super(e);
		let tip2Deger2Detay = this._tip2Deger2Detay = e._tip2Deger2Detay || {};
		for (const key of ['kod', 'barkod']) {
			if (!tip2Deger2Detay[key])
				tip2Deger2Detay[key] = {}
		}
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			mustKod: new PInstStr('mustkod')
		})
	}
	static rootFormBuilderDuzenle(e) {
		const header_height = 65;
		const header_margin_top = 10;
		const header_margin_bottom = 18;
		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent();
		form.addStyle_fullWH({ height: `${header_height}px` })
		form.addStyle(e => `$elementCSS { margin-top: ${header_margin_top}px; margin-bottom: ${header_margin_bottom}px !important }`);
		form.addModelKullan({ id: 'mustKod', mfSinif: MQCari }).comboBox();
			/*.onAfterRun(e => {
				const {part} = e.builder;
				setTimeout(part => part.focus(), 10, part);
				setTimeout(part => part.select(), 1000, part)
			});*/
		
		form = tanimForm.addFormWithParent().addStyle_fullWH({ height: `calc(var(--full) - (${header_height + header_margin_top + header_margin_bottom}px + 10px))` });
		form.addGridliGiris({
			id: 'detayGrid',
			tabloKolonlari: e => {
				const {builder} = e;
				const {tip2MFSinif} = MQSHTip;
				return [
					new GridKolon({
						belirtec: 'efTipi', text: 'e-Tip', genislikCh: 10,
						cellClassName: 'bold'
					}).tipTekSecim({
						tekSecimSinif: EIslMusRefDetayTip,
						kodGosterilmesin: true
					}),
					new GridKolon({
						belirtec: 'efAnahtar', text: 'e-İşlem Değer', genislikCh: 60
					}),
					new GridKolon({
						belirtec: 'shTip', text: 'Tip', genislikCh: 10,
						cellClassName: 'bold',
						cellValueChanged: e => {
							/* e: { owner, datafield, rowindex, oldvalue, newvalue } */
							e = e.args || e;
							const gridWidget = e.owner;
							const tip = e.newvalue;
							let rec = gridWidget.getrowdata(e.rowindex, e.datafield);
							const {uid} = rec;
							// const colDef = builder.part.belirtec2Kolon.sh;
							// colDef.mfSinif = ;
							rec.shKod = rec.shAdi = null;
							//gridWidget.beginupdate();
							gridWidget.updaterow(uid, rec);
							//gridWidget.endupdate(false)
						}
					}).alignCenter()
						.tipTekSecim({ tekSecimSinif: MQSHTip, kodGosterilmesin: true }),
					MQKA.getGridKolonGrup({
						belirtec: 'sh', adiEtiket: 'Stok/Hizmet/Demirbaş', genislikCh: 45,
						mfSinif: e =>
							tip2MFSinif[((e.rec || {}).shTip || {}).char || 'stok']
					})
				]
			},
			source: e => e.builder.altInst.detaylar
		}).setDetaySinif(this.detaySinif)
		.widgetArgsDuzenleIslemi(e => {
			$.extend(e.args, {
				sortable: false, groupable: false
			})
		})
		.onAfterRun(e => {
			const {part} = e.builder;
			setTimeout(part => {
				part.focus();
				const {gridWidget} = part;
				// gridWidget.addrow(null, part.newRec());
				const rowCount = gridWidget.getdatainformation().rowscount || 1;
				part.gridWidget.selectcell(rowCount - 1, 'shKod')
			}, 10, part)
		});
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);

		const {secimler} = e;
		secimler.secimTopluEkle({
			mustKod: new SecimString({ etiket: MQCari.sinifAdi, mfSinif: MQCari }),
			mustUnvan: new SecimOzellik({ etiket: 'Cari Ünvan' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.mustKod, `${aliasVeNokta}mustkod`);
			where.ozellik(secimler.mustUnvan, `car.birunvan`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		
		const {liste} = e;
		liste.push('mustkod', 'mustunvan')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 36, sql: 'car.birunvan' })
		)
	}
	
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('carmst car', `${aliasVeNokta}mustkod = car.must`)
		// sent.where.addAll(`${aliasVeNokta}silindi = ''`);
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e);
		const {hv} = e;
		hv.mustkod = this.mustKod
	}
	/*keySetValues(e) {
		super.keySetValues(e);
		const {rec} = e;
		this.mustKod = rec.mustkod
	}*/

	uiKaydetOncesiIslemler(e) {
		super.uiKaydetOncesiIslemler(e);
		let {detaylar} = this;
		detaylar = this.detaylar = detaylar.filter(det => det.bosDegilmi)
	}
	
	static async getMustKod2Inst(e) {
		const {mustKod2Inst} = this;
		const mustKod = typeof e == 'object' ? e.mustKod || e.kod : e;
		let result = mustKod2Inst[mustKod];
		if (result === undefined) {
			result = null;
			const inst = new this({ mustKod: mustKod });
			if (await inst.yukle())
				result = inst
			mustKod2Inst[mustKod] = result
		}
		return result
	}
	uygunDetay(e) {
		const {detaylar} = this;
		if ($.isEmptyObject(detaylar))
			return null
		for (const det of detaylar) {
			if (det.uygunmu(e))
				return det
		}
		return null
	}
}
