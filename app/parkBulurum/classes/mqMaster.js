class MQMasterOrtakAyarlar extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static orjBaslikListesi_argsDuzenle(e) { const {args, sender} = e; $.extend(args, { showFilterRow: true, groupsExpandedByDefault: true, rowsHeight: 45, groupIndentWidth: 25 }) }
}
class MQUcretlendirme extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ücretlendirme' } static get sonraSaatSayi() { return 3 }
	static get table() { return 'oucretlendirme' } static get tableAlias() { return 'ucr' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			ucretsizDk: new PInstNum('ucretsizdk'), ilk30DkVarmi: new PInstBitBool('bilk30varmi'), ilk30DkUcreti: new PInstNum('ilk30dktl'),
			ilkSaatVarmi: new PInstBitBool('bilksaatvarmi'), ilkSaatUcreti: new PInstNum('ilksaattl')
		});
		for (let i = 1; i <= this.sonraSaatSayi; i++) {
			pTanim[`sonra${i}SaatDilimi`] = new PInstNum(`sonra${i}saatdegeri`);
			pTanim[`sonra${i}SaatSayisi`] = new PInstNum(`sonra${i}saatcarpan`);
			pTanim[`sonra${i}SaatUcreti`] = new PInstNum(`sonra${i}saattl`)
		}
		$.extend(pTanim, { sinirSaat: new PInstNum('sinirsaat'), sinirSonraGunlukUcret: new PInstNum('sinirsonragunlukucret') })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e, Width_Mini = 130, BedelFra = app.params.zorunlu?.bedelFra || 2;
		let form = tabPage_genel.addFormWithParent().yanYana();
		form.addNumberInput('ucretsizdk', 'Ücretsiz Dk').setFra(0).addStyle_wh(Width_Mini);
		form.addCheckBox('ilk30DkVarmi', 'İlk 30 Dk').degisince(e => { const {builder} = e, {id2Builder} = builder.parentBuilder; id2Builder.ilk30DkUcreti.updateVisible(e) })
		form.addNumberInput('ilk30DkUcreti', '... Ücreti').setFra(BedelFra).addStyle_wh(Width_Mini).setVisibleKosulu(e => { const {builder} = e, {altInst} = builder, value = altInst.ilk30DkVarmi; return !!value || 'basic-hidden' });
			form.addForm().setLayout(e => $(`<span> TL</span>`)).addStyle_wh('auto').addStyle(e => `$elementCSS { padding-top: 40px }`);
		form.addCheckBox('ilkSaatVarmi', 'İlk Saat').degisince(e => { const {builder} = e, {id2Builder} = builder.parentBuilder; id2Builder.ilkSaatUcreti.updateVisible(e) })
		form.addNumberInput('ilkSaatUcreti', '... Ücreti').setFra(BedelFra).addStyle_wh(Width_Mini).addStyle_wh(Width_Mini).setVisibleKosulu(e => { const {builder} = e, {altInst} = builder, value = altInst.ilkSaatVarmi; return !!value || 'basic-hidden' });
			form.addForm().setLayout(e => $(`<span> TL</span>`)).addStyle_wh('auto').addStyle(e => `$elementCSS { padding-top: 40px }`);
		form = tabPage_genel.addBaslik().setEtiket('Sonraki Süreler').addFormWithParent().altAlta();
		for (let i = 1; i <= this.sonraSaatSayi; i++) {
			let altForm = form.addFormWithParent().yanYana();
			altForm.addNumberInput(`sonra${i}SaatDilimi`, ' ').setFra(0).etiketGosterim_yok().addStyle_wh(Width_Mini); altForm.addForm().setLayout(e => $(`<span> defa her</span>`)).addStyle_wh('auto');
			altForm.addNumberInput(`sonra${i}SaatSayisi`, ' ').setFra(0).etiketGosterim_yok().addStyle_wh(Width_Mini); altForm.addForm().setLayout(e => $(`<span> saat için</span>`)).addStyle_wh('auto');
			altForm.addNumberInput(`sonra${i}SaatUcreti`, ' ').setFra(BedelFra).etiketGosterim_yok().addStyle_wh(Width_Mini); altForm.addForm().setLayout(e => $(`<span> TL</span>`)).addStyle_wh('auto')
		}
		form = tabPage_genel.addBaslik().setEtiket('Sınır').addFormWithParent().yanYana();
		form.addNumberInput('sinirSaat', 'Saat Sınırı').setFra(0).addStyle_wh(Width_Mini).degisince(e => { const {builder} = e, {id2Builder} = builder.parentBuilder; id2Builder.sinirSonraGunlukUcret.updateVisible(e) });
			form.addForm().setLayout(e => $(`<span> saat sonrası</span>`)).addStyle_wh('auto').addStyle(e => `$elementCSS { padding-top: 40px }`)
		form.addNumberInput('sinirSonraGunlukUcret', '... Sonra Ücreti').setFra(BedelFra).addStyle_wh(Width_Mini).addStyle_wh(Width_Mini).setVisibleKosulu(e => { const {builder} = e, {altInst} = builder, value = altInst.sinirSaat; return !!value || 'jqx-hidden' });
			form.addForm().setLayout(e => $(`<span> TL</span>`)).addStyle_wh('auto').addStyle(e => `$elementCSS { padding-top: 40px }`)
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		const cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			rec = rec?.bounddata ?? rec?.boundrec ?? rec?.boundrow ?? rec; if (!rec) { return html }
			let handler = colDef.tip?.cellsRenderer; if (handler) { const result = getFuncValue.call(colDef, handler, colDef, rowIndex, belirtec, value, html, jqxCol, rec); if (result != null) { html = result } }
			const Prefix_TL = 'tl', Prefix_Ucreti = 'ucreti';
			if (belirtec == 'ilk30dktl' || belirtec == 'ilksaattl') {
				const selector = belirtec.replace(Prefix_TL, 'varmi');
				if (!rec[selector]) { html = changeTagContent(html, (value = '')) }
			}
			else if (belirtec.endsWith(Prefix_Ucreti)) {
				const uygunmu = !!(rec[belirtec.replace(Prefix_Ucreti, 'Dilimi')] || rec[belirtec.replace(Prefix_Ucreti, 'Sayisi')]);
				if (!uygunmu) { html = changeTagContent(html, (value = '')) }
			}
			return html
		};
		liste.push(...[
			new GridKolon({ belirtec: 'ucretsizdk', text: 'Ücretsiz Dk', genislikCh: 11, cellsRenderer }).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'ilk30dktl', text: 'İlk 30 Dk', genislikCh: 11, cellsRenderer }).tipDecimal_bedel().sifirGosterme(),
			new GridKolon({ belirtec: 'ilksaattl', text: 'İlk Saat', genislikCh: 13, cellsRenderer }).tipDecimal_bedel().sifirGosterme()
		]);
		for (let i = 1; i <= this.sonraSaatSayi; i++) {
			liste.push(
				new GridKolon({ belirtec: `sonra${i}saatdegeri`, text: `${i} Defa`, genislikCh: 11, cellsRenderer }).tipDecimal().sifirGosterme(),
				new GridKolon({ belirtec: `sonra${i}saatcarpan`, text: `${i} Saat için`, genislikCh: 11, cellsRenderer }).tipDecimal().sifirGosterme(),
				new GridKolon({ belirtec: `sonra${i}saattl`, text: `${i} Saat Bedeli`, genislikCh: 13, cellsRenderer }).tipDecimal_bedel().sifirGosterme()
			)
		}
		liste.push(...[
			new GridKolon({ belirtec: 'sinirsaat', text: 'Saat Sınırı', genislikCh: 11, cellsRenderer }).sifirGosterme(),
			new GridKolon({ belirtec: 'sinirsonragunlukucret', text: 'Sınır Sonrası Ücret', genislikCh: 13, cellsRenderer }).tipDecimal_bedel().sifirGosterme()
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.sahalar.add(`${alias}.bilk30varmi ilk30dkvarmi`, `${alias}.bilksaatvarmi ilksaatvarmi`)
	}
}
class MQArizaNedeni extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Alan' }
	static get table() { return 'oneden' } static get tableAlias() { return 'ned' } static get tumKolonlarGosterilirmi() { return true }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
}
class MQSozlesme extends MQTakipNo {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Sözleşme' } static get tableAlias() { return 'soz' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			isiBittimi: new PInstBitBool('bkontisibitti'), kurumTipi: new PInstTekSecim('kurumtipi', KurumTipi), mustKod: new PInstStr('must'),
			tarih: new PInstDateNow('tarih'), gecerlilikTarihBasi: new PInstDate('bastarih'), gecerlilikTarihSonu: new PInstDate('sontarih'), notlar: new PInstStr('notlar')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(1.5);
		form.addDateInput('tarih', 'Tarih'); form.addCheckBox('isiBittimi', 'Bitti');
		form.addModelKullan('kurumTipi', 'Kurum Tipi').noMF().kodsuz().dropDown().addStyle_wh(130).setSource(e => KurumTipi.kaListe).degisince(e => { const {builder} = e, {id2Builder} = builder.parentBuilder; id2Builder.mustKod.updateVisible(e) });
		form.addModelKullan('mustKod', 'Müşteri').setMFSinif(MQCari).comboBox().setVisibleKosulu(e => { const {builder} = e, {altInst} = builder, value = altInst.kurumTipi; return !(value?.char ?? value) ? true : 'jqx-hidden' });
		form = tabPage_genel.addBaslik().setEtiket('Geçerlilik').addFormWithParent().yanYana();
		form.addDateInput('gecerlilikTarihBasi', 'Başı'); form.addDateInput('gecerlilikTarihSonu', 'Sonu');
		form = tabPage_genel.addFormWithParent().yanYana(); form.addTextArea('notlar', 'Notlar').setRows(4)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			kurumTipiBirKismi: new SecimBirKismi({ etiket: 'Kurum Tipi', tekSecimSinif: KurumTipi }),
			isiBitenlerSecim: new SecimTekSecim({ etiket: 'Cihaz Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="green">İşi Bitenler</span>`, `<span class="red">Devam Edenler</span>`]) }),
			tarih: new SecimDate({ etiket: 'Tarih' }), gecerlilik: new SecimDate({ etiket: 'Geçerlilik' }),
			mustKod: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }), mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			notlar: new SecimOzellik({ etiket: 'Notlar' })
		})
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			let tSec = sec.isiBitenlerSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bkontisibitti`)) }
			wh.basiSonu(sec.tarih, `${alias}.tarih`); wh.basiSonu({ basi: sec.gecerlilik.basi }, `${alias}.bastarih`); wh.basiSonu({ sonu: sec.gecerlilik.sonu }, `${alias}.sontarih`);
			wh.birKismi(sec.kurumTipiSecim, `${alias}.kurumtipi`); wh.basiSonu(sec.mustKod, `${alias}.must`); wh.ozellik(sec.mustUnvan, 'car.birunvan');
			wh.ozellik(sec.mustUnvan, 'car.birunvan'); wh.ozellik(sec.notlar, `${alias}.notlar`)
		})
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e); const {rec, result} = e; if (asBool(rec.isiBittimi)) { result.push('tamamlandi') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'kurumTipiText', text: 'Kullanım', genislikCh: 11, sql: KurumTipi.getClause(`${alias}.kurumtipi`) }),
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 18 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 50, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'bastarih', text: 'Geçerlilik Başı', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'sontarih', text: 'Geçerlilik Sonu', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'isiBittimiText', text: 'Bitti?', genislikCh: 11, sql: MQSQLOrtak.tersBoolBitClause(`${alias}.bkontisibitti`) }),
			new GridKolon({ belirtec: 'notlar', text: 'Notlar', minWidth: 250 })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.fromIliski('carmst car', `${alias}.must = car.must`); sent.sahalar.add(`${alias}.kurumtipi kurumTipi`, `${alias}.bkontisibitti isiBittimi`)
	}
}
class MQParkBolum extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Park Bölüm' }
	static get table() { return 'oparkbolum' } static get tableAlias() { return 'pbol' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { parkAlanId: new PInstGuid('parkalanid') }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan('parkAlanId', 'Park Alanı').setMFSinif(MQAlan).comboBox().kodsuz()
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ alanId: new SecimString({ etiket: 'Park Alanı', mfSinif: MQAlan }), alanAdi: new SecimOzellik({ etiket: 'Alan Adı' }) })
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.alanıd, `${alias}.parkalanid`); wh.ozellik(sec.alanAdi, 'aln.aciklama')
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(new GridKolon({ belirtec: 'parkAlanAdi', text: 'Alan Adı', genislikCh: 25, sql: 'aln.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.leftJoin({ alias, from: 'oparkalani aln', on: `${alias}.parkalanid = aln.id` })
	}
}
class MQAlan extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Alan' }
	static get table() { return 'oparkalani' } static get tableAlias() { return 'aln' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			kullanimTipi: new PInstTekSecim('kullanimtipi', OtoParkKullanim), devreDisimi: new PInstBitBool('bdevredisi'),
			sozlesmeKod: new PInstStr('sozlesmekod'), yerlesimKod: new PInstStr('yerlesimkod'), genelUcretlendirmeId: new PInstGuid('genelucretlendirmeid'),
			saatBasi: new PInstDate('kullanimsaatbasi'), saatSonu: new PInstDate('kullanimsaatsonu'), parkSayisi: new PInstNum('parksayisi'),
			alanTipi: new PInstTekSecim('alantipi', AlanTipi), gpsEnlem: new PInstNum('gpsenlem'), gpsBoylam: new PInstNum('gpsboylam'),
			adresText: new PInstStr('adrestext'), ekNotlar: new PInstStr('eknotlar')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2.3);
			form.addModelKullan('sozlesmeKod', 'Sözleşme').setMFSinif(MQSozlesme).comboBox(); form.addModelKullan('yerlesimKod', 'Yerleşim').setMFSinif(MQYerlesim).comboBox();
			form.addModelKullan('genelUcretlendirmeId', 'Genel Ücretlendirme').setMFSinif(MQUcretlendirme).kodsuz().comboBox(); form.addCheckBox('devreDisimi', 'Devre Dışı');
		form = tabPage_genel.addFormWithParent().yanYana();
			form.addModelKullan('kullanimTipi', 'Kullanım Tipi').noMF().kodsuz().dropDown().setSource(e => OtoParkKullanim.kaListe).addStyle_wh(130);
			form.addTimeInput('saatBasi', 'Baş. Saati'); form.addTimeInput('saatSonu', 'Bitiş Saati'); form.addNumberInput('parkSayisi', 'Park Sayısı').addStyle_wh(100);
			form.addModelKullan('alanTipi', 'Alan Tipi').noMF().kodsuz().dropDown().setSource(e => AlanTipi.kaListe).addStyle_wh(180);
			form.addNumberInput('gpsEnlem', 'GPS Enlem').setStep(.000001).addStyle_wh(250).degisince(e => this.konumDegisti(e)); form.addNumberInput('gpsBoylam', 'GPS Boylam').setStep(.000001).addStyle_wh(250).degisince(e => this.konumDegisti(e));
			form.addButton('konumBelirle').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumBelirleIstendi(e));
			form.addButton('konumGoster').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumGosterIstendi(e));
			form.addButton('yakindakiOtoparklar').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.yakindakiOtoparklarIstendi(e));
		form = tabPage_genel.addFormWithParent().yanYana(); form.addTextArea('adresText', 'Adres').setRows(4).setCols(50); form.addTextArea('ekNotlar', 'Ek Notlar').setRows(4).setCols(60)
		/*form = tabPage_genel.addFormWithParent().addStyle_fullWH(undefined, 600); form.addForm('maps').addStyle_fullWH().setLayout(e => {
			const {builder} = e, {altInst} = builder, {gpsEnlem, gpsBoylam} = altInst, url = this.getMapsUrl(altInst);
			return $(`<iframe class="full-wh" style="border: none !important" border="0" src="${url}"></iframe>`)
		})*/
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			sozlesmeKod: new SecimString({ etiket: 'Sözleşme', mfSinif: MQSozlesme }), sozlesmeAdi: new SecimOzellik({ etiket: 'Sözleşme Adı' }),
			yerlesimKod: new SecimString({ etiket: 'Yerleşim', mfSinif: MQYerlesim }), yerlesimAdi: new SecimOzellik({ etiket: 'Yerleşim Adı' }),
			ucretlendirmeAdi: new SecimOzellik({ etiket: 'Genel Ücretlendirme Adı' }), parkSayisi: new SecimNumber({ etiket: 'Park Sayısı' }),
			kullanimTipiBirKismi: new SecimBirKismi({ etiket: 'Kullanım Tipi', tekSecimSinif: OtoParkKullanim }), cihazDurumBirKismi: new SecimBirKismi({ etiket: 'Cihaz Durum', tekSecimSinif: CihazDurum }),
			cihazAktiflikSecim: new SecimTekSecim({ etiket: 'Cihaz Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="green">Aktif Olanlar</span>`, `<span class="red">DEVRE DIŞI Olanlar</span>`]) }),
			alanTipiBirKismi: new SecimBirKismi({ etiket: 'Alan Tipi', tekSecimSinif: AlanTipi }), gpsEnlem: new SecimNumber({ etiket: 'GPS Enlem' }), gpsBoylam: new SecimNumber({ etiket: 'GPS Boylam' }),
			adresText: new SecimOzellik({ etiket: 'Adres' }), ekNotlar: new SecimOzellik({ etiket: 'Ek Notlar' })
		})
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.sozlesmeKod, `${alias}.sozlesmekod`); wh.ozellik(sec.sozlesmeAdi, 'soz.aciklama');
			wh.basiSonu(sec.yerlesimKod, `${alias}.yerlesimkod`); wh.ozellik(sec.yerlesimAdi, 'yer.aciklama');
			wh.ozellik(sec.ucretlendirmeAdi, 'ucr.aciklama'); wh.basiSonu(sec.parkSayisi, `${alias}.parksayisi`);
			wh.birKismi(sec.kullanimTipiBirKismi, `${alias}.kullanimtipi`); wh.birKismi(sec.kullanimTipiBirKismi, `${alias}.kullanimtipi`);
			let tSec = sec.cihazAktiflikSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bdevredisi`)) };
			wh.birKismi(sec.alanTipiBirKismi, `${alias}.alantipi`); wh.basiSonu(sec.gpsEnlem, `${alias}.gpsenlem`); wh.basiSonu(sec.gpsBoylam, `${alias}.gpsboylam`);
			wh.ozellik(sec.adres, `${alias}.adrestext`); wh.ozellik(sec.ekNotlar, `${alias}.eknotlar`)
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.devreDisimi)) { result.push('devreDisi') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'sozlesmekod', text: 'Sözleşme', genislikCh: 13 }),
			new GridKolon({ belirtec: 'sozlesmeadi', text: 'Sözleşme Adı', genislikCh: 25, sql: 'soz.aciklama' }),
			new GridKolon({ belirtec: 'yerlesimkod', text: 'Yerleşim', genislikCh: 13 }),
			new GridKolon({ belirtec: 'yerlesimadi', text: 'Yerleşim Adı', genislikCh: 25, sql: 'yer.aciklama' }),
			new GridKolon({ belirtec: 'ucretlendirmeadi', text: 'Ücretlendirme Adı', genislikCh: 20, sql: 'ucr.aciklama' }),
			new GridKolon({ belirtec: 'kullanimTipiText', text: 'Kullanım', genislikCh: 11, sql: OtoParkKullanim.getClause(`${alias}.kullanimtipi`) }),
			new GridKolon({ belirtec: 'devreDisimiText', text: 'DevreDışı?', genislikCh: 11, sql: MQSQLOrtak.tersBoolBitClause(`${alias}.bdevredisi`) }),
			new GridKolon({ belirtec: 'parksayisi', text: 'Park Sayısı', genislikCh: 10, sql: `${alias}.parksayisi` }),
			new GridKolon({ belirtec: 'kullanimsaatbasi', text: 'Baş. Saati', genislikCh: 13 }).tipTime_noSecs(),
			new GridKolon({ belirtec: 'kullanimsaatsonu', text: 'Baş. Saati', genislikCh: 13 }).tipTime_noSecs(),
			new GridKolon({ belirtec: 'alanTipiText', text: 'Alan Tipi', genislikCh: 13, sql: AlanTipi.getClause(`${alias}.alantipi`) }),
			new GridKolon({ belirtec: 'gpsenlem', text: 'GPS Enlem', genislikCh: 10 }).tipDecimal(),
			new GridKolon({ belirtec: 'gpsboylam', text: 'GPS Boylam', genislikCh: 10 }).tipDecimal(),
			new GridKolon({ belirtec: 'adrestext', text: 'Adres', minWidth: 200 }),
			new GridKolon({ belirtec: 'eknotlar', text: 'Ek Notlar', minWidth: 250 })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.fromIliski('takipmst soz', `${alias}.sozlesmekod = soz.kod`); sent.fromIliski('oyerlesim yer', `${alias}.yerlesimkod = yer.kod`);
		sent.leftJoin({ alias, from: 'oucretlendirme ucr', on: `${alias}.genelucretlendirmeid = ucr.id` });
		sent.sahalar.addWithAlias(alias, 'kullanimtipi kullanimTipi', 'bdevredisi devreDisimi', 'genelucretlendirmeid', 'alantipi')
	}
}
class MQYerlesim extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Yerleşim' }
	static get table() { return 'oyerlesim' } static get tableAlias() { return 'yer' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { ilKod: new PInstStr('ilkod') })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan('ilKod', 'İl').setMFSinif(MQCariIl).comboBox()
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ ilKod: new SecimString({ etiket: 'İl', mfSinif: MQCariIl }), ilAdi: new SecimOzellik({ etiket: 'İl Adı' }) })
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.ilKod, `${alias}.ilkod`); wh.ozellik(sec.ilAdi, 'il.aciklama')
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.devreDisimi)) { result.push('devreDisi') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 5 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.fromIliski('caril il', `${alias}.ilkod = il.kod`)
	}
}
class MQCihaz extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cihaz' }
	static get table() { return 'ocihaz' } static get tableAlias() { return 'cih' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			ip: new PInstStr(), kartTelNox: new PInstStr(), durum: new PInstTekSecim('durum', CihazDurum), /* bariyerdurum */
			alanId: new PInstGuid('alanid'), ozelUcretlendirmeId: new PInstGuid('ozelucretlendirmeid'), rezBasTS: new PInstDate('rezbasts'), rezBitTS: new PInstDate('rezbitts'),
			aktifCagriId: new PInstGuid('aktifcagriid'), aktifParkId: new PInstGuid('aktifparkid'), sonParkId: new PInstGuid('sonparkid'),
			devreDisimi: new PInstBitBool('bdevredisi'), nedenKod: new PInstStr('nedenkod'),
			parkBolumId: new PInstGuid('parkbolumid'), parkIcYerKodu: new PInstStr('parkicyerkodu'), gpsEnlem: new PInstNum('gpsenlem'), gpsBoylam: new PInstNum('gpsboylam')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e, {dev} = config;
		let form = tabPage_genel.addFormWithParent();
			form.addTextInput('kartTelNox', 'GSM No').addStyle_wh(170); form.addDateInput('rezBasTS', 'Rezervasyon Başlangıç'); form.addDateInput('rezBitTS', 'Rezervasyon Bitiş');
			form.addCheckBox('devreDisimi', 'Devre Dışı').degisince(e => { const {builder} = e, {id2Builder} = builder.parentBuilder; id2Builder.nedenKod.updateVisible(e) });
			form.addModelKullan('nedenKod', 'Devre Dışı Nedeni').setMFSinif(MQArizaNedeni).dropDown().kodsuz().setVisibleKosulu(e => { const {builder} = e, {altInst} = builder, value = !!altInst.devreDisimi; return value ? true : 'jqx-hidden' });
		form = tabPage_genel.addFormWithParent();
			form.addModelKullan('parkBolumId', 'Park Bölüm').setMFSinif(MQParkBolum).comboBox().kodsuz().degisince(e => {
				const {builder, value} = e, {id2Builder} = builder.parentBuilder, part_alanId = id2Builder.alanId.part; part_alanId.disabled = !!value
				if (value) {
					const {table, kodSaha} = MQParkBolum; let sent = new MQSent({ from: table, where: { degerAta: value, saha: kodSaha }, sahalar: 'parkalanid' });
					app.sqlExecTekilDeger(sent).then(alanId => { alanId = alanId?.trimEnd(); part_alanId.val(alanId) })
				}
			});
			form.addModelKullan('alanId', 'Alan Adı').setMFSinif(MQAlan).comboBox().kodsuz();
		form = tabPage_genel.addFormWithParent();
			form.addModelKullan('ozelUcretlendirmeId', 'Özel Ücretlendirme').setMFSinif(MQUcretlendirme).kodsuz().comboBox();
		if (dev) { form.addModelKullan('aktifCagriId', 'Aktif Rezervasyon').setMFSinif(MQRezervasyon).comboBox().kodsuz() }
		form = tabPage_genel.addFormWithParent();
			form.addForm('_alanGenelUcretlendirmeText').setLayout(e => {
				const value = e.builder.altInst.alanGenelUcretlendirmeAdi;
				return $(value ? `<div class="ek-bilgi"><span class="etiket gray">Genel Ücretlendirme:</span> <span class="bold veri darkgray">${value}</span></div>` : '</div>')
			});
		form = tabPage_genel.addFormWithParent(); form.addTextInput('parkIcYerKodu', 'Park İç Yer Kodu');
			form.addNumberInput('gpsEnlem', 'GPS Enlem').setStep(.000001).addStyle_wh(250); form.addNumberInput('gpsBoylam', 'GPS Boylam').setStep(.000001).addStyle_wh(250);
			form.addButton('konumBelirle').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumBelirleIstendi(e));
			form.addButton('konumGoster').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumGosterIstendi(e));
		/* form.addModelKullan('durum', 'Durum').disable().noMF().dropDown().kodsuz().setSource(e => CihazDurum.kaListe).addStyle_wh(180) */
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.grupTopluEkle([ { kod: 'alan', aciklama: 'Alan' }, { kod: 'sozlesme', aciklama: 'Sözleşme' }, { kod: 'parkBolum', aciklama: 'Park Bölüm' }, { kod: 'diger', aciklama: 'Diğer' } ]);
		sec.secimTopluEkle({
			alanId: new SecimString({ etiket: 'Alan', mfSinif: MQAlan, grupKod: 'alan' }), alanAdi: new SecimOzellik({ etiket: 'Alan Adı', grupKod: 'alan' }),
			sozlesmeKod: new SecimString({ etiket: 'Sözleşme', mfSinif: MQSozlesme, grupKod: 'sozlesme' }), sozlesmeAdi: new SecimOzellik({ etiket: 'Sözleşme Adı', grupKod: 'sozlesme' }),
			parkBolumId: new SecimString({ etiket: 'Park Bölüm', mfSinif: MQParkBolum, grupKod: 'parkBolum' }), parkBolumAdi: new SecimOzellik({ etiket: 'Park Bölüm Adı', grupKod: 'parkBolum' }),
			telNo: new SecimOzellik({ etiket: 'Telefon' }), rezTS: new SecimDate({ etiket: 'Rezervasyon' }),
			ozelUcretlendirmeId: new SecimString({ etiket: 'Özel Ücretlendirme', mfSinif: MQUcretlendirme }),
			cihazAktiflikSecim: new SecimTekSecim({ etiket: 'Cihaz Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="green">Aktif Olanlar</span>`, `<span class="red">DEVRE DIŞI Olanlar</span>`]) }),
			cihazDurumSecim: new SecimBirKismi({ etiket: 'Cihaz Durum', tekSecimSinif: CihazDurum })
		});
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.alanId, `${alias}.alanid`); wh.ozellik(sec.alanAdi, 'aln.aciklama');
			wh.basiSonu(sec.sozlesmeKod, `${alias}.sozlesmekod`); wh.ozellik(sec.sozlesmeAdi, 'soz.aciklama');
			wh.basiSonu(sec.parkBolumId, `${alias}.parkbolumid`); wh.ozellik(sec.parkBolumAdi, 'pbol.aciklama');
			wh.ozellik(sec.telNo, `${alias}.simkartno`); let bs = sec.rezTS; wh.basiSonu({ basi: bs.basi }, `${alias}rezbasts`); wh.basiSonu({ sonu: bs.sonu }, `${alias}rezbitts`);
			wh.basiSonu(sec.ozelUcretlendirmeId, `${alias}.ozelucretlendirmeid`);
			let tSec = sec.cihazAktiflikSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bdevredisi`)) }
			wh.birKismi(sec.cihazDurumSecim, `${alias}.durum`)
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.devreDisimi)) { result.push('devreDisi') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); e.liste = e.liste.filter(key => key != 'durumText') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'sozlesmeAdi', text: 'Sözleşme Adı', genislikCh: 25, sql: 'soz.aciklama' }),
			new GridKolon({ belirtec: 'alanAdi', text: 'Alan Adı', genislikCh: 30, sql: 'aln.aciklama' }),
			new GridKolon({ belirtec: 'parkBolumAdi', text: 'Park Bölüm Adı', genislikCh: 25, sql: 'pbol.aciklama' }),
			new GridKolon({ belirtec: 'simkartno', text: 'Telefon', genislikCh: 15 }),
			new GridKolon({ belirtec: 'durumText', text: 'Durum', genislikCh: 15, sql: CihazDurum.getClause(`${alias}.durum`) }),
			new GridKolon({ belirtec: 'ozelUcretlendirmeAdi', text: 'Özel Ücretlendirme', genislikCh: 20, sql: 'ucr.aciklama' }),
			new GridKolon({ belirtec: 'rezbasts', text: 'Rez.Baş.', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'rezbitts', text: 'Rez.Bit.', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'devreDisimiText', text: 'DevreDışı?', genislikCh: 11, sql: MQSQLOrtak.tersBoolBitClause(`${alias}.bdevredisi`) }),
			new GridKolon({ belirtec: 'nedenAdi', text: 'D.Nedeni', genislikCh: 13, sql: `(case when ${alias}.bdevredisi = 0 then '' else ned.aciklama end)` })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.leftJoin({ alias, from: 'oparkalani aln', on: `${alias}.alanid = aln.id` }); sent.fromIliski('takipmst soz', 'aln.sozlesmekod = soz.kod');
		sent.fromIliski('oyerlesim yer', 'aln.yerlesimkod = yer.kod'); sent.fromIliski('oneden ned', `${alias}.nedenkod = ned.kod`);
		sent.leftJoin({ alias, from: 'oucretlendirme ucr', on: `${alias}.ozelucretlendirmeid = ucr.id` });
		sent.fromIliski('oucretlendirme aucr', 'aln.genelucretlendirmeid = aucr.id');
		sent.leftJoin({ alias, from: 'oparkbolum pbol', iliski: `${alias}.parkbolumid = pbol.id` });
		sent.sahalar.add(`${alias}.bdevredisi devreDisimi`, `${alias}.durum`, 'aln.genelucretlendirmeid alanGenelUcretlendirmeId', 'aucr.aciklama alanGenelUcretlendirmeAdi',
							 `${alias}.aktifparkid`, `${alias}.sonparkid`, `${alias}.aktifcagriid`)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, {ip, kartTelNox} = this;
		$.extend(hv, { /*ipnum: ip,*/ simkartno: asInteger(kartTelNox) })
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, {ipnum, simkartno, alanGenelUcretlendirmeId, alanGenelUcretlendirmeAdi} = rec;
		$.extend(this, { ip: ipnum?.toString() ?? '', kartTelNox: simkartno?.toString() ?? '', alanGenelUcretlendirmeId, alanGenelUcretlendirmeAdi })
	}
}
class MQMobil extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Mobil Cihaz' }
	static get table() { return 'omobil' } static get tableAlias() { return 'mob' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			telNo: new PInstStr('telno'), eMail: new PInstStr('email'), sifre: new PInstStr('md5sifre'), devreDisimi: new PInstBitBool('bdevredisi'),
			odemeYontemi: new PInstStr('odemeyontemi'), ozelUcretlendirmeId: new PInstGuid('ozelucretlendirmeid')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addTextInput('telNo', 'Telefon No').addStyle_wh(150);
			form.addPassInput('sifre', 'Şifre').onAfterRun(e => {
				const {builder} = e, {altInst, rootBuilder, input} = builder, {part} = rootBuilder, {yenimi} = part;
				if (!yenimi) { altInst.sifre = input.value = ''; input.attr('placeholder', 'Şifre değiştirmek için giriniz') }
			});
			form.addTextInput('eMail', 'e-Mail'); form.addTextInput('odemeYontemi', 'Ödeme Yöntemi').setMaxLength(5).addStyle_wh(150); form.addCheckBox('devreDisimi', 'Devre Dışı')
		form = tabPage_genel.addFormWithParent(); form.addModelKullan('ozelUcretlendirmeId', 'Özel Ücretlendirme').setMFSinif(MQUcretlendirme).kodsuz().comboBox();
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			telNo: new SecimOzellik({ etiket: 'Telefon No' }),
			eMail: new SecimOzellik({ etiket: 'e-Mail' }),
			odemeYontemi: new SecimOzellik({ etiket: 'Ödeme Yöntemi' }),
			ozelUcretlendirmeId: new SecimString({ etiket: 'Özel Ücretlendirme', mfSinif: MQUcretlendirme }),
			aktiflikSecim: new SecimTekSecim({ etiket: 'Cihaz Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="green">Aktif Olanlar</span>`, `<span class="red">DEVRE DIŞI Olanlar</span>`]) })
		})
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.ozellik(sec.telNo, `${alias}.telno`);
			wh.ozellik(sec.eMail, `${alias}.email`);
			wh.ozellik(sec.odemeYontemi, `${alias}.odemeyontemi`);
			wh.basiSonu(sec.ozelUcretlendirmeId, `${alias}.ozelucretlendirmeid`);
			let tSec = sec.aktiflikSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bdevredisi`)) }
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.devreDisimi)) { result.push('devreDisi') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'telno', text: 'Telefon No', genislikCh: 15 }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 60 }),
			new GridKolon({ belirtec: 'odemeyontemi', text: 'Ödeme', genislikCh: 10 }),
			new GridKolon({ belirtec: 'ozelUcretlendirmeAdi', text: 'Özel Ücretlendirme', genislikCh: 20, sql: 'ucr.aciklama' }),
			new GridKolon({ belirtec: 'devreDisimiText', text: 'DevreDışı?', genislikCh: 11, sql: MQSQLOrtak.tersBoolBitClause(`${alias}.bdevredisi`) })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.leftJoin({ alias, from: 'oucretlendirme ucr', on: `${alias}.ozelucretlendirmeid = ucr.id` });
		sent.sahalar.add(`${alias}.bdevredisi devreDisimi`)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, {sifre} = this;
		if (sifre) { hv.md5sifre = sifre.length == md5Length ? sifre : md5(sifre) } else { delete hv.md5sifre }
	}
}
class MQMobilKart extends MQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Mobil Cihaz' }
	static get table() { return 'omobilkart' } static get tableAlias() { return 'mkar' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static get adiSaha() { return 'krisim'} static get adiEtiket() { return 'İsim' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			mobilId: new PInstGuid('mobilid'), kayitTarih: new PInstDateNow(), kayitZamani: new PInstStr({ init: e => timeToString(now()) }),
			tip: new PInstStr('krtipi'), kartNo: new PInstStr('krkartno'), yilAy: new PInstNum('krbitisyilay'), cvv: new PInstStr('krcvv'),
			varsayilanmi: new PInstBitBool('bvarsayilan')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan('mobilId', 'Mobil Cihaz').comboBox().kodsuz().setMFSinif(MQMobil);
			form.addDateInput('kayitTarih', 'Kayıt Tarih'); form.addTimeInput('kayitZamani', 'Saat');
		form.addTextInput('tip', 'Kart Tipi').setMaxLength(5).addStyle_wh(100).addStyle(e => `$elementCSS > input { text-align: center }`);
		form = tabPage_genel.addFormWithParent(); 
			form.addTextInput('kartNo', 'Kart No').setMaxLength(16).addStyle_wh(250).addStyle(e => `$elementCSS > input { text-align: center }`);
			form.addNumberInput('yilAy', 'YılAy').setMaxLength(5).addStyle_wh(90); form.addCheckBox('varsayilanmi', 'Varsayılan?')
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			mobilId: new SecimString({ etiket: 'Mobil', mfSinif: MQMobil }), mobilAdi: new SecimOzellik({ etiket: 'Mobil Adı' }),
			kayitTarih: new SecimDate({ etiket: 'Kayit Tarihi' }), kartNo: new SecimOzellik({ etiket: 'Kart No' }), yilAy: new SecimInteger({ etiket: 'YılAy' }),
			varsayilanSecim: new SecimTekSecim({ etiket: 'Varsayılan', tekSecim: new BuDigerVeHepsi([`<span class="green">Varsayılan Olanlar</span>`, `<span class="red">Varsayılan OLMAYANLAR</span>`]) })
		})
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.mobilId, `${alias}.mobilid`); wh.ozellik(sec.mobilAdi, 'mob.aciklama');
			wh.basiSonu(sec.kayitTarih, `${alias}.eklentizamani`); wh.ozellik(sec.kartNo, `${alias}.krkartno`); wh.basiSonu(sec.yilAy, `${alias}.krbitisyilay`);
			let tSec = sec.varsayilanSecim.tekSecim; if (!tSec.hepsimi) { wh.add(tSec.getTersBoolBitClause(`${alias}.bvarsayilan`)) }
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (asBool(rec.varsayilanmi)) { result.push('varsayilan') } }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'mobilid', text: 'Mobil Cihaz ID', genislikCh: 36 }),
			new GridKolon({ belirtec: 'mobiladi', text: 'Mobil Cihaz Adı', genislikCh: 30, sql: 'mob.aciklama' }),
			new GridKolon({ belirtec: 'eklentizamani', text: 'Kayıt TS', genislikCh: 22 }),
			new GridKolon({ belirtec: 'krkartno', text: 'Kart No', genislikCh: 18 }),
			new GridKolon({ belirtec: 'krtipi', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'krbitisyilay', text: 'YılAy', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'krcvv', text: 'CVV', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bvarsayilan', text: 'Varsayılan?', genislikCh: 10 /*, sql: MQSQLOrtak.tersBoolBitClause(`${alias}.bvarsayilan`)*/ }).tipBool()
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.fromIliski('omobil mob', `${alias}.mobilid = mob.id`);
		sent.sahalar.add(`${alias}.bvarsayilan varsayilanmi`)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, {kayitTarih, kayitSaat} = this;
		$.extend(hv, { krkartno: hv.krkartno?.replaceAll(' ', ''), eklentizamani: isInvalidDate(kayitTarih) ? null : setTime(kayitTarih, asTime(kayitSaat)) })
	}
	setValues(e) {
		super.setValues(e); const {rec} = e; let {eklentizamani} = rec;
		if (eklentizamani) { eklentizamani = asDate(eklentizamani); $.extend(this, { kayitTarih: eklentizamani.clone().clearTime(), kayitZamani: timeToString(eklentizamani) }) }
	}
}
class MQRezervasyon extends MQGuid {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `Rezervasyon` }
	static get table() { return 'ocagri' } static get tableAlias() { return 'cag' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			kayitTS: new PInstDateNow('kayitts'), basTS: new PInstDate('basts'), bitTS: new PInstDate('bitts'), iptalBedeli: new PInstNum('iptalbedeli'),
			mobilId: new PInstGuid('mobilid'), durum: new PInstTekSecim('durum', RezervasyonDurum)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e, bedelFra = app?.params?.zorunlu.bedelFra || 2;
		let form = tabPage_genel.addFormWithParent(); form.addDateInput('kayitTS', 'Kayıt Zamanı'); form.addDateInput('basTS', 'Başlangıç'); form.addDateInput('bitTS', 'Bitiş');
		form = tabPage_genel.addFormWithParent(); form.addModelKullan('mobilId', 'Mobil').setMFSinif(MQMobil).kodsuz().comboBox();
			form.addNumberInput('iptalBedeli', 'İptal Bedeli').setFra(bedelFra).addStyle_wh(180); form.addModelKullan('durum', 'Durum').noMF().kodsuz().dropDown().addStyle_wh(100).setSource(e => RezervasyonDurum.kaListe)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			kayitTS: new SecimDate({ etiket: 'Kayıt Zamanı' }), basTS: new SecimDate({ etiket: 'Başlangıç Zamanı' }), bitTS: new SecimDate({ etiket: 'Bitiş Zamanı' }),
			telNo: new SecimOzellik({ etiket: 'Mobil', mfSinif: MQMobil }),
			durumSecim: new SecimTekSecim({ etiket: 'Durum', tekSecim: new BuDigerVeHepsi([`<span class="green">Aktif</span>`, `<span class="darkred">İPTAL</span>`]) })
		});
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.kayitTS, `${alias}.kayitts`); wh.basiSonu(sec.basTS, `${alias}.rezbasts`); wh.basiSonu(sec.bitTS, `${alias}.rezbitts`);
			wh.basiSonu(sec.telNo, `${alias}.telNo`); let tSec = sec.durumSecim.tekSecim; if (!tSec.hepsimi) { wh.degerAta(tSec.bumu ? '' : 'IP', `${alias}.durum`) }
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const belirtec = e.belirtec ?? e.dataField, {rec, result} = e, {durum} = rec;
		if (asBool(rec.devreDisimi || durum == 'IP')) { result.push('devreDisi') }
		if (!durum && belirtec == 'durumText') { result.push('aktif') }
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'kayitts', text: 'Kayıt Zamanı', genislikCh: 18 }),
			new GridKolon({ belirtec: 'rezbasts', text: 'Başlangıç', genislikCh: 18 }),
			new GridKolon({ belirtec: 'rezbitts', text: 'Bitiş', genislikCh: 18 }),
			new GridKolon({ belirtec: 'iptalbedeli', text: 'İptal Bedeli', genislikCh: 16 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'mobiladi', text: 'Mobil Adı', genislikCh: 30, sql: 'mob.aciklama' }),
			new GridKolon({ belirtec: 'durumText', text: 'Durum', genislikCh: 10, sql: RezervasyonDurum.getClause(`${alias}.durum`) })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.leftJoin({ alias, from: 'omobil mob', on: `${alias}.mobilid = mob.id` });
		sent.sahalar.addWithAlias(alias, 'durum')
	}
}
class MQParkIslem extends MQGuid {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Park İşlem' }
	static get table() { return 'oparkislem' } static get tableAlias() { return 'prk' } static get kodSaha() { return 'id' } static get tumKolonlarGosterilirmi() { return true }
	get kayitTarih() { let value = asDate(this.kayitTS); return isInvalidDate(value) ? null : value.clone().clearTime() } set kayitTarih(value) { this.kayitTS = asDate(value) }
	get kayitZamani() { return timeToString(asDate(this.kayitTS)) || '' } set kayitZamani(value) { this.kayitTS = setTime(this.kayitTS, value) }
	get cikisTarih() { let value = asDate(this.cikisTS); return isInvalidDate(value) ? null : value.clone().clearTime() } set cikisTarih(value) { this.cikisTS = asDate(value) }
	get cikisZamani() { return timeToString(asDate(this.cikisTS)) || '' } set cikisZamani(value) { this.cikisTS = setTime(this.cikisTS, value) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			durum: new PInstTekSecim('durum', CihazDurum), kayitTS: new PInstDateNow('kayitts'), cikisTS: new PInstDate('cikists'), parkBedeli: new PInstNum('parkbedeli'),
			mobilId: new PInstGuid('mobilid'), cihazId: new PInstGuid('cihazid'), ucretId: new PInstGuid('ucretid'), cagriId: new PInstGuid('cagriid')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent();
			form.addDateInput('kayitTarih', 'Kayıt Zamanı'); form.addTimeInput('kayitZamani', '');
			form.addDateInput('cikisTarih', 'Çıkış Zamanı'); form.addDateInput('cikisZamani', '');
			form.addNumberInput('parkBedeli', 'Park Bedeli').setFra(2).addStyle_wh(130);
		form = tabPage_genel.addFormWithParent(); form.addModelKullan('mobilId', 'Mobil').setMFSinif(MQMobil).kodsuz().comboBox(); form.addModelKullan('cihazId', 'Cihaz').setMFSinif(MQCihaz).kodsuz().comboBox();
		form = tabPage_genel.addFormWithParent(); form.addModelKullan('ucretId', 'Ücretlendirme').setMFSinif(MQUcretlendirme).kodsuz().comboBox(); form.addModelKullan('cagriId', 'Rezervasyon').setMFSinif(MQRezervasyon).kodsuz().comboBox();
		form = tabPage_genel.addFormWithParent(); form.addTextInput('durum', 'Durum').addStyle_wh(80)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.grupTopluEkle([
			{ kod: 'zaman', aciklama: 'Zaman' }, { kod: 'mobil', aciklama: 'Mobil', kapali: true }, { kod: 'cihaz', aciklama: 'Cihaz', kapali: true },
			{ kod: 'cagri', aciklama: 'Rezervasyon', kapali: true }, { kod: 'ucretlendirme', aciklama: 'Ücretlendirme', kapali: true }
		]);
		sec.secimTopluEkle({
			kayitTS: new SecimDate({ etiket: 'Kayıt Zamanı', grupKod: 'zaman' }), cikisTS: new SecimDate({ etiket: 'Çıkış Zamanı', grupKod: 'zaman' }),
			cikisDurumSecim: new SecimTekSecim({ etiket: 'Çıkış Durumu', tekSecim: new BuDigerVeHepsi([`<span class="green">Cıkış Yapanlar</span>`, `<span class="red">Çıkış Yap<u class="bold">MA</u>yanlar`]).diger(), grupKod: 'zaman' }),
			mobilId: new SecimString({ etiket: 'Mobil', mfSinif: MQMobil, grupKod: 'mobil' }), mobilAdi: new SecimOzellik({ etiket: 'Mobil Adı', grupKod: 'mobil' }),
				mobilTelNo: new SecimOzellik({ etiket: 'Mobil Tel No', grupKod: 'mobil' }),
			cihazId: new SecimString({ etiket: 'Cihaz', mfSinif: MQCihaz, grupKod: 'cihaz' }), cihazAdi: new SecimOzellik({ etiket: 'Cihaz Adı', grupKod: 'cihaz' }),
			cagriId: new SecimString({ etiket: 'Rezervasyon', mfSinif: MQRezervasyon, grupKod: 'cagri' }),
			ucretId: new SecimString({ etiket: 'Ücretlendirme', mfSinif: MQUcretlendirme, grupKod: 'ucretlendirme' }), ucretAdi: new SecimOzellik({ etiket: 'Ücretlendirme Adı', grupKod: 'ucretlendirme' }),
			parkBedeli: new SecimNumber({ etiket: 'Park Bedeli', grupKod: 'ucretlendirme' })
		});
		/* cihaz durum: '':bosta, REZ:trzerve, KUL:kullaniliyor */
		sec.whereBlockEkle(e => {
			const alias = this.tableAlias, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.kayitTS, `${alias}.kayitts`); wh.basiSonu(sec.cikisTS, `${alias}.cikists`);
			let tSec = sec.cikisDurumSecim.tekSecim; if (!tSec.hepsimi) { wh.add(`${alias}.cikists IS${tSec.bumu ? ' NOT' : ''} NULL`) };
			wh.basiSonu(sec.mobilId, `${alias}.mobilid`); wh.ozellik(sec.mobilAdi, 'mob.aciklama');
				wh.ozellik(sec.mobilTelNo, `mob.telno`);
			wh.basiSonu(sec.cihazId, `${alias}.cihazid`); wh.ozellik(sec.cihazAdi, 'cih.aciklama');
			wh.basiSonu(sec.cagriId, `${alias}.cagriid`);
			wh.basiSonu(sec.ucretId, `${alias}.ucretid`); wh.ozellik(sec.ucretAdi, 'ucr.aciklama');
			wh.basiSonu(sec.parkBedeli, `${alias}.parkbedeli`)
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtakAyarlar.orjBaslikListesi_argsDuzenle(e) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const alias = e.alias ?? this.tableAlias, {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'kayitts', text: 'Kayıt Zamanı', genislikCh: 18 }),
			new GridKolon({ belirtec: 'cikists', text: 'Çıkış Zamanı', genislikCh: 18 }),
			new GridKolon({ belirtec: 'mobiladi', text: 'Mobil Adı', genislikCh: 30, sql: 'mob.aciklama' }),
			new GridKolon({ belirtec: 'mobiltelno', text: 'Mobil Tel. No', genislikCh: 16, sql: 'mob.telno' }),
			new GridKolon({ belirtec: 'cihazadi', text: 'Cihaz Adı', genislikCh: 30, sql: 'cih.aciklama' }),
			new GridKolon({ belirtec: 'ucretlendirmeadi', text: 'Ücretlendirme', genislikCh: 30, sql: 'ucr.aciklama' }),
			new GridKolon({ belirtec: 'parkbedeli', text: 'Park Bedeli', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'cagritelno', text: 'Rez. Telefon', genislikCh: 30, sql: 'cag.telno' }),
			new GridKolon({ belirtec: 'durum', text: 'Durum', genislikCh: 8 })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const alias = e.alias ?? this.tableAlias, {sent} = e;
		sent.fromIliski('omobil mob', `${alias}.mobilid = mob.id`);
		sent.fromIliski('ocihaz cih', `${alias}.cihazid = cih.id`);
		sent.fromIliski('oucretlendirme ucr', `${alias}.ucretid = ucr.id`);
		sent.leftJoin({ alias, from: 'ocagri cag', on: `${alias}.cagriid = cag.id` });
		sent.sahalar.addWithAlias(alias, 'durum')
	}
}
