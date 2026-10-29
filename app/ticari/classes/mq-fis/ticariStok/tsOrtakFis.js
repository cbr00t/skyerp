class TSOrtakFis extends MQTicariGenelFis {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return super.detaySinif } static get aciklamaKullanilirmi() { return true }
	static detaySiniflarDuzenle({ liste }) {
		super.detaySiniflarDuzenle(...arguments)
		liste.push(...[
			TSStokDetay,
			TSAciklamaDetay
		].filter(cls => cls.uygunmu))
	}
	static get aciklamaDetaySinif() { return TSAciklamaDetay }
	static get gridKontrolcuSinif() { return TSGridKontrolcu }
	static get baslikOzelAciklamaTablo() { return null }
	static get dipSerbestAciklamaTablo() { return null }
	static get dipEkBilgiTablo() { return null }
	static get stokmu() { return false }
	static get ticarimi() { return false }
	static get tsnKullanilirmi() { return true }
	static get numTipKod() { return null }
	static get islTipKod() { return null }
	static get varsayilanIslKod() { return null }
	static get oncelik() { return 0 }
	static get cikisGibimi() { return false }
	static get girisGibimi() { return false }
	static get iademi() { return this.iade == 'I' }
	static get numYapi() { return new MQTicNumarator({ tip: this.numTipKod }) }
	static get mustSaha() { return null }
	get eIslemSinif() { return EIslemOrtak.getClass({ tip: this.efAyrimTipi })}
	static get sonStokKullanilirmi() { return true }
	static get yerKullanilirmi() { return true }
	get kosulYapilar() { return this._kosulYapilar }
	set kosulYapilar(value) { this._kosulYapilar = value }

	static getUISplitHeight(e) { return 300 }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			takipNo: new PInstStr('orttakipno'), takipOrtakmi: new PInstTrue('takiportakdir'),
			islKod: new PInstStr({ rowAttr: 'islkod', init: e => this.varsayilanIslKod }),
			hesapSekli: new PInstTekSecim('hesapsekli', FisHesapSekli),
			efAyrimTipi: new PInstTekSecim('efayrimtipi', EIslemTip),
			uuid: new PInstStr('efatuuid'),
			baslikAciklama: new PInstStr('cariaciklama'),
			fisEkBilgi: new PInstStr()
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let { kullanim } = app.params.ticariGenel
		sec.secimTopluEkle({
			islKod: new SecimString({ etiket: 'İşlem', mfSinif: MQStokIslem }),
			takipNo: (kullanim.takipNo ? new SecimString({ etiket: 'Takip No', mfSinif: MQTakipNo }) : null),
			efAyrimTipi: new SecimBirKismi({ etiket: 'e-İşlem', tekSecimSinif: EIslemTip })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let { aliasVeNokta } = this
			wh.basiSonu(sec.islKod, `${aliasVeNokta}islkod`)
			if (sec.takipNo)
				wh.basiSonu(sec.takipNo, `${aliasVeNokta}orttakipno`)
			wh.birKismi(sec.efAyrimTipi, `${aliasVeNokta}efayrimtipi`)
		})
	}
	static secimlerDuzenleSon({ secimler: sec }) {
		super.secimlerDuzenleSon(...arguments)
		sec.secimTopluEkle({ baslikAciklama: new SecimOzellik({ etiket: 'Belge Açıklama' }) });
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let { aliasVeNokta } = this
			wh.ozellik(sec.baslikAciklama, `${aliasVeNokta}cariaciklama`)
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let { builders } = e
		let { tsnForm, baslikForm } = builders
		let { yerKullanilirmi } = this

		/*;baslikForm.builders.forEach((fbd, i) => {
			if (i >= 3)
				fbd.altAlta()
		})*/
		
		tsnForm.addFormWithParent('efatGosterim')
			.onBuildEk(({ builder: fbd }) => {
				let { layout, altInst: inst, rootPart } = fbd
				let { efAyrimTipi } = inst
				efAyrimTipi = efAyrimTipi?.char ?? inst
				
				;{
					let { sinifAdi } = EIslemOrtak.getClass(efAyrimTipi) ?? {}
					layout.html(sinifAdi ?? '')
				}
				
				;{
					let { layout: rootLayout } = rootPart
					rootLayout.attr('data-efAyrimTipi', efAyrimTipi || '')
					rootPart.builder_efatGosterim = fbd
				}
			})
			.addStyle(
				`$elementCSS {
					min-width: auto !important; max-width: 100px !important;
					width: max-content !important; height: max-content !important;
					margin-top: 28px; padding: 8px 15px !important; border-radius: 8px
				}`
			)
		
		tsnForm.addModelKullan('islKod')
			.dropDown().kodsuz().listedenSecilmez()
			.bosKodAlinmaz().bosKodEklenmez()
			.etiketGosterim_normal().addStyle_wh(200)
			.setMFSinif(MQStokIslem)
			.ozelQueryDuzenleBlock(({ builder: fbd, alias, stm }) => {
				let {altInst} = fbd, islTipKod = altInst?.islTipKod ?? altInst?.class?.islTipKod
				if (islTipKod) { for (let {where: wh} of stm) { wh.degerAta(islTipKod, `${alias}.isltip`) } }
			})
			.onBuildEk(({ builder: fbd, builder: { altInst: inst } }) =>
				fbd.oldValue = fbd.value = inst.islKod)
			.degisince(async ({ builder: fbd, value }) => {
				let e = { ...arguments[0], fbd, value }
				let { altInst: inst, rootPart, oldValue } = fbd
				let { kontrolcu } = rootPart
				let islKod2OzelIsaret = (await MQStokIslem.getKod2OzelIsaret()) ?? {}
				let ozelIsaret = inst.ozelIsaret = islKod2OzelIsaret[value] || ''
				let eskiOzelIsaret = islKod2OzelIsaret[oldValue] || ''
				extend(e, { ozelIsaret, eskiOzelIsaret, builder: fbd, kontrolcu, value, oldValue, ozelIsaret, eskiOzelIsaret })
				e.sender = e.gridPart = rootPart
				await inst?.islKodDegisti?.(e)
				fbd.oldValue = value
			})

		tsnForm.addModelKullan('hesapSekli', 'Hesap Şekli')
			.setPlaceholder('Hesap Şekli')
			.dropDown().noMF()
			.kodsuz().bosKodAlinmaz().bosKodEklenmez()
			.setSource(FisHesapSekli.kaListe)
			.degisince(_e => {
				let { builder: fbd, builder: { altInst: inst, parentBuilder: { id2Builder } } } = _e
				inst?.hesapSekliDegisti({ ..._e, ...e })
			})
			.addStyle_wh(300)

		if (yerKullanilirmi) {
			baslikForm.builders[2].addCheckBox('yerOrtakmi', 'Yer Ortakdır')
				.degisince(e => {
					let { builder } = e
					let { altInst, rootPart, parentBuilder } = builder
					let { kontrolcu } = rootPart
					parentBuilder.id2Builder.yerKod.updateVisible()
					e.sender = e.gridPart = rootPart
					extend(e, { builder })
					altInst?.yerOrtakmiDegisti?.(e)
					kontrolcu?.yerOrtakmiDegisti?.(e)
				})
			baslikForm.builders[2].addSimpleComboBox('yerKod', 'Yer', 'Yer')
				.etiketGosterim_yok()
				.setMFSinif(MQStokYer)
				.autoBind()
				.addStyle_wh(600)
				.setVisibleKosulu(({ builder: { altInst: inst }}) =>
					inst.yerOrtakmi ? true : 'basic-hidden')
		}
		
		if (app.params.ticariGenel.kullanim.takipNo) {
			baslikForm.builders[1].addCheckBox('takipOrtakmi', 'Takip Ortakdır').degisince(({ builder: fbd }) => {
				let {altInst, rootPart, parentBuilder} = fbd, {kontrolcu} = rootPart
				parentBuilder.id2Builder.takipNo.updateVisible()
				e.sender = e.gridPart = rootPart
				e.builder = fbd
				if (altInst.takipOrtakmiDegisti) { altInst.takipOrtakmiDegisti(e) }
				if (kontrolcu.takipOrtakmiDegisti) { kontrolcu.takipOrtakmiDegisti(e) }
			});
			baslikForm.builders[1].addSimpleComboBox('takipNo')
				.etiketGosterim_yok()
				.setMFSinif(MQTakipNo)
				.addStyle_wh(600)
				.setVisibleKosulu(({ builder: fbd }) =>
					( fbd.altInst.takipOrtakmi ?? true ) ? true : 'basic-hidden')
		}
	}

	static rootFormBuilderDuzenle_son(e) {
		super.rootFormBuilderDuzenle_son(e)
		let { builders } = e
		let { tsnForm, baslikForm } = builders
		baslikForm.builders[7].addTextInput('baslikAciklama', 'Fiş Açıklama')
			.setPlaceHolder('Fiş Açıklama').etiketGosterim_yok()
			.onAfterRun(({ builder: { input, rootPart: tanimPart = {} }}) => {
				input.on('keydown', ({ key }) => {
					key = key?.toLowerCase()
					if (key == 'enter' || key == 'linefeed' || key == 'f2') {
						let { selectedBelirtec: b, selectedRowIndex: r, gridWidget: w } = tanimPart
						w?.focus()
						//w?.begincelledit(r, b)
					}
				})
			})
			.addStyle_wh(600)

		baslikForm.builders.at(-1).addTextArea('fisEkBilgi', 'Fiş Ek Bilgi')
			.setPlaceHolder('Fiş Ek Bilgi')
			.etiketGosterim_yok()
			.setRows(3).setCols(1000)
			.addStyle_wh('var(--full)')
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e) }
	static standartGorunumListesiDuzenle_son({ liste }) {
		super.standartGorunumListesiDuzenle_son(...arguments)
		liste.push('cariaciklama')
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e)
		const {liste} = e, {kullanim} = app.params.ticariGenel
		liste.push(...[
			new GridKolon({ belirtec: 'islkod', text: 'İşlem', genislikCh: 8 }),
			(kullanim.takipNo ? new GridKolon({ belirtec: 'orttakipno', text: 'Takip No', genislikCh: 8 }) : null),
			(kullanim.takipNo ? new GridKolon({ belirtec: 'takipadi', text: 'Takip Adı', genislikCh: 20, sql: 'tak.aciklama' }) : null),
			new GridKolon({
				belirtec: 'efayrimtipi', text: 'e-İşl.', genislikCh: 6,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					value = value || 'A';
					let result = [belirtec]; if (value) { result.push(`eIslem-${value}`) }
					return result
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let tip = (value || '').trim() || 'A', cls = EIslemOrtak.getClass({ tip });
					html = changeTagContent(html, (cls ? cls.kisaAdi : null) || ''); return html
				}
			})
		].filter(x => !!x))
	}
	static orjBaslikListesiDuzenle_son({ liste }) {
		super.orjBaslikListesiDuzenle_son(...arguments)
		liste.push(
			gridKolon('efatuuid', 'UUID (ETTN)', 46),
			gridKolon('cariaciklama', 'Fiş Açıklama', 40)
		)
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
	static loadServerData_queryDuzenle({ sent, sent: { sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		sent.fromIliski('takipmst tak', 'fis.orttakipno = tak.kod')
		sahalar.add(`${alias}.efayrimtipi`)
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e = {}) {
		await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)
		if (this.mustKod)
			await this.satisKosulYapiOlustur(e)
	}
	async yeniTanimOncesiIslemler(e = {}) {
		await super.yeniTanimOncesiIslemler(e)
	}
	async yukleSonrasiIslemler(e = {}) {
		await super.yukleSonrasiIslemler(e)
		let { sayac, class: { dipSerbestAciklamaTablo: tblSAck } } = this
		if (sayac && tblSAck) {
			let sent = new MQSent({ table: tblSAck }), { where: wh, sahalar } = sent
			wh.degerAta(sayac, 'fissayac')
			sahalar.add('aciklama')
			let recs = await sent.execSelect()
			this.fisEkBilgi = recs
				.map(r => r.aciklama.trimEnd())
				.join('\n')
		}
	}
	uiKaydetOncesiIslemler(e) { super.uiKaydetOncesiIslemler(e) }
	async kaydetOncesiIslemler(e = {}) {
		await super.kaydetOncesiIslemler(e)
		let { fisNo, numarator: num } = this
		let { sender = e.parentPart } = e
		let numPart = sender?.numaratorPart ?? sender?.parentPart?.numaratorPart
		if (!(fisNo || numPart?.otoNummu))
			throw { isError: true, errorText: '<b>Belge No</b> belirtilmelidir'}
		
		await MQStokIslem.getKod2OzelIsaret(e)
		;{
			let degistimi = false
			let detaylar = this.detaylar ??= []
			let yDetaylar = []
			for (let det of detaylar.filter(d => !d.ekBilgimi)) {
				let altAciklama = det.altAciklama?.trimEnd() ?? ''
				det.altAciklama = null
				yDetaylar.push(det)
				if (altAciklama) {
					let tokens = uygunKelimeliParcala(altAciklama, 70).flat()
					yDetaylar.push(
						...tokens
							.filter(Boolean)
							.map(aciklama => new TSAciklamaDetay({ aciklama }))
					)
					degistimi = true
				}
			}
			if (degistimi) {
				this.detaylar = yDetaylar
				this.detaylariNumaralandir(e)
				// e.fis = this
			}
		}
	}
	async kaydetSonrasiIslemler(e = {}) {
		await super.kaydetSonrasiIslemler(e)
		let { sayac: fissayac } = this
		
		if (!fissayac)
			return
		
		let { fisEkBilgi, class: fisSinif } = this
		let { dipSerbestAciklamaTablo: tblSAck, dipEkBilgiTablo: tblEAck } = fisSinif
		
		let toplu = new MQToplu().withTrn()
		if (tblSAck) {
			let table = tblSAck
			fisEkBilgi = fisEkBilgi?.trimEnd()
			let lines = fisEkBilgi ? [fisEkBilgi.slice(0, 8000)] : []
			let where = { degerAta: fissayac, saha: 'fissayac' }
			let hvListe = lines.map(aciklama => ({ fissayac, aciklama }))
			toplu.add(...[
				new MQIliskiliDelete({ table, where }),
				( empty(hvListe) ? null : new MQInsert({ table, hvListe }) )
			].filter(Boolean))
		}

		if (tblEAck) {
			let table = tblEAck
			let where = { degerAta: fissayac, saha: 'fissayac' }
			
			let hvListe = []
			for (let ei = 1; ei <= 2; ei++) {
				let kayittipi = `E${ei}`
				let lines = await this[`getEIslEkNotlar${ei}Lines`](e)
				if (empty(lines))
					continue

				hvListe.push(
					...lines.map((ekbilgi, i) => ({
						fissayac,
						kayittipi,
						kayitno: i + 1,
						ekbilgi
					}))
				)
			}

			toplu.add(...[
				new MQIliskiliDelete({ table, where }),
				new MQInsert({ table, hvListe })
			])
		}

		await this.kaydetSonrasiIslemler_ara({ ...e, toplu })

		if (!empty(toplu.liste))
			await toplu.execute()
	}
	async kaydetSonrasiIslemler_ara(e) { }
	async degistirSonrasiIslemler(e) { await super.degistirSonrasiIslemler(e) }
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let { efAyrimTipi: efayrimtipi } = this
		efayrimtipi = (isObject(efayrimtipi) ? efayrimtipi.char : efayrimtipi) || ''
		extend(hv, { efayrimtipi })
	}
	async detaylariYukleSonrasi(e = {}) {
		await super.detaylariYukleSonrasi(e)
		let { detaylar } = this
		let aktifUstDetay, _detaylar = []
		this._orjDetaylar = [...detaylar]
		for (const det of detaylar) {
			if (det.aciklamami) {
				if (aktifUstDetay) {
					if (aktifUstDetay.altAciklama)
						aktifUstDetay.altAciklama += CrLf
					aktifUstDetay.altAciklama += det.aciklama
				}
			}
			else {
				aktifUstDetay = det
				_detaylar.push(det)
			}
		}
		detaylar = this.detaylar = _detaylar
	}
	async satisKosulYapiOlustur(e) { return this }
	uiSatirBedelHesaplaSonrasi(e) { }
	async cariDegisti(e = {}) {
		await this.disFisGiris_ekIslemler(e)
	}
	async disFisGiris_ekIslemler(e = {}) {
		await this.efatDurumBelirle(e)
		await this.cariIcinNumaratorBelirle(e)
		await this.satisKosulYapiOlustur(e)
	}
	async efatDurumBelirle(e = {}) {
		let rec = e.item ?? e.rec
		if (rec == null) {
			let { mustKod } = this
			if (!mustKod)
				return null
			
			let sent = new MQSent({ from: 'carmst' }), { where: wh, sahalar } = sent
			wh.degerAta(mustKod, 'must')
			sahalar.add('efaturakullanirmi')
			rec = await sent.execTekil()
		}
		
		let { efAyrimTipi, class: { faturami } } = this
		let eFatmi = asBoolQ(rec?.efaturakullanirmi)
		if (eFatmi != null) {
			efAyrimTipi = ( faturami
				? ( eFatmi ? EIslFatura.tip : null )
				: null
			) || 'A'
			this.efAyrimTipi.char = efAyrimTipi
			let { builder = {} } = e
			let { layout, builder_efatGosterim: efGosterim } = builder.rootPart || {}
			// const input = layout.find(`.formBuilder-element.parent[data-builder-id="efatGosterim"] > div`);
			if (layout?.length)
				layout.attr('data-efAyrimTipi', efAyrimTipi || '')
			if (efGosterim) {
				let cls = EIslemOrtak.getClass(efAyrimTipi)
				efGosterim.layout.html(cls?.kisaAdi ?? '')
			}
		}

		return efAyrimTipi
	}
	async numaratorDegisti(e) {
		await super.numaratorDegisti(e)
		if (!await this.numaratorUygunmu(e))
			wConfirm(`Seçilen numaratör ile Müşterinin e-İşlem durumu uygun değildir`)
	}
	async cariIcinNumaratorBelirle(e = {}) {
		let { builder: fbd } = e
		let { tanimPart = fbd?.rootPart ?? e.parentPart ?? e.sender } = e
		e.tanimPart ??= tanimPart
		
		if (await this.numaratorUygunmu(e))
			return true
		
		let { efAyrimTipi, numarator: num } = this
		let { tip, seri, class: { table, sayacSaha } } = num
		efAyrimTipi = ( isObject(efAyrimTipi) ? efAyrimTipi.char : efAyrimTipi )?.trim?.() || 'A'
		//seri = num.seri ||= this.seri
		
		let sayac
		;{
			let sent = new MQSent({ table }), { where: wh, sahalar } = sent
			wh
				.degerAta(tip, 'tip')
				.notDegerAta(seri, 'seri')
				.degerAta(efAyrimTipi, 'belgetipi')
			sahalar.add('sayac')
			sayac = await sent.execTekilDeger()
		}
		if (!sayac)
			return false

		extend(num, {
			sayac,
			belirtec: null, seri: null,
			noYil: 0, sonNo: 0
		})
		if (!await num.yukle({ ...e, rec: undefined }))
			return false

		let { numaratorPart: numPart } = tanimPart ?? {}
		numPart?.otoNumGoster?.(num)

		return true
	}
	async numaratorUygunmu({ efAyrimTipi, numarator: num }) {
		efAyrimTipi ??= this.efAyrimTipi
		num ??= this.numarator
		if (efAyrimTipi == null || num == null)
			return null
		
		let { sayac, tip, seri, class: { table, sayacSaha } } = num
		seri = num.seri ||= this.seri
		efAyrimTipi = ( isString(efAyrimTipi) ? efAyrimTipi : efAyrimTipi?.char )?.trim() ?? ''

		let numEF
		;{
			let sent = new MQSent({ table }), { where: wh, sahalar } = sent
			if (sayac)
				wh.degerAta(sayac, sayacSaha)
			else {
				wh
					.degerAta(tip, 'tip')
					.degerAta(seri, 'seri')
			}
			sahalar.add('belgetipi')
			numEF = ( await sent.execTekilDeger() )?.trim?.()
		}
		
		return numEF == efAyrimTipi
	}
	efAyrimTipiDegisti(e) { }
	async islKodDegisti(e = {}) {
		let { sender: tanimPart, ozelIsaret = this.ozelIsaret, eskiOzelIsaret } = e
		if ((eskiOzelIsaret == '*') != (ozelIsaret == '*'))
			await this?.islKodIsaretDegisti?.(e)
	}
	async islKodIsaretDegisti(e = {}) {
		let { sender: tanimPart, ozelIsaret = this.ozelIsaret, eskiOzelIsaret } = e
		let { kontrolcu = tanimPart?.kontrolcu } = e
		await kontrolcu?.islKodIsaretDegisti?.(e)
	}
	hesapSekliDegisti(e = {}) {
		let { hesapSekli } = this
		let hesapSekliKod = hesapSekli?.char ?? hesapSekli ?? ''
		let tanimPart = e.tanimPart ?? e.gridPart ?? e.sender ?? e.builder?.rootPart
		tanimPart = tanimPart?.gridPart ?? tanimPart
	
		let { gridWidget: w = tanimPart?.gridWidget, force } = e
		if (!w)
			return this
	
		let sonucBelirtec = (
			hesapSekliKod == 'F' ? 'fiyat' :
			hesapSekliKod == 'M' ? 'miktar' :
			'netBedel'
		)
	
		// Hesaplanan kolon kilitli, diğer iki kolon kullanıcı girişine açık
		let { belirtec2Kolon = {} } = tanimPart
		for (let belirtec of ['miktar', 'fiyat', 'netBedel']) {
			let editable = belirtec != sonucBelirtec
			let colDef = belirtec2Kolon[belirtec]
			if (colDef)
				colDef.isEditable = editable
			w.setcolumnproperty(belirtec, 'editable', editable)
		}
	
		let { _prev_hesapSekli: prev } = this
		this._prev_hesapSekli = hesapSekliKod
		if (!force && hesapSekliKod == prev)
			return this
	
		w.beginupdate()
		try {
			let detaylar = w.getboundrows() ?? []
			for (let i = 0; i < detaylar.length; i++) {
				let det = detaylar[i]
				if (!det?.shdDetaymi)
					continue
				
				let rowIndex = det.boundindex ?? i
				let _e = {
					...e, sender: tanimPart, fis: this,
					gridPart: tanimPart, gridWidget: w,
					detay: det, hesapSekliDegisimi: true,
					args: { rowindex: rowIndex }
				}
				
				let { kontrolcu = tanimPart?.kontrolcu } = e
				if (kontrolcu)
					kontrolcu.satirBedelHesapla(_e)
				else
					det.uiSatirBedelHesapla?.(_e)
			}
		}
		finally { w.endupdate(false) }
	
		delay(10).then(() =>
			tanimPart?.dipTazele?.())
	
		return this
	}
	takipNoDegisti(e) { }
	yerOrtakmiDegisti(e) { }
	
	static getDonusumYapi(e = {}) {
		let { detaySinif, detay } = e
		e.detaySinif = detaySinif ??= detay?.class ?? this.detaySinif
		return null
	}

	getMiktarToplamlari(e = {}) {
		let { detaylar } = this
		return this.class.getMiktarToplamlari({ ...e, detaylar })
	}
	static getMiktarToplamlari(e = {}) {
		let { detaylar = [], exclude = e.excludeSet } = e
		let { sadeceKoli = false, brutKiloFl = false } = e
		exclude = (
			empty(exclude) ? null :
			isArray(exclude) ? asSet(exclude) :
			exclude
		)
		let { brmDict = {}, paketKod_koli } = MQStok
		let kgBrmSet = asSet(MQStok.kgBirimler)
		
		let topBrutKilo = 0
		let brm2MiktarYapi = {}, koliKod2Miktar = {}
		let getRec = (brm, miktar, fra, validate) => {
			if (validate) {
				if (!brm || (exclude && !exclude[brm]))
					return null
			}
			
			miktar ||= 0; fra ||= 0
			return { brm, miktar, fra }
		}
		let ekle = (brm, miktar, fra, validate) => {
			let r = getRec(brm, miktar, fra, validate)
			if (!r)
				return r
			
			r.miktar += miktar
			if (fra !== undefined)
				r.fra = fra

			brm2MiktarYapi[brm] = r
			return r
		}
		let uygunsaEkle = (brm, miktar, fra) =>
			ekle(brm, miktar, fra, true)
		
		;detaylar
			.filter(d => d?.stokGibimi || isPlainObject(d))
			.forEach(d => {
				let { brm, brutMiktar = d.miktar, brm2, miktar2, brutKilo } = d
				let { paketKod, paketIcAdet, koli } = d
				if (!sadeceKoli)
					uygunsaEkle(brm, brutMiktar || miktar)
				if (brm != brm2)
					uygunsaEkle(brm2, miktar2)
				
				if (paketKod) {
					if (!koli && paketKod == paketKod_koli)
						koli = paketIcAdet
					if (koli)
						toplamEkle(koliKod2Miktar, paketKod, koli)
				}
				
				if (!sadeceKoli && brutKiloFl && brutKilo)
					topBrutKilo += brutKilo
			})

		let res = []
		if (!empty(koliKod2Miktar)) {
			let fra = 0
			res.push(
				...keys(koliKod2Miktar)
					.sort()
					.map(brm => ({ brm, miktar: koliKod2Miktar[brm], fra }))
			)
		}

		if (topBrutKilo > 0) {
			if (entries(brm2MiktarYapi).some(([brm, { miktar }]) =>
					kgBrmSet[brm] && miktar == topBrutKilo)) {
				topBrutKilo = 0
			}
		}
		if (topBrutKilo > 0)
			ekle('BrütKG', topBrutKilo, 3)
		
		res.push(
			...values(brm2MiktarYapi)
				.filter(Boolean)
		)
		
		return res
	}
	getMiktarToplamlariLines(e = {}) {
		let { detaylar } = this
		return this.class.getMiktarToplamlariStr({ ...e, detaylar })
	}
	static getMiktarToplamlariLines(e = {}) {
		let { miktarYapilar = e.brm2MiktarYapi, detaylar = [], satirYazilsin = true } = e
		miktarYapilar ??= this.getMiktarToplamlari(e)

		let res = []
		if (empty(miktarYapilar))
			return res
		
		if (isString(miktarYapilar))
			return makeArray(miktarYapilar)

		if (isPlainObject(miktarYapilar))
			miktarYapilar = values(miktarYapilar)

		const Brm_Satir = 'Satır'
		let lwBrm_Satir = Brm_Satir.toLocaleLowerCase()
		let satir
		if (satirYazilsin) {
			satir = miktarYapilar.find(({ brm }) =>
				brm?.toLocaleLowerCase() == lwBrm_Satir)
			if (satir)
				miktarYapilar = miktarYapilar.filter(r => r != satir)
		}
		
		if (!empty(miktarYapilar)) {
			res.push(
				miktarYapilar
					.map(({ miktar, brm }) => `${numberToString(miktar)} ${brm}`)
					.join(', ')
			)
		}

		let { length: satirSayi } = detaylar.filter(d => d.shKod && !d.ekBilgimi)
		if (!satir && satirSayi)
			satir = { brm: Brm_Satir, miktar: satirSayi }
		if (satir)
			res.push(`${numberToString(satir.miktar)} ${Brm_Satir}`)

		return res
	}
	getMiktarToplamlariStr(e = {}) {
		let { detaylar } = this
		return this.class.getMiktarToplamlariStr({ ...e, detaylar })
	}
	static getMiktarToplamlariStr(e = {}) {
		let lines = this.getMiktarToplamlariLines(e)
		return empty(lines) ? '' : lines.join(CrLf)
	}

	getBrutNetToplamlariLines(e = {}) {
		let baslik = this, { detaylar } = this
		return this.class.getBrutNetToplamlariLines({ ...e, baslik, detaylar })
	}
	static async getBrutNetToplamlariLines(e = {}) {
		let { baslik = {}, detaylar = [], exclude = {} } = e
		let { kgBrmSet = asSet(MQStok.kgBirimler) } = e
		let { eIslem = {} } = app.params
		let { miktarToplamiKilosuz, dipNetBrutKilo } = eIslem.kullanim ?? {}
		
		let { brutKiloFl = !miktarToplamiKilosuz } = e
		if (!brutKiloFl)
			exclude = { ...exclude, kgBrmSet }

		let res = []
		if (!dipNetBrutKilo)
			return res
		
		let stok2Detaylar = groupBy(
			detaylar.filter(d => d.shKod && !d.ekBilgimi),
			d => d.shKod
		)
		let sent = new MQSent({
			from: 'stkmst',
			where: { inDizi: keys(stok2Detaylar), saha: 'kod' },
			sahalar: [
				'kod', 'brmorani brmOrani', 'brm', 'brm2',
				'brutagirlik brutAgirlik', 'netagirlik netAgirlik'
			]
		})
		let stok2Rec = await sent.execSelect().then(recs =>
			fromEntries(recs.map(r => [r.kod, r])))

		let brutKilo = 0, netKilo = 0
		for (let [stokKod, detaylar] of entries(stok2Detaylar)) {
			let r = stok2Rec[stokKod]
			if (!r)
				continue

			let kgBrm1mi = Boolean(kgBrmSet[r.brm])
			let kgBrm2mi = Boolean(kgBrmSet[r.brm2])
			
			let netKGci = (
				kgBrm1mi ? ( d => d.brutMiktar || d.miktar ) :
				kgBrm2mi ? ( d => d.miktar2 ) :
				( d => roundToFra3(d.brutMiktar * r.netAgirlik) )
			)
			let digerci = (
				kgBrm1mi ? ( d => kgBrm2mi ? 0 : d.miktar2 ) :    // hem 1 hem 2 de varsa ==> 0
				// kgBrm2mi ? ( d => d.brutMiktar ) :
				( d => d.brutMiktar )
			)
			let brutKGci = ( d => roundToFra3(digerci(d) * r.brutAgirlik) )

			;detaylar.forEach(d => {
				brutKilo += brutKGci(d) || 0
				netKilo += netKGci(d) || 0
			})
			brutKilo = roundToFra3(brutKilo)
			netKilo = roundToFra3(netKilo)
		}

		let satir = [
			( brutKilo > 0 ? `Brüt Kilo: ${numberToString(brutKilo)} KG` : null ),
			( netKilo > 0 ? `Net Kilo: ${numberToString(netKilo)} KG` : null )
		].filter(Boolean).join(', ')
		if (satir)
			res.push(satir)

		return res
	}

	getEIslEkNotlar1Str(e = {}) {
		let baslik = this, { detaylar } = this
		return this.class.getEIslEkNotlar1Str({ ...e, baslik, detaylar })
	}
	static async getEIslEkNotlar1Str(e = {}) {
		let res = await this.getEIslEkNotlar1Lines(e)
		return empty(res) ? '' : res.join(CrLf)
	}
	getEIslEkNotlar1Lines(e = {}) {
		let baslik = this, { detaylar } = this
		return this.class.getEIslEkNotlar1Lines({ ...e, baslik, detaylar })
	}
	static async getEIslEkNotlar1Lines(e = {}) {
		let args = { ...e, liste: [] }
		await this.eIslEkNotlar1Duzenle(args)
		return args.liste
	}
	static async eIslEkNotlar1Duzenle(e = {}) {
		let { liste: res = [] } = e
		let { eIslem = {} } = app.params
		let { miktarToplamiKilosuz, dipNetBrutKilo } = eIslem?.kullanim ?? {}
		let brutKiloFl = !miktarToplamiKilosuz
		let kgBrmSet = asSet(MQStok.kgBirimler)
		
		;{
			let args = { ...e, brutKiloFl, kgBrmSet }
			let lines = [
				( await this.getBrutNetToplamlariLines(args) ),
				( await this.getMiktarToplamlariLines(args) )
			].flat().filter(Boolean)
			if (!empty(lines))
				res.push(...lines)
		}
	}

	getEIslEkNotlar2Str(e = {}) {
		let baslik = this, { detaylar } = this
		return this.class.getEIslEkNotlar2Str({ ...e, baslik, detaylar })
	}
	static async getEIslEkNotlar2Str(e = {}) {
		let res = await this.getEIslEkNotlar2Lines(e)
		return empty(res) ? '' : res.join(CrLf)
	}
	getEIslEkNotlar2Lines(e = {}) {
		let baslik = this, { detaylar } = this
		return this.class.getEIslEkNotlar2Lines({ ...e, baslik, detaylar })
	}
	static async getEIslEkNotlar2Lines(e = {}) {
		let args = { ...e, liste: [] }
		await this.eIslEkNotlar2Duzenle(args)
		return args.liste
	}
	static async eIslEkNotlar2Duzenle(e = {}) { }
}
