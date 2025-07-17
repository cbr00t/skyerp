class MQGenelFis extends MQOrtakFis {
	static get listeUISinif() { return FisListePart } static get tanimUISinif() { return FisGirisPart } static get subeKodSaha() { return 'bizsubekod' }
	static get tarihSaha() { return 'tarih' } static get seriSaha() { return 'seri' } static get ozelIsaretDesteklenirmi() { return true } static get noYilKullanilirmi() { return false }
	get yildizlimi() { return this.ozelIsaret == '*' } get kayitIcinOzelIsaretlimi() { return this.yildizlimi }
	get tsn() { return new TicariSeriliNo(this) } set tsn(value) { $.extend(this, { seri: value?.seri || '', noYil: value?.noYil || 0, no: value?.no || 0 }) }
	constructor(e) {
		e = e || {}; super(e);
		if (e.isCopy) { return }
		const {numYapi} = this.class; if (numYapi) { this.numarator = numYapi.deepCopy() }
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
		e = e || {}; super.rootFormBuilderDuzenle(e); this.rootFormBuilderDuzenle_numarator(e);
		let {tsnKullanilirmi} = this, {tsnForm, baslikForm} = e.builders;
		let tarihFormParent = tsnKullanilirmi ? tsnForm : baslikForm.builders[0];
		tarihFormParent.addDateInput({ id: 'tarih', etiket: 'Tarih', placeHolder: 'Fiş Tarih' }).etiketGosterim_normal().addStyle_wh({ width: '130px !important' });
		tarihFormParent.addModelKullan({ id: 'subeKod', mfSinif: MQSube }).dropDown().etiketGosterim_normal().addStyle_wh({ width: '450px !important'})
	}
	static rootFormBuilderDuzenle_numarator(e) {
		e = e || {}; let {tsnKullanilirmi} = this, {tsnForm} = e.builders; tsnForm.yanYana(); if (!tsnKullanilirmi) { return }
		tsnForm.addForm('numarator')
			.setLayout(({ builder: fbd }) => {
				const {parentParent, inst: fis} = fbd, {fisGirisLayoutSelector: selector} = fis.numarator?.class ?? {};
				let layout = selector ? parentParent.find(selector) : null;
				return layout?.length ? layout : fbd.parent
			})
			.onInit(({ builder: fbd }) => {
				const {rootPart, inst: fis, layout, parent} = fbd, {numarator} = fis; if (!numarator) { return }
				let {islem} = rootPart, part = numarator.class.partLayoutDuzenle({ ...e, islem, fis, layout });
				fbd.part = rootPart.numaratorPart = part;
				if (fis.class.numaratorGosterilirmi) {
					$(`<label class="_etiket" style="color: #ccc; min-width: 150px; width: 100%; height: 15px;">Seri-No</label>`).prependTo(layout);
					layout.removeClass('jqx-hidden basic-hidden'); parent.removeClass('jqx-hidden basic-hidden');
					let {txtNoYil} = part; if (txtNoYil?.length) {
						if (fis.class.satismi == fis.class.iademi) { txtNoYil.removeAttr('readonly') }
						else { txtNoYil.attr('readonly', ''); txtNoYil.addClass('readOnly') }
					}
				}
			})
			.addStyle_wh({ width: '450px !important' })
	}
	static standartGorunumListesiDuzenle({ liste }) {
		liste.push(this.subeKodSaha, this.tarihSaha, this.seriSaha);
		if (this.noYilKullanilirmi) { liste.push('noyil') }
		liste.push(this.noSaha, 'ozelisaret');
		super.standartGorunumListesiDuzenle(...arguments)
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
	static raporQueryDuzenle({ sent }) { super.raporQueryDuzenle(...arguments); sent.fis2SubeBagla() }
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {aliasVeNokta} = this, {where: wh} = sent;
		wh.add(`${aliasVeNokta}silindi = ''`)
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		$.extend(result, { bizsubekod: 'xbizsubekod', tarih: 'xtarih', seri: 'xseri' })
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		$.extend(hv, { xbizsubekod: this.subeKod || '', xtarih: this.tarih, xseri: this.seri || '' })
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments); const {subeKodSaha, seriSaha, noYilKullanilirmi} = this.class;
		/*hv[subeKodSaha] = this.subeKod || '';*/
		hv[seriSaha] = this.seri || '';
		if (noYilKullanilirmi) { let {noYil} = this; if (noYil != null) { hv.noyil = noYil } }
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); const {tarih} = this, {ozelIsaretDesteklenirmi, tarihSaha} = this.class;
		if (ozelIsaretDesteklenirmi) { hv.ozelisaret = this.ozelIsaret }
		hv[tarihSaha] = (tarih ? asDate(tarih) : null)
	}
	setValues({ rec }) {
		super.setValues(...arguments); const {ozelIsaretDesteklenirmi, subeKodSaha, tarihSaha, seriSaha, noYilKullanilirmi} = this.class;;
		if (this.class.ozelIsaretDesteklenirmi) { this.ozelIsaret = rec.ozelisaret }
		$.extend(this, { subeKod: rec[subeKodSaha] || null, tarih: asDate(rec[tarihSaha]) || null, seri: rec[seriSaha] || '' })
		if (noYilKullanilirmi) { this.noYil = rec.noyil }
	}
	uiDuzenle_fisGiris(e) {
		super.uiDuzenle_fisGiris(e);
		if (this.class.ozelIsaretDesteklenirmi) { this.ozelIsaretDegisti(e) }
	}
	ozelIsaretDegisti({ sender, parentPart }) {
		const {layout} = sender || parentPart, {ozelIsaret} = this;
		layout.attr('data-ozelisaret', ozelIsaret || '')
	}
}
