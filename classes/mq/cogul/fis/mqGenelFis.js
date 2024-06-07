class MQGenelFis extends MQOrtakFis {
	static get listeUISinif() { return FisListePart } static get tanimUISinif() { return FisGirisPart } static get subeKodSaha() { return 'bizsubekod' }
	static get tarihSaha() { return 'tarih' } static get seriSaha() { return 'seri' } static get ozelIsaretDesteklenirmi() { return true } static get noYilKullanilirmi() { return false }
	get yildizlimi() { return this.ozelIsaret == '*' } get kayitIcinOzelIsaretlimi() { return this.yildizlimi }
	get tsn() { return new TicariSeriliNo(this) } set tsn(value) { $.extend(this, { seri: value?.seri || '', noYil: value?.noYil || 0, no: value?.no || 0 }) }
	constructor(e) {
		e = e || {}; super(e);
		if (e.isCopy) return
		const {numYapi} = this.class;
		if (numYapi) this.numarator = numYapi.deepCopy()
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			ozelIsaret: new PInstStr(), subeKod: new PInstStr(),
			tarih: new PInstDateToday(), seri: new PInstStr(), noYil: new PInstNum()
		})
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e;
		secimler.secimTopluEkle({
			ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecim: MQOzelIsaret }),
			sube: new SecimString({ etiket: 'Şube', mfSinif: MQSube }),
			tarih: new SecimDate({ etiket: 'Tarih', basi: today().addDays(-7) }),
			seri: new SecimString({ etiket: 'Seri' }),
			noYil: new SecimInteger({ etiket: 'No Yıl'}),
			fisNo: new SecimInteger({ etiket: 'Belge No' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this, {where, secimler} = e;
			where.birKismi(secimler.ozelIsaret, `${aliasVeNokta}ozelisaret`);
			where.basiSonu(secimler.sube, `${aliasVeNokta}${this.subeKodSaha}`);
			where.basiSonu(secimler.seri, `${aliasVeNokta}${this.seriSaha}`);
			where.basiSonu(secimler.tarih, `${aliasVeNokta}${this.tarihSaha}`);
			where.basiSonu(secimler.noYil, `${aliasVeNokta}noyil`);
			where.basiSonu(secimler.fisNo, `${aliasVeNokta}${this.noSaha}`)
		})
	}
	static secimlerDuzenleSon(e) { super.secimlerDuzenleSon(e) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const {tsnKullanilirmi} = this, {tsnForm, baslikForm} = e.builders; tsnForm.yanYana();
		let tarihFormParent = tsnKullanilirmi ? tsnForm : baslikForm.builders[0];
		if (tsnKullanilirmi) {
			tsnForm.addForm('numarator')
				.setLayout(e => {
					const {builder} = e, {parentParent, inst} = builder;
					let layout = parentParent.find(inst.numarator?.class?.fisGirisLayoutSelector);
					if (!layout?.length) { layout = builder.parent } return layout
				})
				.onInit(e => {
					const {builder} = e, {rootPart, inst, layout, parent} = builder, {numarator} = inst; if (!numarator) { return }
					$(`<label class="_etiket" style="color: #ccc; min-width: 150px; width: 100%; height: 15px;">Seri-No</label>`).prependTo(layout);
					const part = numarator.class.partLayoutDuzenle($.extend({}, e, { islem: rootPart.islem, fis: inst, layout: layout }));
					builder.part = rootPart.numaratorPart = part; layout.removeClass('jqx-hidden basic-hidden'); parent.removeClass('jqx-hidden basic-hidden');
					const {txtNoYil} = part;
					if (txtNoYil?.length) {
						if (inst.class.satismi == inst.class.iademi) { txtNoYil.removeAttr('readonly') }
						else { txtNoYil.attr('readonly', ''); txtNoYil.addClass('readOnly') }
					}
				})
				.addStyle_wh({ width: '450px !important' })
		}
		tarihFormParent.addDateInput({ id: 'tarih', etiket: 'Tarih', placeHolder: 'Fiş Tarih' }).etiketGosterim_normal().addStyle_wh({ width: '130px !important' });
		tarihFormParent.addModelKullan({ id: 'subeKod', mfSinif: MQSube }).dropDown().etiketGosterim_normal().addStyle_wh({ width: '450px !important'})
	}
	static standartGorunumListesiDuzenle(e) {
		const {liste} = e;
		liste.push(this.subeKodSaha, this.tarihSaha, this.seriSaha);
		if (this.noYilKullanilirmi) liste.push('noyil')
		liste.push(this.noSaha, 'ozelisaret');
		super.standartGorunumListesiDuzenle(e)
	}
	static orjBaslikListesiDuzenle_ilk(e) {
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: this.subeKodSaha, text: 'Şube', genislikCh: 9 }),
			new GridKolon({ belirtec: this.tarihSaha, text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: this.seriSaha, text: 'Seri', genislikCh: 8 })
		);
		if (this.noYilKullanilirmi) liste.push(new GridKolon({ belirtec: 'noyil', text: 'Yıl', genislikCh: 8 }).tipNumerik())
		liste.push(
			new GridKolon({ belirtec: this.noSaha, text: 'No', genislikCh: 18 }).tipNumerik(),
			new GridKolon({ belirtec: 'ozelisaret', text: 'İşr', genislikCh: 6 })
		)
		super.orjBaslikListesiDuzenle_ilk(e)
	}
	static raporKategorileriDuzenle_baslik(e) {
		super.raporKategorileriDuzenle_baslik(e);
		const {kat} = e;
		kat.addDetay(
			new RRSahaDegisken({ attr: 'tarih', baslik: 'Tarih', genislikCh: 12, sql: `fis.tarih` }).tipDate(),
			...RRSahaDegisken.getRaporTarihEkSahalari({ sql: 'fis.tarih' }),
			this.ozelIsaretDesteklenirmi ? new RRSahaDegisken({ attr: 'ozelIsaret', baslik: ['Özel', 'İşaret'], genislikCh: 5, sql: `fis.ozelisaret` }) : null,
			new RRSahaDegisken({ attr: 'seri', baslik: 'Seri', genislikCh: 13, sql: `fis.${this.seriSaha}` }).tipNumerik(),
			new RRSahaDegisken({ attr: 'fisNo', baslik: ['Fiş', 'No'], genislikCh: 13, sql: `fis.${this.noSaha}` }).tipNumerik(),
			new RRSahaDegisken({ attr: 'fisSeriVeNo', baslik: ['Birleşik', 'Fiş No'], genislikCh: 18, sql: `fis.fisnox` }).alignRight()
		)
	}
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e);
		const {sent} = e;
		sent.fis2SubeBagla()
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.where.add(`${aliasVeNokta}silindi = ''`)
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e);
		const {hv} = e;
		hv[this.class.subeKodSaha] = this.subeKod || '';
		hv[this.class.seriSaha] = this.seri || '';
		if (this.class.noYilKullanilirmi) {
			const {noYil} = this;
			if (noYil != null)
				hv.noyil = noYil
		}
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e;
		const {tarih} = this;
		if (this.class.ozelIsaretDesteklenirmi)
			hv.ozelisaret = this.ozelIsaret
		hv[this.class.tarihSaha] = (tarih ? asDate(tarih) : null)
	}
	setValues(e) {
		super.setValues(e);
		const {rec} = e;
		if (this.class.ozelIsaretDesteklenirmi)
			this.ozelIsaret = rec.ozelisaret
		this.subeKod = rec[this.class.subeKodSaha] || null;
		this.tarih = asDate(rec[this.class.tarihSaha]) || null,
		this.seri = rec[this.class.seriSaha] || '';
		if (this.class.noYilKullanilirmi)
			this.noYil = rec.noyil
	}
	uiDuzenle_fisGiris(e) {
		super.uiDuzenle_fisGiris(e);
		if (this.class.ozelIsaretDesteklenirmi)
			this.ozelIsaretDegisti(e)
	}
	ozelIsaretDegisti(e) {
		const {layout} = e.sender || e.parentPart;
		const {ozelIsaret} = this;
		layout.attr('data-ozelisaret', ozelIsaret || '')
	}
}
