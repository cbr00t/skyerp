class MQStok extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get shTip() { return 'S' }
	static get stokmu() { return true }
	static get sinifAdi() { return 'Stok' }
	static get table() { return 'stkmst' }
	static get tableAlias() { return 'stk' }
	// static get tanimUISinif() { return MQStokTanimPart }
	static get kodListeTipi() { return 'STK' }
	static get ayrimTipKod() { return 'STAYR' }
	static get ayrimTableAlias() { return 'sayr' }
	static get ozelSahaTipKod() { return 'STK' }
	static get zeminRenkDesteklermi() { return false }
	
	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			aciklama2: new PInstStr('aciklama2')
		})
	}
	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e);
		const {liste} = e;
		$.extend(liste, {
			genel: MQStokAlt_Genel, fiyat: MQStokAlt_Fiyat, vergi: MQStokAlt_Vergi,
			barkodMuh: MQStokAlt_BarkodMuh, uretim: MQStokAlt_Uretim,
			diger: MQStokAlt_Diger, diger2: MQStokAlt_Diger2
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e)
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const tanimForm = e.tanimFormBuilder;
		tanimForm.addTextInput({ id: 'aciklama2', etiket: 'Açıklama 2' }).etiketGosterim_placeholder();
		/*this.formBuilder_addTabPanelWithGenelTab(e)
		const {tabPanel, tabPage_genel} = e*/
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'aciklama2', text: 'Açıklama 2', genislikCh: 40 }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.where.add(`${aliasVeNokta}silindi = ''`)
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
}
class MQStokAlt_Genel extends MQStokAlt {
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			aktifmi: new PInstTrue('calismadurumu'),
			satilamazmi: new PInstBool('satilamazfl'),
			brm: new PInstStr('brm'),
			brm2: new PInstStr('brm2'),
			brmOrani: new PInstNum('brmorani'),
			brutAgirlik: new PInstNum('brutagirlik'),
			netAgirlik: new PInstNum('netagirlik'),
			stokTip: new PInstTekSecim('tipi', StokTip),
			grupKod: new PInstStr('grupkod'),
			istGrupKod: new PInstStr('sistgrupkod'),
			tavsiyeYerKod: new PInstStr({ rowAttr: 'tavsiyeyerkod', init: e => 'A' }),
			satKdvDegiskenmi: new PInstBool('satkdvdegiskenmi'),
			satKdvHesapKod: new PInstStr('satkdvhesapkod'),
			almKdvDegiskenmi: new PInstBool('almkdvdegiskenmi'),
			almKdvHesapKod: new PInstStr('almkdvhesapkod'),
			almStopajHesapKod: new PInstStr('almstopajhesapkod'),
			almFiyat: new PInstNum('almfiyat'),
			almNetFiyat: new PInstNum('almnetfiyat'),
			dvKod: new PInstStr('dvkod')
		});
		const fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1;
		for (let i = 1; i <= fiyatSayi; i++)
			pTanim[`satFiyat${i}`] = new PInstNum(`satfiyat${i}`)
	}
	static ekCSSDuzenle(e) {
		const {rec, result} = e;
		if (!asBool(rec.calismadurumu))
			result.push('bg-lightgray', 'iptal')
		else if (asBool(rec.satilamazfl))
			result.push('bg-lightred')
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		const {mfSinif} = this;
		mfSinif.formBuilder_addTabPanelWithGenelTab(e);
		const tabPage = e.tabPage_genel;
		tabPage.setAltInst(e => e.builder.inst.genel);
		let form = tabPage.addFormWithParent().yanYana(8);
		form.addModelKullan({ id: 'stokTip', etiket: 'Tip', source: e => StokTip.instance.kaListe }).dropDown().kodsuz();
		form.addModelKullan({ id: 'brm', etiket: 'Brm', source: e => app.params.stokBirim.brmColl }).dropDown().kodsuz();
		form.addModelKullan({ id: 'brm2', etiket: 'Br2', source: e => app.params.stokBirim.brmColl }).dropDown().kodsuz();
		form.addNumberInput({ id: 'brmOrani', etiket: 'Brm. Oranı' });
		form.addTextInput({ id: 'dvKod', etiket: 'Dv.Kod' });
		form.addCheckBox({ id: 'aktifmi', etiket: 'Aktif' }).addStyle([
			e => `$elementCSS > label { color: forestgreen; padding: 0 8px }`,
			e => `$elementCSS > input:checked + label { font-weight: bold }`
		]);
		form.addCheckBox({ id: 'satilamazmi', etiket: 'SatılMAZ' }).addStyle([
			e => `$elementCSS > label { color: firebrick; padding: 0 8px }`,
			e => `$elementCSS > input:checked + label { font-weight: bold; color: whitesmoke; background-color: darkred }`
		]);
		form = tabPage.addFormWithParent().yanYana(3);
		form.addModelKullan({ id: 'tavsiyeYerKod', mfSinif: MQStokYer }).dropDown();
		form.addModelKullan({ id: 'grupKod', mfSinif: MQStokGrup }).dropDown();
		form.addModelKullan({ id: 'istGrupKod', mfSinif: MQStokIstGrup }).dropDown();
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen', kapali: true },
			{ kod: 'diger', aciklama: 'Diğer', renk: '#555', kapali: true }
		]);
		sec.secimTopluEkle({
			calismaDurumu: new SecimTekSecim({ etiket: 'Çalışma Durumu', tekSecimSinif: CalismaDurumu }),
			satilmaDurumu: new SecimTekSecim({ etiket: 'Satılma Durumu', tekSecimSinif: SatilmaDurumu }),
			grupKod: new SecimString({ mfSinif: MQStokGrup, grupKod: 'grup' }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı', grupKod: 'grup' }),
			istGrupKod: new SecimString({ mfSinif: MQStokIstGrup, grupKod: 'grup' }),
			istGrupAdi: new SecimOzellik({ etiket: 'İst. Grup Adı', grupKod: 'grup' }),
			brm: new SecimString({ etiket: 'Brm', grupKod: 'diger' }),
			dvKod: new SecimString({ etiket: 'Dv.Kod', grupKod: 'diger' }),
			stokTip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: StokTip, grupKod: 'diger' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const wh = e.where, secimler = e.secimler;
			wh.add(sec.calismaDurumu.tekSecim.getBoolClause(`${aliasVeNokta}calismadurumu`));
			wh.add(sec.satilmaDurumu.tekSecim.getTersBoolClause(`${aliasVeNokta}satilamazfl`));
			wh.basiSonu(sec.grupKod, `${aliasVeNokta}grupkod`);
			wh.ozellik(sec.grupAdi, `sgrp.aciklama`);
			wh.basiSonu(sec.istGrupKod, `${aliasVeNokta}sistgrupkod`);
			wh.ozellik(sec.istGrupAdi, `sigrp.aciklama`);
			wh.basiSonu(sec.brm, `${aliasVeNokta}brm`);
			wh.basiSonu(sec.dvKod, `${aliasVeNokta}dvkod`);
			wh.birKismi(sec.stokTip, `${aliasVeNokta}tipi`);
		})
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'brm2', text: 'Brm 2', genislikCh: 5 }),
			new GridKolon({ belirtec: 'brmorani', text: 'Br.Oran', genislikCh: 9 }).tipNumerik(),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 20, sql: 'sgrp.aciklama' }),
			new GridKolon({ belirtec: 'sistgrupkod', text: 'İst. Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'sistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'sigrp.aciklama' }),
			new GridKolon({ belirtec: 'tiptext', text: 'Stok Tipi', genislikCh: 13, sql: StokTip.getClause(`${aliasVeNokta}tipi`) }),
			new GridKolon({ belirtec: 'tavsiyeyerkod', text: 'Tav. Yer', genislikCh: 8 }),
			new GridKolon({ belirtec: 'tavsiyeyeradi', text: 'Tavsiye Yer Adı', genislikCh: 25, sql: 'yer.aciklama' }),
		]);
		const fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1;
		for (let i = 1; i <= fiyatSayi; i++)
			liste.push(new GridKolon({ belirtec: `satfiyat${i}`, text: `Satış Fiyat ${i}`, genislikCh: 15 }).tipDecimal({ fra: 5 }));
		liste.push(...[
			new GridKolon({ belirtec: 'satkdvdegiskenmi', text: 'Sat.KDV.Değ?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'satkdvoran', text: 'Satış KDV', genislikCh: 8, sql: 'sver.kdvorani' }).tipNumerik(),
			new GridKolon({ belirtec: 'satkdvhesapkod', text: 'Sat. KDV Hes.', genislikCh: 10 }),
			new GridKolon({ belirtec: 'almkdvdegiskenmi', text: 'Alm.KDV.Değ?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'almkdvoran', text: 'Alım KDV', genislikCh: 8, sql: 'aver.kdvorani' }).tipNumerik(),
			new GridKolon({ belirtec: 'almstopajoran', text: 'Alım Stopaj', genislikCh: 8, sql: 'asver.stopajorani' }).tipNumerik(),
			new GridKolon({ belirtec: 'almkdvhesapkod', text: 'Alım KDV Hes.', genislikCh: 10 }),
			new GridKolon({ belirtec: 'calismadurumu', text: 'Aktif?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'satilamazfl', text: 'Satılmaz?', genislikCh: 8 }).tipBool()
		])
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {sent} = e;
		sent.fromIliski('stkgrup sgrp', `${aliasVeNokta}grupkod = sgrp.kod`);
		sent.fromIliski('stkistgrup sigrp', `${aliasVeNokta}sistgrupkod = sigrp.kod`);
		sent.fromIliski('stkyer yer', `${aliasVeNokta}tavsiyeyerkod = yer.kod`);
		sent.fromIliski('vergihesap sver', `${aliasVeNokta}satkdvhesapkod = sver.kod`);
		sent.fromIliski('vergihesap aver', `${aliasVeNokta}almkdvhesapkod = aver.kod`);
		sent.fromIliski('vergihesap asver', `${aliasVeNokta}almstopajhesapkod = asver.kod`);
		sent.sahalar.add(`${aliasVeNokta}calismadurumu`, `${aliasVeNokta}satilamazfl`)
	}
}
class MQStokAlt_Fiyat extends MQStokAlt {
}
class MQStokAlt_Vergi extends MQStokAlt {
}
class MQStokAlt_BarkodMuh extends MQStokAlt {
}
class MQStokAlt_Uretim extends MQStokAlt {
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			uretDepKod: new PInstStr('uretdepkod'),
			uretimdeAnaMaddedir: new PInstStr('uretimdeanamaddedir'),
			uretBirimTipi: new PInstStr('uretbirimtipi'),
			fireYuzde: new PInstNum('fireyuzde'),
			alterKod: new PInstStr('alterkod'),
			tahminiUretimSuresi: new PInstNum('tahminiuretimsuresi'),
			uretimSekli: new PInstTekSecim('uretimsekli', UretimSekli)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		const {mfSinif} = this;
		const {tabPanel} = e;
		const tabPage = tabPanel.addTab({ id: 'uretim', etiket: 'Üretim' });
		tabPage.setAltInst(e => e.builder.inst.uretim);
		let form = tabPage.addFormWithParent().yanYana(5);
		form.addNumberInput({ id: 'fireYuzde', etiket: 'Fire %' });
		form.addTextInput({ id: 'alterKod', etiket: 'Alter Kod' });
		form.addNumberInput({ id: 'tahminiUretimSuresi', etiket: 'Tah.Üret.Süre' });
		form.addModelKullan({ id: 'uretimSekli', etiket: 'Üretim Şekli', source: e => UretimSekli.instance.kaListe }).dropDown().kodsuz()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.grupTopluEkle([
			{ kod: 'diger', aciklama: 'Diğer', renk: '#555', kapali: true }
		]);
		sec.secimTopluEkle({
			uretimSekli: new SecimBirKismi({ etiket: 'Üretim Şekli', tekSecimSinif: UretimSekli, grupKod: 'diger' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const wh = e.where, secimler = e.secimler;
			wh.birKismi(sec.uretimSekli, `${aliasVeNokta}uretimsekli`);
		})
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'fireyuzde', text: 'Fire %', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'alterkod', text: 'Alter Kod', genislikCh: 8 }),
			new GridKolon({ belirtec: 'tahminiuretimsuresi', text: 'Tah.Üret.Süre', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'uretimseklitext', text: 'Üretim Şekli', genislikCh: 13, sql: UretimSekli.getClause(`${aliasVeNokta}uretimsekli`) })
		])
	}
}
class MQStokAlt_Diger extends MQStokAlt {
}
class MQStokAlt_Diger2 extends MQStokAlt {
}

