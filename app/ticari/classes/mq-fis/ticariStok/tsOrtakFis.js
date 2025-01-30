class TSOrtakFis extends MQTicariGenelFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return super.detaySinif }
	static detaySiniflarDuzenle(e) { super.detaySiniflarDuzenle(e); e.liste.push(TSStokDetay, TSAciklamaDetay) }
	static get aciklamaDetaySinif() { return TSAciklamaDetay } static get gridKontrolcuSinif() { return TSGridKontrolcu }
	static get baslikOzelAciklamaTablo() { return null } static get dipSerbestAciklamaTablo() { return null } static get dipEkBilgiTablo() { return null }
	static get stokmu() { return false } static get ticarimi() { return false } static get tsnKullanilirmi() { return true }
	static get numTipKod() { return null } static get islTipKod() { return null } static get varsayilanIslKod() { return null }
	static get oncelik() { return 0 } static get cikisGibimi() { return false } static get girisGibimi() { return false }
	static get iademi() { return this.iade == 'I' } static get numYapi() { return new MQTicNumarator({ tip: this.numTipKod }) }
	static get mustSaha() { return null } get eIslemSinif() { return EIslemOrtak.getClass({ tip: this.efAyrimTipi })}

	constructor(e) { e = e || {}; super(e); }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			takipNo: new PInstStr('orttakipno'), takipOrtakmi: new PInstTrue('takiportakdir'),
			islKod: new PInstStr({ rowAttr: 'islkod', init: e => this.varsayilanIslKod }), hesapSekli: new PInstTekSecim('hesapsekli', FisHesapSekli),
			efAyrimTipi: new PInstTekSecim('efayrimtipi', EIslemTip), baslikAciklama: new PInstStr('cariaciklama')
		})
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler, {kullanim} = app.params.ticariGenel;
		sec.secimTopluEkle({
			islKod: new SecimString({ etiket: 'İşlem', mfSinif: MQStokIslem }),
			takipNo: (kullanim.takipNo ? new SecimString({ etiket: 'Takip No', mfSinif: MQTakipNo }) : null),
			efAyrimTipi: new SecimBirKismi({ etiket: 'e-İşlem', tekSecimSinif: EIslemTip })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.islKod, `${aliasVeNokta}islkod`);
			if (sec.takipNo) { wh.basiSonu(sec.takipNo, `${aliasVeNokta}orttakipno`) }
			wh.birKismi(sec.efAyrimTipi, `${aliasVeNokta}efayrimtipi`)
		})
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e); const sec = e.secimler;
		sec.secimTopluEkle({ baslikAciklama: new SecimOzellik({ etiket: 'Belge Açıklama' }) });
		sec.whereBlockEkle(e => { const {aliasVeNokta} = this, wh = e.where, sec = e.secimler; wh.ozellik(sec.baslikAciklama, `${aliasVeNokta}cariaciklama`) })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); const {tsnForm, baslikForm} = e.builders;
		tsnForm.addFormWithParent('efatGosterim')
			.onBuildEk(e => {
				const {builder} = e, {layout, altInst, rootPart} = builder, efAyrimTipi = altInst.efAyrimTipi?.char ?? altInst.efAyrimTipi;
				const cls = EIslemOrtak.getClass(efAyrimTipi); layout.html(cls ? (cls.sinifAdi || '') : '')
				rootPart.layout.attr('data-efAyrimTipi', efAyrimTipi || ''); rootPart.builder_efatGosterim = builder
			})
			.addStyle(e => `$elementCSS { min-width: auto !important; max-width: 100px !important; width: max-content !important; height: max-content !important; margin-top: 28px; padding: 8px 15px !important; border-radius: 8px }`)
		tsnForm.addModelKullan('islKod').setMFSinif(MQStokIslem).dropDown().etiketGosterim_normal().addStyle_wh(200)
				.ozelQueryDuzenleBlock(e => { const {builder, alias, stm} = e, {islTipKod} = builder.altInst; for (const sent of stm.getSentListe()) { sent.where.degerAta(islTipKod, `${alias}.isltip`) } })
				.onBuildEk(e => { const {builder} = e, {altInst} = builder; builder.oldValue = builder.value = altInst.islKod })
				.degisince(async e => {
					const {builder} = e, {altInst, rootPart} = builder, {kontrolcu} = rootPart, islKod = e.value;
					const islKod2OzelIsaret = (await MQStokIslem.getKod2OzelIsaret()) || {}, ozelIsaret = altInst.ozelIsaret = islKod2OzelIsaret[islKod] || '';
					if (kontrolcu?.islKodIsaretDegisti) {
						const {oldValue} = builder, eskiOzelIsaret = islKod2OzelIsaret[oldValue] || '';
						if ((eskiOzelIsaret == '*') != (ozelIsaret == '*')) {
							e.sender = e.gridPart = rootPart; $.extend(e, { builder, oldValue, ozelIsaret, eskiOzelIsaret });
							inst.ozelIsaretDegisti(e); kontrolcu.islKodIsaretDegisti(e)
						}
					}
					builder.oldValue = islKod
				});
		if (app.params.ticariGenel.kullanim.takipNo) {
			baslikForm.builders[0].addCheckBox('takipOrtakmi', 'Takip Ortakdır').degisince(e => {
				const {builder} = e, {altInst, rootPart, parentBuilder} = builder, {kontrolcu} = rootPart; parentBuilder.id2Builder.takipNo.updateVisible();
				e.sender = e.gridPart = rootPart; $.extend(e, { builder });
				if (altInst.takipOrtakmiDegisti) { altInst.takipOrtakmiDegisti(e) } if (kontrolcu.takipOrtakmiDegisti) { kontrolcu.takipOrtakmiDegisti(e) }
			});
			baslikForm.builders[0].addModelKullan('takipNo').setMFSinif(MQTakipNo).comboBox().etiketGosterim_normal().addStyle_wh(400)
				.setVisibleKosulu(e => e.builder.altInst.takipOrtakmi ? true : 'basic-hidden')
		}
		baslikForm.builders[2].addTextInput('baslikAciklama', 'Fiş Açıklama').setPlaceHolder('Fiş Açıklama').etiketGosterim_normal()
				.addStyle(e => `$elementCSS  { min-width: 150px !important; max-width: 400px !important }`)
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e) }
	static standartGorunumListesiDuzenle_son(e) { super.standartGorunumListesiDuzenle_son(e); const {liste} = e; liste.push('cariaciklama') }
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e); const {liste} = e, {kullanim} = app.params.ticariGenel;
		liste.push(...[
			new GridKolon({ belirtec: 'islkod', text: 'İşlem', genislikCh: 8 }),
			(kullanim.takipNo ? new GridKolon({ belirtec: 'orttakipno', text: 'Takip No', genislikCh: 8 }) : null),
			(kullanim.takipNo ? new GridKolon({ belirtec: 'takipadi', text: 'Takip Adı', genislikCh: 20, sql: 'tak.aciklama' }) : null),
			new GridKolon({
				belirtec: 'efayrimtipi', text: 'e-İşl.', genislikCh: 6,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => { value = value || 'A'; const result = [belirtec]; if (value) { result.push(`eIslem-${value}`) } return result },
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const tip = (value || '').trim() || 'A', cls = EIslemOrtak.getClass({ tip });
					html = changeTagContent(html, (cls ? cls.kisaAdi : null) || ''); return html
				}
			})
		].filter(x => !!x))
	}
	static orjBaslikListesiDuzenle_son(e) {
		super.orjBaslikListesiDuzenle_son(e); const {liste} = e;
		liste.push( new GridKolon({ belirtec: 'cariaciklama', text: 'Fiş Açıklama', genislikCh: 40 }) )
	}
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const {kullanim} = app.params.ticariGenel;
		const section = [( kullanim.eFatura ? 'FTBaslikFisEFat-Ortak' : null )]; await e.kat.ekSahaYukle({ section })
	}
	static async raporKategorileriDuzenle_baslikDetayArasi(e) {
		await super.raporKategorileriDuzenle_baslikDetayArasi(e); const {modelRapor} = e;
		let kat = e.kat = new RKolonKategori({ kod: 'STOK', aciklama: 'Stok/Hizmet' });
		modelRapor.addKolonKategori(kat); await kat.ekSahaYukle({ section: ['FRFisTSDetay-Master', 'FRFisTSDetay-Barkod'] })
	}
	static async raporKategorileriDuzenle_detaylar(e) {
		await super.raporKategorileriDuzenle_detaylar(e); const {kat} = e;
		await this.raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e)
		$.extend(e, { shdDisi: 3, fiiliHareketmi: !this.siparismi }); await this.raporKategorileriDuzenle_detaylar_hmr(e);
		const {stokGenel} = app.params, {hmr, kullanim} = stokGenel;
		let section = [
			( kullanim.seriNo ? 'FRFisTSDetay-Seri' : null ),
			( kullanim.paket ? 'FRFisTSDetay-Koli' : null ),
			'FRFisTSDetay-Miktar'
		];
		await kat.ekSahaYukle({ section }); await this.raporKategorileriDuzenle_detaylar_miktarEk(e);
		sections = [
			( kullanim.malFazlasi ? 'FRFisTSDetay-MalFazlasi' : null ),
			( kullanim.hacim ? 'FRFisTSDetay-Hacim' : null ),
			'FRFisTSDetay-Miktar2',
			'FRFisTSDetay-FiyatBedel'
		];
		await kat.ekSahaYukle({ section: sections });
		await this.raporKategorileriDuzenle_detaylar_fiyatEk(e);
		sections = [
			( kullanim.rbk ? 'FRFisTSDetay-RBK' : null ),
			'FRFisTSDetay-Son',
			( hmr.lotNo && kullanim.dayaniksizGaranti ? 'FRFisTSDetay-LotDayaniksiz' : null )
		];
		await kat.ekSahaYukle({ section: sections })
	}
	static raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e) { }
	static raporKategorileriDuzenle_detaylar_miktarEk(e) { }
	static raporKategorileriDuzenle_detaylar_fiyatEk(e) { }
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent} = e;
		sent.leftJoin({ alias: 'fis', table: `${this.baslikOzelAciklamaTablo} back`, on: 'fis.kaysayac = back.fissayac' });
		sent.leftJoin({ alias: 'fis', table: `${this.dipSerbestAciklamaTablo} dack`, on: 'fis.kaysayac = dack.fissayac' });
		sent.fromIliski('stkisl isl', 'fis.islkod = isl.kod');
		sent.fromIliski('takipmst otak', 'fis.orttakipno = otak.kod');
	}
	static raporQueryDuzenle_detaylar(e) { super.raporQueryDuzenle_detaylar(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('takipmst tak', 'fis.orttakipno = tak.kod');
		sent.sahalar.add(`${aliasVeNokta}efayrimtipi`)
	}
	async yeniVeyaDegistirOncesiIslemler(e) { await super.yeniVeyaDegistirOncesiIslemler(e); await MQStokIslem.getKod2OzelIsaret(e) }
	async yeniVeyaDegistirSonrasiIslemler(e) { await super.yeniVeyaDegistirSonrasiIslemler(e) }
	async degistirSonrasiIslemler(e) { await super.degistirSonrasiIslemler(e) }
	async detaylariYukleSonrasi(e) {
		e = e || {}; await super.detaylariYukleSonrasi(e);
		let {detaylar} = this; this._orjDetaylar = $.merge([], detaylar);
		let aktifUstDetay; const _detaylar = [];
		for (const det of detaylar) {
			if (det.aciklamami) { if (aktifUstDetay) { if (aktifUstDetay.altAciklama) { aktifUstDetay.altAciklama += CrLf } aktifUstDetay.altAciklama += det.aciklama } }
			else { aktifUstDetay = det; _detaylar.push(det) }
		}
		detaylar = this.detaylar = _detaylar
	}
	uiKaydetOncesiIslemler(e) {
		super.uiKaydetOncesiIslemler(e); let degistimi = false, {fis} = e; const _detaylar = [], {detaylar} = fis;
		for (const det of detaylar) {
			if (det.ekBilgimi) continue
			const altAciklama = (det.altAciklama || '').trimEnd(); det.altAciklama = null; _detaylar.push(det);
			if (altAciklama) {
				const partsArray = uygunKelimeliParcala(altAciklama, 70);
				for (const parts of partsArray) { for (const aciklama of parts) { _detaylar.push(new TSAciklamaDetay({ aciklama })) } }
				degistimi = true
			}
		}
		if (degistimi) { fis.detaylar = _detaylar; e.fis = fis }
	}
	uiSatirBedelHesaplaSonrasi(e) { }
	cariDegisti(e) {
		e = e || {}; const rec = e.item || e.rec || {}, eFatmi = asBoolQ(rec.efaturakullanirmi);
		if (eFatmi != null) {
			const efAyrimTipi = (this.class.faturami ? (eFatmi ? EIslFatura.tip : null) : null); this.efAyrimTipi.char = efAyrimTipi || 'A'
			const builder = e.builder || {}, {layout, builder_efatGosterim} = builder.rootPart || {};
			// const input = layout.find(`.formBuilder-element.parent[data-builder-id="efatGosterim"] > div`);
			if (layout?.length) layout.attr('data-efAyrimTipi', efAyrimTipi || '');
			if (builder_efatGosterim) { const cls = EIslemOrtak.getClass(efAyrimTipi); builder_efatGosterim.layout.html(cls ? cls.sinifAdi : '') }
		}
	}
	efAyrimTipiDegisti(e) { }
	takipNoDegisti(e) { }
}
