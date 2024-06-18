class MQStok extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Stok' } static get table() {return 'stkmst'} static get tableAlias() { return 'stk' } static get stokmu() { return true }
	static get kodListeTipi() {return 'STK'} static get ayrimTipKod() { return 'STAYR' } static get ayrimTableAlias() { return 'sayr' } static get ozelSahaTipKod() { return 'STK' }
	static get zeminRenkDesteklermi() { return true }

	constructor(e) { e = e || {}; super(e) }
	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e); const {liste} = e; $.extend(liste, {
			genel: MQStokGenel, diger: MQStokDiger, diger2: MQStokDiger2,
			barkodMuh: MQStokBarkodMuh, uretim: MQStokUretim
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e)
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		liste.push('brm', 'grupAciklama', 'satfiyat1', 'almfiyat')
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski(`stkgrup stkg`, `${aliasVeNokta}grupkod = stkg.kod`);
		sent.fromIliski(`stkanagrup agrp`, `agrp.kod = stkg.anagrupkod`);
		sent.fromIliski(`stkistgrup igrp`, `${aliasVeNokta}sistgrupkod = igrp.kod`);
		sent.fromIliski(`stkistanagrup aigrp`, `igrp.sanagrupkod=aigrp.kod`);
		sent.fromIliski(`stkmensei men`, `${aliasVeNokta}menseikod = men.kod`);
		sent.fromIliski(`stkgtip gtip`, `${aliasVeNokta}gtipkod = gtip.kod`);
		sent.fromIliski(`yukgrup ygrp`, `${aliasVeNokta}yukgrupkod = ygrp.kod`);
		sent.fromIliski(`stkmensei smen`, `${aliasVeNokta}menseikod = smen.kod`)
	}

	static getGridKolonGrup_brmli(e) {
		const kolonGrup = this.getGridKolonGrup(e);
		if (!kolonGrup)
			return kolonGrup
		const {tabloKolonlari} = kolonGrup;
		tabloKolonlari.push(new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4 }).readOnly());
		kolonGrup.stmDuzenleyiciEkle(e => {
			const {aliasVeNokta} = this;
			e.stm.sentDo(sent => {
				sent.sahalar
					.add(`${aliasVeNokta}brm`);
			})
		});
		kolonGrup.degisince(e => {
			e.rec.then(rec =>
				e.setCellValue({ belirtec: 'brm', value: rec.brm || '' }))
		});
		return kolonGrup
	}
}
class MQStokAlt extends MQAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQStokGenel extends MQStokAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); this.birim = e.birim || 'AD' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			aktifmi: new PInstTrue('calismadurumu'), satilamazmi: new PInstBool('satilamazfl'), aciklama2: new PInstStr('aciklama2'),
			birim: new PInstStr('brm'), birim2: new PInstStr('brm2'),
			brmOrani: new PInstNum('brmorani'), tip: new PInstTekSecim('tipi', StokTip), grupKod: new PInstStr('grupkod'), sIstGrupKod: new PInstStr('sistgrupkod'),
			brutAgirlik: new PInstNum('brutagirlik'), netAgirlik: new PInstNum('netagirlik'), dvKod: new PInstStr('dvkod'),
			alimFiyat: new PInstNum('almfiyat'), alimNetFiyat: new PInstNum('almnetfiyat'), alimDvFiyat: new PInstNum('dvalmfiyat'),
			almStopajHesapKod: new PInstStr('almstopajhesapkod'), almKdvHesapKod: new PInstStr('almkdvhesapkod'),
			satKdvHesapKod: new PInstStr('satkdvhesapkod'), satTevHesapKod: new PInstStr('sattevhesapkod')
		})
		const fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1;
		for (let i = 1; i <= fiyatSayi; i++) { pTanim[`satFiyat${i}`] = new PInstNum(`satfiyat${i}`); pTanim[`dvFiyat${i}`] = new PInstNum(`dvfiyat${i}`) }
	}
	static ekCSSDuzenle(e) {
		const {rec, result} = e;
		if (!asBool(rec.calismadurumu)) { result.push('bg-lightgray', 'iptal') }
		else if (asBool(rec.satilamazfl)) { result.push('bg-lightred') }
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this; mfSinif.formBuilder_addTabPanelWithGenelTab(e);
		const tabPage_genel = e.tabPage_genel; tabPage_genel.setAltInst(e => e.builder.inst.genel);
		let form = tabPage_genel.addFormWithParent().yanYana(4);
		// form.addTextInput({ id: 'aciklama', etiket: 'Adı', maxLength: 100}).addStyle(e => `$elementCSS { max-width: 550px }`);
		form.addTextInput({ id: 'aciklama2',	etiket: 'Adı 2', maxLength: 100}).addStyle(e => `$elementCSS { max-width: 550px }`);
		form.addModelKullan({ id: 'tip', etiket: 'Stok Tip', source: e => StokTip.instance.kaListe}).noMF().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 200px }`);
		form.addModelKullan({ id: 'grupKod', etiket: 'Stok Grup', mfSinif: MQStokGrup }).etiketGosterim_normal().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 200px }`);
		form.addModelKullan({ id: 'sIstGrupKod', etiket: 'İstatistik Grup', mfSinif: MQStokIstGrup }).etiketGosterim_normal().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 200px }`);
		form.addCheckBox({ id: 'aktifmi', etiket: 'Aktif' }).addStyle([ e => `$elementCSS > label { color: forestgreen; padding: 0 8px }`, e => `$elementCSS > input:checked + label { font-weight: bold }` ]);
		form.addCheckBox({ id: 'satilamazmi', etiket: 'SatılMAZ' }).addStyle([ e => `$elementCSS > label { color: firebrick; padding: 0 8px }`, e => `$elementCSS > input:checked + label { font-weight: bold; color: whitesmoke; background-color: darkred }` ]);
		form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'birim', etiket: 'Birim',	source: app.params.stokBirim.brmColl}).dropDown().kodsuz().noMF().addStyle(e => `$elementCSS { max-width: 50px }`);
		form.addModelKullan({ id: 'birim2', etiket: 'Birim-2', source: app.params.stokBirim.brmColl}).dropDown().kodsuz().noMF().addStyle(e => `$elementCSS { max-width: 50px }`);
		form.addNumberInput({ id: 'brmOrani', etiket: 'Birim Oranı', maxLength: 10}).addStyle(e => `$elementCSS { max-width: 70px }`);
		form.addNumberInput({ id: 'brutAgirlik',	etiket: 'Brüt Ağırlık ( KG )' ,maxLength: 10}).addStyle(e => `$elementCSS { max-width: 200px }`);
		form.addNumberInput({ id: 'netAgirlik', etiket: 'Net Ağırlık ( KG )', maxLength: 10}).addStyle(e => `$elementCSS { max-width: 200px }`);
		form.addModelKullan({ id: 'dvKod', mfSinif: MQDoviz}).etiketGosterim_normal().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 200px }`);
		const tabPanel_fiyat = tabPage_genel.addTabPanel({ id: 'fiyatTabs' });
		const tabPage_satisFiyat = tabPanel_fiyat.addTab({ id: 'satis', etiket: 'Satış' }).addStyle(e => `$elementCSS { height: max-content !important; padding-bottom: 0 !important }`);
		form = tabPage_satisFiyat.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'satKdvHesapKod', etiket: 'KDV', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) { sent.where.add(`${aliasVeNokta}ba='A'`, `${aliasVeNokta}vergitipi='KDV'`, `${aliasVeNokta}alttip=''`) }
		}).addStyle_wh({ width: '500px !important' });
		form.addModelKullan({ id: 'satTevHesapKod', etiket: 'Tevfikat', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) { sent.where.add(`${aliasVeNokta}ba='B'`, `${aliasVeNokta}vergitipi='KTEV'`) }
		}).addStyle_wh({ width: '500px !important' });
		const gridBedelAtayici_satis = e => {
			const {args, builder} = e, {rowindex, owner} = args, rec = owner.getrowdata(rowindex) || {}, dovizmi = args.datafield == 'dvBedel';
			const ioAttr = rec[dovizmi ? 'ioAttr_dv' : 'ioAttr_tl'];			// ioAttr = ( satFiyat1  veya  dvFiyat1  gibi )
			if (ioAttr) {
				const bedel = args.newvalue, {altInst} = builder;
				if (altInst) {
					const pInst = (altInst._p || {})[ioAttr];
					if (pInst) { pInst.value = bedel } else { altInst[ioAttr] = bedel }
				}
			}
		};
		form = tabPage_satisFiyat.addFormWithParent().setAltInst(e => e.builder.inst.genel).addStyle(e => `$elementCSS { width: 650px !important; height: 185px !important }`);
		form.addGrid({
			id:'satFiyatGrid', tabloKolonlari: [
				new GridKolon({ belirtec: 'etiket', text: 'Fiyat Listesi', genislikCh: 14 }).readOnly(),
				new GridKolon({ belirtec: 'dvBedel', text: 'Doviz', genislikCh: 16, cellValueChanged: e => { gridBedelAtayici_satis(e) } }).tipDecimal_fiyat(),
				new GridKolon({ belirtec: 'tlBedel', text: 'TL', genislikCh: 16, cellValueChanged: e => { gridBedelAtayici_satis(e) } }).tipDecimal_fiyat(),
			],
			source: e => {
				const {altInst} = e.builder, fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1; let recs = [];
				for (let i = 1; i <= fiyatSayi; i++) {
					const ioAttrYapi = { tl: `satFiyat${i}`, dv: `dvFiyat${i}` };
					recs.push({ etiket: `Sat Fiyat ${i}`, ioAttr_tl: ioAttrYapi.tl, ioAttr_dv: ioAttrYapi.dv, tlBedel: altInst[ioAttrYapi.tl], dvBedel: altInst[ioAttrYapi.dv] })
				}
				/*recs = [
					{ ioAttr: 'falanca', etiket: 'falanca başlık', veri: 123 },
					{ ioAttr: 'falanca2', etiket: 'falanca başlık 2', veri: 123 },
					{ ioAttr: 'brmOrani', etiket: 'brm oranı', veri: altInst.brmOrani }
				]*/
				return recs
			}
			
		}).gridliGiris().addStyle_fullWH();
		const gridBedelAtayici_alim = e => {
			const {args, builder} = e, {rowindex, owner} = args, rec = owner.getrowdata(rowindex) || {}, {ioAttr} = rec;
			if (ioAttr) {
				const bedel = args.newvalue, {altInst} = builder;
				if (altInst) {
					const pInst = (altInst._p || {})[ioAttr];
					if (pInst) { pInst.value = bedel } else { altInst[ioAttr] = bedel }
				}
			}
		};
		const tabPage_alimFiyat = tabPanel_fiyat.addTab({ id: 'alim', etiket: 'Alım' }).setAltInst(e => e.builder.inst.genel).addStyle(e => `$elementCSS { height: max-content !important; padding-bottom: 0 !important }`);
		form = tabPage_alimFiyat.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'almKdvHesapKod', etiket: 'KDV', mfSinif: MQVergi}).dropDown().kodsuz()
			.ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) { sent.where.add(`${aliasVeNokta}ba = 'B'`, `${aliasVeNokta}vergitipi = 'KDV'`, `${aliasVeNokta}alttip = ''`) }
			}).addStyle_wh({ width: '500px !important' });
		form.addModelKullan({ id: 'almStopajHesapKod', etiket: 'Stopaj', mfSinif: MQVergi}).dropDown().kodsuz()
			.ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) { sent.where.add(`${aliasVeNokta}ba='A'`, `${aliasVeNokta}vergitipi='STO'`) }
			}).addStyle_wh({ width: '500px !important' });
		form = tabPage_alimFiyat.addFormWithParent().setAltInst(e => e.builder.inst.genel).addStyle(e => `$elementCSS { width: 400px !important; height: 180px !important }`);
		form.addGrid({
			id: 'alimFiyatGrid',
			tabloKolonlari: [
				new GridKolon({ belirtec: 'etiket', text: 'Fiyat Listesi', genislikCh: 14 }).readOnly(),
				new GridKolon({ belirtec: 'veri', text: 'Bedel', genislikCh: 16, cellValueChanged: e => { gridBedelAtayici_alim(e) } }).tipDecimal_fiyat()
			],
			source: e => {
				const {altInst} = e.builder; return [
					{ ioAttr: 'alimFiyat', etiket: `Alım Fiyat`, veri: altInst.alimFiyat },
					{ ioAttr: 'alimNetFiyat', etiket: `Alım Net Fiyat`, veri: altInst.alimNetFiyat },
					{ ioAttr: 'alimDvFiyat', etiket: `Alım Dv. Fiyat`, veri: altInst.alimDvFiyat }
				]
			}
		}).gridliGiris().addStyle_fullWH()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({
			calismaDurumu: new SecimTekSecim({ etiket: 'Çalışma Durumu', tekSecimSinif: CalismaDurumu }),
			satilmaDurumu: new SecimTekSecim({ etiket: 'Satılma Durumu', tekSecimSinif: SatilmaDurumu })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, secimler = e.secimler;
			wh.add(sec.calismaDurumu.tekSecim.getBoolClause(`${aliasVeNokta}calismadurumu`));
			wh.add(sec.satilmaDurumu.tekSecim.getTersBoolClause(`${aliasVeNokta}satilamazfl`))
		})
	}
	static orjBaslikListesiDuzenle(e) {
		const {liste} = e, fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1;
		for (let i = 1; i <= fiyatSayi; i++) {
			liste.push(
				new GridKolon({ belirtec: `satfiyat${i}`, text: `Satış Fiyat ${i}`, genislikCh: 17 }).tipDecimal_fiyat(),
				new GridKolon({ belirtec: `dvfiyat${i}`, text: `Dv. Fiyat ${i}`, genislikCh: 17 }).tipDecimal_dvFiyat()
			)
		}
		liste.push(
			new GridKolon({ belirtec: 'aciklama2', text: 'Açıklama-2', genislikCh: 20 }),
			new GridKolon({ belirtec: 'tipi', text: 'Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'calismadurumu', text: 'Aktif?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'satilamazfl', text: 'Satılmaz?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'grupAciklama', text: 'Grup Açıklama', genislikCh: 15, sql:'stkg.aciklama' }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 5, sql: 'stkg.anagrupkod' }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }),
			new GridKolon({ belirtec: 'sistgrupkod', text: 'İstatistik Grup', genislikCh: 5 }),
			new GridKolon({ belirtec: 'sistgrupadi', text: 'İstatistik Grup Adı', genislikCh: 20, sql: 'igrp.aciklama' }),
			new GridKolon({ belirtec: 'sistanagrupkod', text: 'İst. Ana Grup', genislikCh: 5, sql: 'igrp.sanagrupkod' }),
			new GridKolon({ belirtec: 'sistanagrupadi', text: 'İst. Ana Grup Adı', genislikCh: 20, sql: 'aigrp.aciklama' }),
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 6 }),
			new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 6 }),
			new GridKolon({ belirtec: 'brmorani', text: 'Birim Oranı', genislikCh: 5}).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'brutagirlik', text: 'Brüt Ağırlık', genislikCh: 10 }),
			new GridKolon({ belirtec: 'netagirlik', text: 'Net Ağırlık', genislikCh: 10 }),
			new GridKolon({ belirtec: 'dvkod', text: 'Dv Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'almfiyat', text: 'Alım Fiyat', genislikCh: 20  }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'almnetfiyat', text: 'Alım Net Fiyat', genislikCh: 20 }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'dvalmfiyat', text: 'Alım Dv. Fiyat', genislikCh: 20 }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'satkdvdegiskenmi', text: 'Satış KDV Değişken?', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'almkdvdegiskenmi', text: 'Alım KDV Değişken?', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'satkdvhesapkod', text: 'Satış KDV Hesap Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'satstopajhesapkod', text: 'Satış Stopaj Hesap Kod', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'sattevhesapkod', text: 'Satış Tevfikat Hesap Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'almkdvhesapkod', text: 'Alım KDV Hesap Kod', genislikCh: 5 })
		);
	}
}
class MQStokDiger extends MQStokAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			tavsiyeYerKod: new PInstStr('tavsiyeyerkod'), yukGrupKod: new PInstStr('yukgrupkod'), tevkifatdanMuaftir: new PInstBool('tevkifatdanmuaftir'),
			toptanaEsasmi: new PInstBool('toptanaesasmi'), gTipKod: new PInstStr('gtipkod'), dagitimaEsasFiyatFarkimi: new PInstBitBool('bdagesasfiyatfarki'),
			dagitimaEsasMasrafmi: new PInstBitBool('bdagesasmasraf'), uretDepKod: new PInstStr('uretdepkod')
		})
	}
	static rootFormBuilderDuzenle(e){
		e = e || {}; const {mfSinif} = this, {tabPanel} = e;
		let tabPage = tabPanel.addTab({ id: 'diger', etiket: 'Diger' });
		tabPage.setAltInst(e => e.builder.inst.diger);
		let form = tabPage.addFormWithParent().yanYana(5).addStyle(e => `$elementCSS {box-shadow:5px 5px 20px cadetblue}`);
		form.addModelKullan({ id: 'tavsiyeYerKod', etiket: 'Tavsiye Yer', mfSinif: MQStokYer}).etiketGosterim_normal().dropDown().kodsuz();
		form.addModelKullan({ id: 'yukGrupKod', etiket: 'Yükleme Grup', mfSinif: MQYukGrup}).etiketGosterim_normal().dropDown().kodsuz();
		form.addCheckBox({ id: 'tevkifatdanMuaftir', etiket: 'Tevkifatdan Muafdır' });
		form.addModelKullan({ id: 'uretDepKod', etiket: 'Mal Departman', mfSinif: MQStokDepartman}).etiketGosterim_normal().dropDown().kodsuz();
		form.addCheckBox({ id: 'toptanaEsasmi', etiket: 'Topdan Alım/Satış İçin Kullanılır' });
		form.addModelKullan({ id: 'gTipKod', etiket: 'GTIP', mfSinif: MQGTip}).etiketGosterim_normal().dropDown().kodsuz();
		tabPage.addBaslik({ etiket: 'Rayiç Bedel' });
		form = tabPage.addFormWithParent().yanYana(4);
		form.addCheckBox({ id: 'bDagEsasFiyatFarki', etiket: 'Fiyat Farkı' });
		form.addCheckBox({ id: 'bDagEsasMasraf', etiket: 'Masraf' });
	}
	static orjBaslikListesiDuzenle(e){
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tavsiyeyerkod', text: 'Tavsiye Yer', genislikCh: 5 }),
			new GridKolon({ belirtec: 'tevkifatdanmuaftir', text: 'Tevfikatdan Muafdır', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'uretdepkod', text: 'Mal Departman', genislikCh: 8 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {sent} = e;
		sent.fromIliski('stkgrup sgrp', `${aliasVeNokta}grupkod = sgrp.kod`);
		sent.fromIliski('stkistgrup sigrp', `${aliasVeNokta}sistgrupkod = sigrp.kod`);
		sent.fromIliski('stkyer yer', `${aliasVeNokta}tavsiyeyerkod = yer.kod`);
		sent.fromIliski('vergihesap sver', `${aliasVeNokta}satkdvhesapkod = sver.kod`);
		sent.fromIliski('vergihesap aver', `${aliasVeNokta}almkdvhesapkod = aver.kod`);
		sent.fromIliski('vergihesap asver', `${aliasVeNokta}almstopajhesapkod = asver.kod`);
		sent.sahalar.add(`${aliasVeNokta}calismadurumu`, `${aliasVeNokta}satilamazfl`)
	}
}
class MQStokDiger2 extends MQStokAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			ureticiBarkod: new PInstStr('ureticibarkod'), oemKodu: new PInstStr('oemkodu'), menseiKod: new PInstStr('menseikod'), mensei: new PInstStr('mensei'),
			ithalatciFirma: new PInstStr('ithalatcifirma'), tedarikSekli: new PInstTekSecim('tedariksekli', TedarikSekli), ekBilgi: new PInstStr()
		})
	}
	static rootFormBuilderDuzenle(e){
		e = e || {}; const {mfSinif} = this, {tabPanel} = e, tabPage = tabPanel.addTab({ id: 'diger2', etiket: 'Diger2' });
		tabPage.setAltInst(e => e.builder.inst.diger2);
		let form = tabPage.addFormWithParent().yanYana(5).addStyle(e => `$elementCSS {box-shadow:5px 5px 20px cadetblue}`);
		form.addTextInput({ id: 'ureticiBarkod', etiket: 'Üretici Barkod', maxLength: 24}).addStyle(e => `$elementCSS { max-width: 260px }`);
		form.addTextInput({ id: 'oemKodu', etiket: 'OEM Kodu', maxLength: 25}).addStyle(e => `$elementCSS { max-width: 260px }`);
		form.addModelKullan({ id: 'menseiKod', etiket: 'Stok Menşei', mfSinif: MQStokMensei}).etiketGosterim_normal().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 320px }`);
		form.addTextInput({ id: 'mensei', etiket: 'Menşei-Eski', maxLength: 100}).addStyle(e => `$elementCSS { max-width: 320px }`);
		form.addTextInput({ id: 'ithalatciFirma', etiket: 'İthalatçı Firma', maxLength: 100}).addStyle(e => `$elementCSS { max-width: 320px }`);
		form.addModelKullan({ id: 'tedarikSekli', etiket: 'Tedarik Şekli', source: e => e?.builder?.altInst?.tedarikSekli?.kaListe }).etiketGosterim_normal().dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 320px }`);
		form = tabPage.addFormWithParent();
		form.addTextArea({ id: 'ekBilgi', etiket: 'Ek Bilgi', rows: 5 })
	}
	static loadServerData_queryDuzenle(e) {
		const {tableAlias, aliasVeNokta} = MQStok, {sent} = e;
		sent.leftJoin({ alias: tableAlias, from: 'stkmemo mem', iliski: `${aliasVeNokta}kod = mem.stokkod` });
		sent.sahalar.add('mem.memo ekbilgi')
	}
	setValues(e) {
		super.setValues(e); const {rec} = e;
		$.extend(this, { ekBilgi: rec.ekbilgi || '' })
	}
	async kaydetSonrasiIslemler(e) {
		const table = 'stkmemo', {inst, ekBilgi} = this, stokKod = inst.kod;
		const wh = { degerAta: stokKod, saha: 'stokkod' };
		let toplu = new MQToplu();
		if (ekBilgi) {
			toplu.add(
				`IF EXISTS (`, new MQSent({ from: table, where: wh, sahalar: ['*'] }), `) `,
				new MQIliskiliUpdate({ from: table, where: wh, set: { degerAta: ekBilgi, saha: 'memo' } }),
				`ELSE `, new MQInsert({ table: table, hv: { stokkod: stokKod, memo: ekBilgi } })
			)
		}
		else { toplu.add(new MQIliskiliDelete({ from: table, where: wh })) }
		return !!await app.sqlExecNone(toplu)
	}
	static orjBaslikListesiDuzenle(e){
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'oemkodu', text: 'OEM Kodu', genislikCh: 15 }),
			new GridKolon({ belirtec: 'menseikod', text: 'Menşei Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'menseiadi', text: 'Menşei Adi', genislikCh: 20, sql: 'men.aciklama' }),
			new GridKolon({ belirtec: 'ithalatcifirma', text: 'İthalatçı Firma', genislikCh: 15 }),
			new GridKolon({ belirtec: 'tedariksekli', text: 'Tedarik Şekli Kod', genislikCh: 5 })
		)
	}
}
class MQStokBarkodMuh extends MQStokAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		this.barkodReferanslari = e.barkodReferanslari || []
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			stokHes: new PInstStr('stokhes'),
			uretKullanHes: new PInstStr('uretkullanhes'),
			satMalHes: new PInstStr('satmalhes'),
			hamSatisMalHes: new PInstStr('hamsatismalhes'),
			icSatisGelirHes: new PInstStr('icsatisgelirhes'),
			icSatisIadeHes: new PInstStr('icsatisiadehes') 
		})
	}
	static rootFormBuilderDuzenle(e){
		e = e || {}; const {mfSinif} = this, {tabPanel} = e, muhGrid_height = 275;
		let tabPage = tabPanel.addTab({ id: 'barkodmuh', etiket: 'BarkodMuh' }).setAltInst(e => e.builder.inst.barkodMuh);
		let form = tabPage.addFormWithParent().addStyle_fullWH({ height: `${muhGrid_height}px` });
		const colDef_muhHesap = MQMuhHesap.getGridKolonGrup({ belirtec: 'muhHesap', adiEtiket: 'Muh. Hesap', kodAttr: 'kod', adiAttr: 'aciklama' });
		colDef_muhHesap.degisince(e => {
			const {rowindex, owner} = e.args, rec = owner.getrowdata(rowindex), {ioAttr} = rec || {}; if (!ioAttr) { return }
			const {altInst} = e.gridPart.builder; if (altInst) {
				const value = rec.kod, pInst = (altInst._p || {})[ioAttr];
				if (pInst) { pInst.value = value } else { altInst[ioAttr] = value }
			}
		});
		form.addGridliGiris_sabit({
			id: 'muhGrid', tabloKolonlari: [ new GridKolon({ belirtec: 'etiket', text: 'Hesap Tipi', genislikCh: 25 }).readOnly(), colDef_muhHesap ],
			source: async e => {
				const {altInst} = e.builder; let recs = [];
				recs = [
					{ ioAttr: 'stokHes', etiket: 'Stok Hesabı(15X)' },
					{ ioAttr: 'uretKullanHes', etiket: 'Üretime Kullanılan(710/740)' },
					{ ioAttr: 'satMalHes', etiket: 'Satılan Malın Mal.(62x)' },
					{ ioAttr: 'hamSatisMalHes', etiket: 'Hamm.Ticari Mal Hes(153)' },
					{ ioAttr: 'icSatisGelirHes', etiket: 'İç Satış Gelir Hes(600)' },
				 	{ ioAttr: 'icSatisIadeHes', etiket: 'İç Satış İade Hes(610)' }
				];
				const kod2GridRecs = {};
				for (const rec of recs) {
					const {ioAttr} = rec; if (ioAttr) {
						const kod = rec.kod = altInst[ioAttr];
						if (kod) { (kod2GridRecs[kod] = kod2GridRecs[kod] || []).push(rec) }
					}
				}
				if (!$.isEmptyObject(kod2GridRecs)) {
					const kodListe = Object.keys(kod2GridRecs);
					let sent = new MQSent({ from: 'muhhesap', where: { inDizi: kodListe, saha: 'kod' }, sahalar: ['kod', 'aciklama'] });
					const _recs = await app.sqlExecSelect(sent);
					for (const _rec of _recs) { const gridRecs = kod2GridRecs[_rec.kod] || []; for (const gridRec of gridRecs) { gridRec.aciklama = _rec.aciklama } }
				}
				return recs
			}
		}).addStyle_fullWH();
		//form.addGrid({ id: 'ekBilgi', etiket: 'Ek Bilgi'});
		//ayrac(tabPage,'barkodReferanslari','==Barkod Referanları==','cadetblue')
		tabPage.addBaslik({ etiket: 'Barkod Referansları' });
		form = tabPage.addFormWithParent().addStyle_fullWH({ height: `calc(var(--full) - ${muhGrid_height + 50}px)` });
		form.addGridliGiris({
			id: 'barRef', tabloKolonlari: [
				new GridKolon({ belirtec: 'refkod', text: 'Barkod Referans', genislikCh: 20 }),
				new GridKolon({ belirtec: 'varsayilan', text: 'Varsyln?', genislikCh: 8 }).tipBool()
			],
			source: e => e.builder.altInst.barkodReferanslari || []
		}).widgetArgsDuzenleIslemi(e => { $.extend(e.args, { editMode: 'click' }) }).addStyle_fullWH();
	}
	async yukleSonrasiIslemler(e) {
		const {inst} = this, stokKod = inst.kod;
		const sent = new MQSent({ from: 'sbarref', where: [ { degerAta: stokKod, saha: 'stokkod' } ], sahalar: ['refkod', 'varsayilan', 'paketsayac', 'koliicadet',  'bseribarkodmu', 'bkolibarkodmu'] });
		const stm = new MQStm({ sent }); const recs = this.barkodReferanslari = await app.sqlExecSelect(stm);
		for (const rec of recs) { rec.varsayilan = asBool(rec.varsayilan) }
	}
	async kaydetSonrasiIslemler(e) {
		const {inst} = this, stokKod = inst.kod, hvListe = [];
		const barkodReferanslari = this.barkodReferanslari || []; let varsayilanVarmi = false;
		for (const rec of barkodReferanslari) {
			const {refkod} = rec; if (!refkod) { continue }
			let varsayilanmi = asBool(rec.varsayilan); if (varsayilanmi) { if (varsayilanVarmi) { varsayilanmi = false } else { varsayilanVarmi = true } }
			hvListe.push({
				stokkod: stokKod, refkod: rec.refkod, varsayilan: bool2FileStr(varsayilanmi), paketsayac: rec.paketsayac,
				koliicadet: asInteger(rec.koliicadet), bseribarkodmu: bool2Int(rec.bseribarkodmu), bkolibarkodmu: bool2Int(rec.bkolibarkodmu)
			})
		}
		if (!varsayilanVarmi && hvListe.length) { hvListe[0].varsayilan = bool2FileStr(true) }		
		const wh = { degerAta: stokKod, saha: 'stokkod' };
		const toplu = new MQToplu([
			new MQIliskiliDelete({ from: 'sbarref', where: wh }),
			new MQInsert({ table: 'sbarref', hvListe: hvListe })
		]).withDefTrn();
		await app.sqlExecNone(toplu)
	}
	static orjBaslikListesiDuzenle(e) { }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		for (const prefix of ['satMal', 'uretKullan', 'hamSatisMal', 'icSatisGelir', 'icSatisIade']) {
			const ioAttr = `${prefix}Hes`, rowAttr = `${prefix.toLowerCase()}hes`;
			hv[rowAttr] = this[ioAttr] || null
		}
	}
}
class MQStokUretim extends MQStokAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			/* zeminRenk: new PInstStr(),*/ uretimdeAnaMaddedir: new PInstBool('uretimdeanamaddedir'), fireYuzde: new PInstNum('fireyuzde'),
			uretimSekli: new PInstTekSecim('uretimsekli', UretimSekli), alterKod: new PInstStr('alterkod'), tahminiUretimSuresi: new PInstNum('tahminiuretimsuresi'),
			yanUrunRayicKullanilir: new PInstBool('yanurunrayickullanilir'), yanUrunRayicBedel: new PInstNum('yanurunrayicbedel'), yanUrunRayicFiiliBedel: new PInstNum('yanurunrayicfiilibedel'), pdmKodu: new PInstStr('pdmkodu'),
			/*uretenAzMiktar: new PInstNum('uretenazmiktar'), uretenCokMiktar: new PInstNum('uretencokmiktar'),*/ uretimBirimTipi: new PInstBool('uretbirimtipi')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this, {tabPanel} = e;
		let tabPage = tabPanel.addTab({ id: 'uretim', etiket: 'Uretim' });
		tabPage.setAltInst(e => e.builder.inst.uretim);
		//tabPage.setAltInst(e => e.builder.inst.uretim);
		tabPage.addStyle(e => `$elementCSS .baslik { color: cadetblue }`);
		let form = tabPage.addFormWithParent().yanYana(4);
		//form.setAltInst(e=>e.builder.inst.uretim);
		form.addNumberInput({ id: 'fireYuzde', etiket: 'Genel Fire ( % )'}).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addNumberInput({ id: 'tahminiUretimSuresi',	etiket: 'Tah.Ürt.Süre(sn)'}).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addModelKullan({ id: 'alterKod', etiket: 'Alternatif Kod',	mfSinif: MQStok}).dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 250px }`);
		form.addModelKullan({ id: 'uretimSekli', etiket: 'Üretim Şekli', source: e => e?.builder?.altInst?.uretimSekli?.kaListe}).dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 250px }`);
		form.addCheckBox({ id: 'uretimdeAnaMaddedir', etiket: 'Üretimde Ana Maddedir' });
		form.addCheckBox({ id: 'uretimBirimTipi', etiket: 'Üretim Harcaması 2.miktardan yapılır' });		
		// ayrac(tabPage,'yanUretim','==Yan Üretim==','cadetblue')
		tabPage.addBaslik({ etiket: 'Rayiç Bedel' });
		form = tabPage.addFormWithParent().yanYana(1);
		form.addCheckBox({ id: 'yanUrunRayicKullanilir', etiket: 'Piyasa Rayiç Bedel Kullanılır' }) .degisince(e => {
			for (const subBuilder of e.builder.parentBuilder.parentBuilder.id2Builder.rayicBedel_parent.builders) { subBuilder.updateVisible() }
		});
		
		form = tabPage.addFormWithParent({ id: 'rayicBedel_parent' }).yanYana(6);
		const rayicBedelVisibleKosulu = e => e.builder.altInst.yanUrunRayicKullanilir;
		form.addNumberInput({ id: 'yanUrunRayicBedel', etiket: 'Rayiç Birim Bedel'}).setVisibleKosulu(e => rayicBedelVisibleKosulu(e));
		form.addNumberInput({ id: 'yanUrunRayicFiiliBedel', etiket: 'Rayiç Fiili Bedel'}).setVisibleKosulu(e => rayicBedelVisibleKosulu(e));
		tabPage.addBaslik({ etiket: 'Üretim Diğer' });
		form = tabPage.addFormWithParent().yanYana(6);
		form.addTextInput({ id: 'pdmKodu', etiket: 'PDM Kodu', maxLength: 10}).addStyle(e => `$elementCSS { max-width: 150px }`);
		/*tabPage.addBaslik({ etiket: 'Üretimde Kritik Miktar' });
		form = tabPage.addFormWithParent().yanYana(5);
		form.addTextInput({ id: 'uretenAzMiktar', etiket: 'En Az'}).addStyle(e => `$elementCSS { max-width: 50px }`);
		form.addNumberInput({ id: 'uretenCokMiktar', etiket: 'En Çok'}).addStyle(e => `$elementCSS { max-width: 50px }`)*/
	}
	static orjBaslikListesiDuzenle(e) {
		const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'satilamazfl', text: 'Satılmaz?', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'alterkod', text: 'Ür. Alter Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'tahminiuretimsuresi', text: 'Tah. Ür. Süresi', genislikCh: 15 }),
			new GridKolon({ belirtec: 'fireyuzde', text: 'Üretim fire %', genislikCh: 15 }),
			new GridKolon({ belirtec: 'hurdayuzde', text: 'Üretim Hurda %', genislikCh: 15 }),
			new GridKolon({ belirtec: 'hurdastokkod', text: 'Ür. Hurda Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'abckodu', text: 'ABC Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'pdmkodu', text: 'PDM Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'resimkodu', text: 'Resim Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'dayanikliliktipi', text: 'Dayan. Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'dayanikliliksuresi', text: 'Dayan. Süre', genislikCh: 5 }),
			new GridKolon({ belirtec: 'tartilabilir', text: 'Tartılabilir', genislikCh: 5 }),
			new GridKolon({ belirtec: 'tartireferans', text: 'Tartı Ref.', genislikCh: 5 }),
			new GridKolon({ belirtec: 'gtipkod', text: 'GTIP Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'gtipadi', text: 'GTIP Adi', genislikCh: 20, sql: 'gtip.aciklama' }),
			new GridKolon({ belirtec: 'yktoptankdvuygulanir', text: 'Toptan Esas mı?', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bdagesasmasraf', text: 'Dağıtıma Esas Masraf', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bdagesasfisici', text: 'Fiş İçi Dağıtım Esas', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bdagesasfiyatfarki', text: 'Fiyat Farkı Dağıtım Esas', genislikCh: 5 }),
			new GridKolon({ belirtec: 'yukgrupkod', text: 'Yük Grup Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'yukgrupadi', text: 'Yük Grup Adı', genislikCh: 20, sql: 'ygrp.aciklama' }),
			new GridKolon({ belirtec: 'satistisnakod', text: 'Satış İstisna Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'smalduzbirimtipi', text: 'Mal Duz. Birim Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'adidegisir', text: 'Adı Değişir', genislikCh: 5 }),
			new GridKolon({ belirtec: 'gecicipluref', text: 'Geçici PLU', genislikCh: 5 }),
			new GridKolon({ belirtec: 'kasadafiyatverilir', text: 'Kasada Fiyat Verilir', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'kisaadi', text: 'Kisa Adı', genislikCh: 15 }),
			new GridKolon({ belirtec: 'uretimsekli', text: 'Üretim Şekli', genislikCh: 5 }),
			new GridKolon({ belirtec: 'uretimdeanamaddedir', text: 'Ana Madde mi?', genislikCh: 5 }).tipBool(),
			//new GridKolon({ belirtec: 'uretilengirisgunu', text: 'Üret. Giris Günü', genislikCh: 15 }),
			//new GridKolon({ belirtec: 'uretsipenazgun', text: 'Üret. Sip. En Az günü', genislikCh: 15 })
			/*new GridKolon({ belirtec: 'uretenazmiktar', text: 'Üret. En Az miktar', genislikCh: 15 }),
			new GridKolon({ belirtec: 'uretencokmiktar', text: 'Üret. En Çok MiktaR', genislikCh: 15 }),*/
		)
	}
}
